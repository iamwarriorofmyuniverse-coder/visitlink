import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  purgeExpiredCertifications,
  resolveContradictedClaim,
  ContradictedClaimTicket,
} from "../../lib/resourceful/antigaming.ts";
import { IndustryCapabilities } from "../../lib/resourceful/capabilities.ts";

describe("Anti-Gaming, Contradicted Claims & Audit Trail Engine (Phase q4)", () => {
  const initialCapabilities: IndustryCapabilities = {
    process_stages_visible: ["raw_material_prep", "primary_forming", "precision_machining"],
    technology_levels: ["cnc", "robotics"],
    live_demo_available: true,
    hands_on_available: true,
    engineer_qa_available: true,
    guide_available: true,
    estimated_interactive_minutes: 60,
    student_observation_description: "Real-world foundry melting and CNC machining.",
    briefing_room: true,
    av_equipment: true,
    safe_visitor_walkway: true,
    restrooms_available: true,
    ppe_supplied: true,
    max_group_size: 40,
    visitor_staff_count: 2,
    photos: ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"],
    admin_verified_claims: {
      process_stages_visible: true,
      technology_levels: true,
      live_demo_available: true,
      hands_on_available: true,
      engineer_qa_available: true,
      guide_available: true,
      estimated_interactive_minutes: true,
      safe_visitor_walkway: true,
      restrooms_available: true,
      ppe_supplied: true,
      briefing_room: true,
      max_group_size: true,
      visitor_staff_count: true,
    },
    certifications: [
      {
        cert_type: "ISO 9001",
        cert_file_path: "/certs/iso9001.pdf",
        expiry_date: "2025-01-01", // Expired relative to 2026
        admin_verification_status: "verified",
      },
      {
        cert_type: "ISO 45001",
        cert_file_path: "/certs/iso45001.pdf",
        expiry_date: "2028-12-31", // Active
        admin_verification_status: "verified",
      },
    ],
  };

  describe("Automatic Expiration of Industry Certifications", () => {
    it("identifies expired certificates and updates status to rejected with expiration reason", () => {
      const now = new Date("2026-10-23");
      const { activeCerts, expiredCount } = purgeExpiredCertifications(initialCapabilities.certifications, now);

      assert.equal(expiredCount, 1);
      assert.equal(activeCerts[0].admin_verification_status, "rejected");
      assert.match(activeCerts[0].rejection_reason!, /Certificate expired on 2025-01-01/);

      // Second certificate remains verified
      assert.equal(activeCerts[1].admin_verification_status, "verified");
    });
  });

  describe("Contradicted Claim Lifecycle & Admin Audit Trail", () => {
    const sampleTicket: ContradictedClaimTicket = {
      id: "ticket-101",
      industry_id: "ind-cbe-01",
      visit_request_id: "req-cbe-02",
      coordinator_id: "coord-psg-01",
      mismatch_details: "Listing stated robotic welding cell was available, but factory staff stated it was decommissioned 6 months ago.",
      status: "pending_admin_review",
      created_at: new Date().toISOString(),
    };

    it("applies 15-point penalty and records audit log when admin confirms mismatch", () => {
      const result = resolveContradictedClaim({
        ticket: sampleTicket,
        currentCapabilities: initialCapabilities,
        adminApproved: true,
        adminReason: "Confirmed via photos: robotic welding bay is no longer operational.",
        adminId: "admin-user-01",
      });

      // Verification of capabilities change
      assert.equal(result.updatedCapabilities.listing_corrected_flag, true);
      assert.match(result.updatedCapabilities.listing_corrected_reason!, /robotic welding bay is no longer operational/);

      // Score reduced by 15 points
      assert.equal(result.auditRecord.new_learning_score, result.auditRecord.previous_learning_score - 15);
      assert.equal(result.auditRecord.trigger_reason, "contradicted_claim_penalty");

      // Ticket updated to confirmed_sanctioned
      assert.equal(result.updatedTicket.status, "confirmed_sanctioned");
    });

    it("dismisses unfounded report without penalizing facility score", () => {
      const result = resolveContradictedClaim({
        ticket: sampleTicket,
        currentCapabilities: initialCapabilities,
        adminApproved: false,
        adminReason: "Dispute dismissed: Host provided video evidence demonstrating robotic cell was operating normally during visit hours.",
        adminId: "admin-user-01",
      });

      assert.equal(result.updatedCapabilities.listing_corrected_flag, undefined);
      assert.equal(result.auditRecord.new_learning_score, result.auditRecord.previous_learning_score);
      assert.equal(result.updatedTicket.status, "dismissed_unfounded");
    });
  });
});
