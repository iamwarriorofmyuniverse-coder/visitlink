"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Users,
  FileText,
  Lock,
  ArrowLeft,
  Bot,
  Send,
  GraduationCap,
  UserCheck,
  BookOpen,
  Award,
  ClipboardCheck,
  MessageSquare,
  Coffee,
  Star,
} from "lucide-react";
import VisitReadinessCard from "@/components/logistics/VisitReadinessCard";

export default function IndustryRequestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "reschedule_proposed" | "completed" | "no_show">("pending");
  const [managerNotes, setManagerNotes] = useState("");
  const [draftReply, setDraftReply] = useState(
    "Dear Coordinator, We are pleased to approve your visit request for 40 students from Mechanical Engineering. Please ensure all students arrive wearing safety shoes and safety glasses. Report to Gate 2 at 9:45 AM for the safety induction briefing."
  );
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showPostVisitModal, setShowPostVisitModal] = useState(false);
  const [newDate, setNewDate] = useState("2026-11-17");
  const [newTime, setNewTime] = useState("10:00 AM - 1:00 PM");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  // Post-Visit Verification Form State (Phase m2)
  const [attended, setAttended] = useState(true);
  const [actualHeadcount, setActualHeadcount] = useState(38);
  const [engagementRating, setEngagementRating] = useState(5);
  const [purposeObserved, setPurposeObserved] = useState<"educational" | "mixed" | "not_educational">("educational");
  const [postVisitNotes, setPostVisitNotes] = useState("");

  // Student Feedback Aggregates State for Industry Hosts (Phase p4)
  const [feedbackSimCount, setFeedbackSimCount] = useState<number>(5);

  // Logistics Readiness Evaluation for Industry Manager
  const hasLogisticsWarning = requestId.includes("warning") || requestId === "req-cbe-02" || requestId.includes("test");

  const foodLogistics = {
    status: (hasLogisticsWarning ? "warning" : "ok") as "ok" | "warning",
    flags: hasLogisticsWarning
      ? ["Meal headcount (65) exceeds facility canteen capacity (50)."]
      : [],
    details: hasLogisticsWarning
      ? "Meal headcount (65) exceeds facility canteen capacity (50)."
      : "Canteen available (veg, non_veg). Capacity sufficient for 40 students.",
  };

  const parkingLogistics = {
    status: (hasLogisticsWarning ? "warning" : "ok") as "ok" | "warning",
    flags: hasLogisticsWarning
      ? ["Requested buses (4) exceed facility bus parking bays (2)."]
      : [],
    details: hasLogisticsWarning
      ? "Requested buses (4) exceed facility bus parking bays (2)."
      : "Parking allocated: 1 bus bay and 2 car bays. Max vehicle height: 4.5m.",
    entryGateInstructions:
      "Gate 2 (Heavy Vehicle & Logistics Gate) on Avinashi Road; driver must register at security post.",
    maxVehicleHeightM: 4.5,
  };

  const trafficLogistics = {
    status: "warning" as const,
    distanceKm: 18.5,
    durationMinutes: 37,
    peakHourRisk: true,
    peakWindowName: "Morning Peak",
    suggestedDepartureTime: "08:38",
    details:
      "Estimated travel time: 37 mins (18.5 km). Morning Peak traffic expected along route. Suggested departure: 08:38 to ensure on-time arrival.",
    provider: "OpenRouteService",
  };

  const weatherLogistics = {
    status: (hasLogisticsWarning ? "warning" : "ok") as "ok" | "warning",
    riskType: (hasLogisticsWarning ? "rain_risk" : "none") as "none" | "rain_risk",
    temperatureC: 29.5,
    rainProbability: hasLogisticsWarning ? 75 : 15,
    weatherCode: hasLogisticsWarning ? 61 : 1,
    weatherDescription: hasLogisticsWarning ? "Rain showers" : "Mainly clear",
    details: hasLogisticsWarning
      ? "Rain Risk: High rain probability (75%) forecast on visit date for outdoor operations."
      : "Forecast: Mainly clear. Max temp 31°C, rain probability 15%. Conditions favorable.",
    flags: hasLogisticsWarning
      ? ["Rain Risk: High rain probability (75%) for outdoor facility operations."]
      : [],
    canProposeReschedule: hasLogisticsWarning,
    attribution: "Weather data by Open-Meteo.com",
  };

  // Simulated Atomic RPC Approval
  function handleApprove() {
    setActionMsg(null);
    setStatus("approved");
    setActionMsg({
      type: "success",
      text: "Request approved! Slot capacity safely decremented. Coordinator has been notified via email.",
    });
  }

  function handleReject() {
    setStatus("rejected");
    setActionMsg({
      type: "error",
      text: "Request rejected. Coordinator notified with reason.",
    });
  }

  function handleProposeReschedule(e: React.FormEvent) {
    e.preventDefault();
    setStatus("reschedule_proposed");
    setShowRescheduleModal(false);
    setActionMsg({
      type: "success",
      text: `Reschedule proposal sent to coordinator for ${newDate} (${newTime}).`,
    });
  }

  function handlePostVisitSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowPostVisitModal(false);

    if (!attended) {
      setStatus("no_show");
      setActionMsg({
        type: "warning",
        text: "Visit recorded as No-Show. Notice submitted to Admin Review queue for non-appearance investigation.",
      });
      return;
    }

    if (purposeObserved === "not_educational") {
      setStatus("completed");
      setActionMsg({
        type: "warning",
        text: "Post-visit verification submitted with 'Not Educational' flag. Report has been queued for human Admin Review before any strike penalty is assessed.",
      });
      return;
    }

    setStatus("completed");
    setActionMsg({
      type: "success",
      text: `Post-visit verification saved! Rated ${engagementRating}/5 stars. Request marked completed.`,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-4xl">
      <Link
        href="/industry"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Host Dashboard
      </Link>

      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">Request #{requestId}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  status === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : status === "reschedule_proposed"
                    ? "bg-blue-100 text-blue-800"
                    : status === "completed"
                    ? "bg-purple-100 text-purple-800"
                    : status === "no_show"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              PSG College of Technology [Demo]
            </h1>
            <p className="text-xs text-slate-500">
              Department: 4th Sem B.E. Mechanical Engineering | Institution Tier: <strong className="text-slate-700">Verified (Score: 78/100)</strong>
            </p>
          </div>

          {/* Action Buttons if Pending */}
          {status === "pending" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRescheduleModal(true)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Propose Reschedule
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
              >
                Approve (Atomic Check)
              </button>
            </div>
          )}

          {/* Post-Visit Verification Button if Approved */}
          {status === "approved" && (
            <button
              type="button"
              onClick={() => setShowPostVisitModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 flex items-center gap-1.5 transition"
            >
              <ClipboardCheck className="h-4 w-4" />
              Verify Post-Visit Attendance
            </button>
          )}
        </div>

        {actionMsg && (
          <div
            className={`p-4 rounded-xl border text-sm font-medium ${
              actionMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : actionMsg.type === "warning"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            {actionMsg.text}
          </div>
        )}

        {/* Visit Readiness & Logistics Card */}
        <VisitReadinessCard
          food={foodLogistics}
          parking={parkingLogistics}
          traffic={trafficLogistics}
          weather={weatherLogistics}
          isApproved={status === "approved"}
          canProposeReschedule={true}
          onProposeReschedule={() => setShowRescheduleModal(true)}
        />

        {/* AI Triage Pre-Screening Report (Phase m4: Intent-Quality Extension) */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              AI Triage Intent-Quality & Safety Pre-Screening Report
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verdict: PASS (High Intent Quality)
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Validated by Pydantic rule schema. AI intent pre-screening is strictly flag-only (never auto-rejects); the industry manager retains full decision authority.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Objective Specificity</span>
                <span className="text-emerald-600 font-bold">0.92 / 1.0</span>
              </div>
              <p className="text-slate-500">Concrete technical processes (green sand casting, CMM metrology).</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Syllabus Alignment</span>
                <span className="text-emerald-600 font-bold">0.88 / 1.0</span>
              </div>
              <p className="text-slate-500">Directly maps to Unit 3 Casting & Metallurgy coursework.</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Agenda Realism</span>
                <span className="text-emerald-600 font-bold">High (3.0 hrs)</span>
              </div>
              <p className="text-slate-500">Realistic time windows for foundry floor and inspection lab.</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Group Size Check</span>
                <span className="text-emerald-600 font-bold">Passed (40 / 45 max)</span>
              </div>
              <p className="text-slate-500">Within single-slot attendee ceiling.</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Teacher Ratio</span>
                <span className="text-emerald-600 font-bold">Passed (1:13.3)</span>
              </div>
              <p className="text-slate-500">Exceeds mandatory 1:15 safety minimum.</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Anti-Leisure Check</span>
                <span className="text-emerald-600 font-bold">Clean (0 Flags)</span>
              </div>
              <p className="text-slate-500">Zero sightseeing or holiday outing keywords.</p>
            </div>
          </div>

          {/* Draft Reply Generator */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              AI-Generated Draft Reply (Editable by Manager)
            </label>
            <textarea
              rows={3}
              value={draftReply}
              onChange={(e) => setDraftReply(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Declared Academic Intent Card (Phase m1) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Institution Declared Academic Intent & Faculty Sponsor
            </h2>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              Verified Institutional Domain
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Course & Syllabus Topic</span>
              <p className="text-slate-900 font-semibold mt-0.5">Manufacturing Technology & Machine Tools</p>
              <p className="text-slate-600">Unit 3: Metal Casting Processes & High-Pressure Die Casting</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">Faculty-In-Charge Sponsor</span>
              <p className="text-slate-900 font-semibold mt-0.5">Dr. R. Karthikeyan (Mobile: +91 94432 18920)</p>
              <p className="text-emerald-700 font-medium">Email: karthikeyan.mech@psgtech.edu (Verified)</p>
            </div>
          </div>

          <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100 text-xs space-y-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-purple-600" />
              Student Learning Objectives:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Study automated green sand moulding lines, cupola furnace melting, and non-destructive casting flaw inspections.</li>
              <li>Observe CNC precision machining operations and coordinate measuring machine (CMM) quality metrology workflows.</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Pre-Visit Plant Agenda</span>
            <p className="text-slate-700 leading-relaxed">
              Detailed 3-hour plant walkthrough: 45m cupola furnace & casting floor, 45m CNC machining shop, 45m metrology inspection lab, 45m Q&A with chief metallurgist.
            </p>
          </div>
        </div>

        {/* Visit Details & Roster Link */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Visit Parameters & Compliance Docs</h2>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Requested Date</span>
              <strong className="text-slate-900 text-sm">Tuesday, Nov 10, 2026</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Slot Window</span>
              <strong className="text-slate-900 text-sm">10:00 AM - 1:00 PM</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Headcount</span>
              <strong className="text-slate-900 text-sm">40 Students, 3 Faculty</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Indemnity Accepted</span>
              <strong className="text-emerald-700 text-sm">Yes (Confirmed)</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Planned Social Break</span>
              <strong className="text-slate-900 text-sm">15 Mins (0-30m cap)</strong>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Student_Roster_Signed_Undertaking.pdf
                </p>
                <p className="text-[11px] text-slate-500">
                  Private bucket storage | 5-minute ephemeral signed URL
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert("Downloading signed student roster with parental consent attachments...")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Download Signed Roster
            </button>
          </div>
        </div>

        {/* Anonymous Student Feedback Aggregates for Industry Hosts (Phase p4) */}
        {(status === "approved" || status === "completed") && (
          <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-teal-600" />
                  Anonymous Student Feedback (Educational Evaluation)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate ratings from participating students. Enforces server-side anonymity protection (min 5 responses).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Test Simulation:</span>
                <button
                  type="button"
                  onClick={() => setFeedbackSimCount(4)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                    feedbackSimCount === 4
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  4 Responses (&lt; 5)
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackSimCount(5)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                    feedbackSimCount === 5
                      ? "bg-teal-100 text-teal-800 border-teal-300"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  5 Responses (Threshold Met)
                </button>
              </div>
            </div>

            {feedbackSimCount < 5 ? (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Lock className="h-4 w-4 text-amber-600" />
                  Server-Enforced Anonymity Shield Active ({feedbackSimCount} of 5 Responses Received)
                </div>
                <p className="leading-relaxed">
                  Aggregates hidden to protect individual student anonymity. Feedback metrics and qualitative suggestions unlock only when at least <strong>5 student responses</strong> have been submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-teal-800">
                      Student Usefulness Score
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-teal-900">4.8</span>
                      <span className="text-xs font-semibold text-teal-700">/ 5.0 (5 responses)</span>
                    </div>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-800">
                      Student Engagement Score
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-blue-900">4.7</span>
                      <span className="text-xs font-semibold text-blue-700">/ 5.0 (5 responses)</span>
                    </div>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">
                    Verified Technical Highlights from Students:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>&ldquo;Seeing the automated green sand moulding lines and pouring process in real-time made our textbook foundry concepts completely clear.&rdquo;</li>
                    <li>&ldquo;The 30-minute technical Q&A with the chief metallurgist on casting shrinkage defects was top notch.&rdquo;</li>
                  </ul>
                  <div className="pt-2 border-t border-slate-200 text-slate-600">
                    <strong>Suggestions for Host:</strong> &ldquo;Would love 15 minutes extra time in the CMM metrology inspection bay.&rdquo;
                  </div>
                </div>

                <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 border border-slate-200 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Host Advisory Note:</strong> Student feedback ratings celebrate positive engagement and feed your facility&apos;s educational profile. Feedback is strictly isolated from institution strikes or compliance tiers.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Post-Visit Verification Modal (Phase m2) */}
        {showPostVisitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  Post-Visit Industry Verification
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPostVisitModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Confirm whether the visiting college attended as scheduled and evaluate their academic engagement. Honest feedback protects host industries from recreational visit abuse.
              </p>

              <form onSubmit={handlePostVisitSubmit} className="space-y-4">
                {/* Attended Check */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                    Did the institution group attend the visit? *
                  </label>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="attended"
                        checked={attended}
                        onChange={() => setAttended(true)}
                        className="text-blue-600"
                      />
                      Yes, group attended
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="attended"
                        checked={!attended}
                        onChange={() => setAttended(false)}
                        className="text-red-600"
                      />
                      No, group was a No-Show
                    </label>
                  </div>
                </div>

                {attended && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="actualHeadcount" className="block text-xs font-semibold text-slate-700 uppercase">
                          Actual Student Headcount *
                        </label>
                        <input
                          id="actualHeadcount"
                          type="number"
                          min="1"
                          required
                          value={actualHeadcount}
                          onChange={(e) => setActualHeadcount(parseInt(e.target.value) || 0)}
                          className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="engagementRating" className="block text-xs font-semibold text-slate-700 uppercase">
                          Student Engagement Rating (1-5) *
                        </label>
                        <select
                          id="engagementRating"
                          value={engagementRating}
                          onChange={(e) => setEngagementRating(parseInt(e.target.value))}
                          className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
                        >
                          <option value={5}>5 - Excellent (Highly engaged, curious, technical Q&A)</option>
                          <option value={4}>4 - Good (Attentive and disciplined)</option>
                          <option value={3}>3 - Moderate (Mixed attention, average interest)</option>
                          <option value={2}>2 - Poor (Passive, minimal interaction)</option>
                          <option value={1}>1 - Disengaged (Distracted, uninterested)</option>
                        </select>
                      </div>
                    </div>

                    {/* Purpose Observed */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Observed Purpose of Visit *
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="purposeObserved"
                            value="educational"
                            checked={purposeObserved === "educational"}
                            onChange={() => setPurposeObserved("educational")}
                            className="mt-0.5"
                          />
                          <div>
                            <strong className="text-slate-900 block">Educational (Genuine Academic Value)</strong>
                            <span className="text-slate-500">Students asked syllabus-relevant questions, took notes, and respected industrial engineering guidelines.</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="purposeObserved"
                            value="mixed"
                            checked={purposeObserved === "mixed"}
                            onChange={() => setPurposeObserved("mixed")}
                            className="mt-0.5"
                          />
                          <div>
                            <strong className="text-slate-900 block">Mixed (Partial Academic Focus)</strong>
                            <span className="text-slate-500">Some learning observed, but significant idle time or superficial interest.</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-300 bg-amber-50 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="purposeObserved"
                            value="not_educational"
                            checked={purposeObserved === "not_educational"}
                            onChange={() => setPurposeObserved("not_educational")}
                            className="mt-0.5"
                          />
                          <div>
                            <strong className="text-amber-900 block">Not Educational (Leisure / Sightseeing Abuse)</strong>
                            <span className="text-amber-700">Treated plant as a picnic or tourist excursion; no academic seriousness; wasted engineering staff time.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Human-in-the-loop Safeguard Notice if Not Educational */}
                    {purposeObserved === "not_educational" && (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          Human-in-the-Loop Anti-Abuse Protection
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          VisitLink guarantees fair treatment. A &quot;Not educational&quot; report does <strong>not</strong> automatically penalize or strike an institution. It will be reviewed by a human platform admin with submitted evidence before any strike is counted.
                        </p>
                      </div>
                    )}

                    <div>
                      <label htmlFor="postVisitNotes" className="block text-xs font-semibold text-slate-700 uppercase">
                        Confidential Host Notes / Evidence (Optional)
                      </label>
                      <textarea
                        id="postVisitNotes"
                        rows={2}
                        placeholder="Detail student engagement or specific issues observed..."
                        value={postVisitNotes}
                        onChange={(e) => setPostVisitNotes(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPostVisitModal(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm"
                  >
                    Submit Post-Visit Verification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reschedule Proposal Modal */}
        {showRescheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Propose Alternative Visit Date</h3>
              <p className="text-xs text-slate-500">
                Offer an alternative slot due to weather advisory or capacity constraints. The coordinator will be notified to review and accept.
              </p>

              <form onSubmit={handleProposeReschedule} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Proposed Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Time Window
                  </label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm"
                  >
                    <option value="10:00 AM - 1:00 PM">Morning Slot (10:00 AM - 1:00 PM)</option>
                    <option value="2:00 PM - 5:00 PM">Afternoon Slot (2:00 PM - 5:00 PM)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 shadow-sm"
                  >
                    Send Reschedule Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}