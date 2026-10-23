"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Building2,
  School,
  ShieldAlert,
  Scale,
  Award,
  Users,
  Eye,
  Check,
  Ban,
  RotateCcw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"strikes" | "verifications" | "trust_directory">("strikes");

  // State for simulated strikes & appeals
  const [strike1Status, setStrike1Status] = useState<"pending" | "approved" | "dismissed">("pending");
  const [appeal1Status, setAppeal1Status] = useState<"pending" | "granted" | "rejected">("pending");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "warning"; text: string } | null>(null);

  // Institutions Trust Directory State
  const [institutions, setInstitutions] = useState([
    {
      id: "inst-psg-tech",
      name: "PSG College of Technology",
      tier: "trusted",
      score: 94.5,
      completedVisits: 14,
      strikes: 0,
      allowFreemail: false,
    },
    {
      id: "inst-cit",
      name: "Coimbatore Institute of Technology (CIT)",
      tier: "trusted",
      score: 89.0,
      completedVisits: 10,
      strikes: 0,
      allowFreemail: false,
    },
    {
      id: "inst-kct",
      name: "Kumaraguru College of Technology (KCT)",
      tier: "verified",
      score: 76.0,
      completedVisits: 5,
      strikes: 0,
      allowFreemail: false,
    },
    {
      id: "inst-rural-poly",
      name: "Pollachi Rural Polytechnic Institute",
      tier: "new",
      score: 50.0,
      completedVisits: 1,
      strikes: 0,
      allowFreemail: true, // rural school override
    },
    {
      id: "inst-pioneer",
      name: "Pioneer Valley Engineering College",
      tier: "restricted",
      score: 25.0,
      completedVisits: 4,
      strikes: 3,
      allowFreemail: false,
    },
  ]);

  function handleApproveStrike() {
    setStrike1Status("approved");
    setFeedbackMsg({
      type: "warning",
      text: "Strike approved after human admin review. 1 Strike recorded against Pioneer Valley Engineering College. Trust Score deducted (-25.0 pts). Institution tier recomputed.",
    });
  }

  function handleDismissStrike() {
    setStrike1Status("dismissed");
    setFeedbackMsg({
      type: "success",
      text: "Complaint dismissed. Evidence deemed insufficient to warrant formal strike penalty. Institution notified.",
    });
  }

  function handleGrantAppeal() {
    setAppeal1Status("granted");
    setFeedbackMsg({
      type: "success",
      text: "Appeal granted! Restriction lifted for Pioneer Valley Engineering College. Tier restored to Verified with 30-day provisional monitoring.",
    });
  }

  function handleRejectAppeal() {
    setAppeal1Status("rejected");
    setFeedbackMsg({
      type: "warning",
      text: "Appeal rejected. Restricted status maintained due to repeated non-educational visit conduct.",
    });
  }

  function toggleFreemailOverride(id: string) {
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id ? { ...inst, allowFreemail: !inst.allowFreemail } : inst
      )
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Platform Admin & Anti-Abuse Center
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Human-in-the-loop strike audits, unfair penalty safeguards, institution trust tiers, and entity onboarding.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("strikes")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "strikes"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Strike & Appeal Audits (2)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trust_directory")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "trust_directory"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Trust Directory & Freemail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("verifications")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "verifications"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Entity Onboarding (2)
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`mt-4 p-4 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-850"
              : "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-850"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Pending Strike Audits
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">1</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Human-in-the-loop review</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Active Appeals
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">1</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Restricted institution appeal</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Trusted Institutions
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">2</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tier score &ge; 85, 8+ visits</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Restricted Institutions
          </span>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">1</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">3 strikes in 12 months</p>
        </div>
      </div>

      {/* TAB 1: STRIKE & APPEAL AUDITS */}
      {activeTab === "strikes" && (
        <div className="mt-8 space-y-6">
          {/* Strike Queue */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Pending Strike Complaints (Safeguard Against Unilateral Penalties)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Host industry managers can flag &quot;Not educational&quot; visits, but platform policy requires human admin review of all submitted evidence before any strike counts against an institution.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/30">
                {strike1Status === "pending" ? "1 Pending Review" : "0 Pending"}
              </span>
            </div>

            {strike1Status === "pending" ? (
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Complaint: &quot;Not Educational / Leisure Abuse&quot;
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Reporting Facility: <strong>Kovai Precision Foundry & Heavy Castings</strong> | Reported Institution: <strong>Pioneer Valley Engineering College</strong>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800">
                    Strike #3 Investigation (Risk of Tier Restriction)
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-amber-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Host Facility Evidence & Incident Report:</span>
                  <p className="leading-relaxed">
                    &ldquo;Students arrived 45 minutes late. During the cupola molten tapping demonstration, students did not take notes or observe safety walkways; several were taking selfies next to the heavy ladle crane. Faculty coordinator left students unattended in the parking area for over an hour. This was treated as a leisure outing rather than a technical manufacturing study.&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Attached Evidence: Security Gate Log timestamp (10:45 AM arrival) & CCTV shop-floor footage.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDismissStrike}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <XCircle className="h-3.5 w-3.5 text-slate-500" />
                    Dismiss (Insufficient Grounds)
                  </button>
                  <button
                    type="button"
                    onClick={handleApproveStrike}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 shadow-sm transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve Strike & Demote Tier
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Strike review resolved: Status is <strong>{strike1Status.toUpperCase()}</strong>.</span>
                <button
                  type="button"
                  onClick={() => setStrike1Status("pending")}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Demo
                </button>
              </div>
            )}
          </div>

          {/* Appeals Queue */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Appeals Queue for Restricted Institutions
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Restricted institutions may submit formal appeals with remedial faculty undertakings. Restrictions are never irreversible permanent bans.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-500/30">
                {appeal1Status === "pending" ? "1 Appeal Pending" : "0 Appeals"}
              </span>
            </div>

            {appeal1Status === "pending" ? (
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Appeal Case #APP-2026-09: Reinstatement Request
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Appellant: <strong>Pioneer Valley Engineering College</strong> | Restricted Since: Oct 12, 2026
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-transparent dark:border-purple-800">
                    Dean Undertaking Submitted
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Appellant Statement & Remedial Measures:</span>
                  <p className="leading-relaxed">
                    &ldquo;Our institution has instituted a mandatory pre-visit briefing protocol for all student delegations. A new Senior Faculty Coordinator has been appointed, and a formal institutional disciplinary warning was issued to the previous faculty in charge. We request reinstatement to Verified tier so our students may participate in curriculum-mandated visits.&rdquo;
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Attached Document: Dean_Signed_Compliance_Undertaking_2026.pdf
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRejectAppeal}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 transition"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Reject Appeal
                  </button>
                  <button
                    type="button"
                    onClick={handleGrantAppeal}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Grant Appeal & Reinstate
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Appeal resolved: Status is <strong>{appeal1Status.toUpperCase()}</strong>.</span>
                <button
                  type="button"
                  onClick={() => setAppeal1Status("pending")}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RotateCcw className="h-3 w-3" /> Reset Demo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TRUST DIRECTORY & FREEMAIL OVERRIDES */}
      {activeTab === "trust_directory" && (
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Institution Trust Tiers & Rural Freemail Overrides
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trust scores are calculated deterministically from on-time report submissions, average industry engagement ratings, and strike penalties.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Institution</th>
                  <th className="py-3 px-3">Trust Tier</th>
                  <th className="py-3 px-3">Trust Score</th>
                  <th className="py-3 px-3">Completed Visits</th>
                  <th className="py-3 px-3">Strikes</th>
                  <th className="py-3 px-3">Consumer Freemail Policy</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {inst.name}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                          inst.tier === "trusted"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800"
                            : inst.tier === "verified"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-transparent dark:border-blue-800"
                            : inst.tier === "new"
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300"
                            : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-transparent dark:border-red-800"
                        }`}
                      >
                        {inst.tier}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {inst.score.toFixed(1)} / 100
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {inst.completedVisits} visits
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${inst.strikes > 0 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}>
                        {inst.strikes} {inst.strikes === 1 ? "strike" : "strikes"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {inst.allowFreemail ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Override Enabled (Rural / Exemption)
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">
                          Strict (.edu domain mandatory)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => toggleFreemailOverride(inst.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-[11px]"
                      >
                        {inst.allowFreemail ? "Revoke Override" : "Allow Freemail"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ENTITY ONBOARDING */}
      {activeTab === "verifications" && (
        <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Entity Verification Queue</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review official registration documentation before granting verified badge.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/30">
              2 Pending Review
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Queue Item 1 */}
            <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Marudham Automated Textile Machineries [Demo]
                  </span>
                  <span className="rounded bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800">
                    Industry / Facility
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Location: Mettupalayam Highway, Periyanaickenpalayam | Sector: Textiles
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  Attached: Factory_License_Certificate_2026.pdf (Verified GST/CIN)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("Verification approved. Facility is now verified and active in public search.")}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve & Verify
                </button>
                <button
                  type="button"
                  onClick={() => alert("Verification rejected with request for additional documentation.")}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 transition"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </div>
            </div>

            {/* Queue Item 2 */}
            <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Kumaraguru College of Technology (KCT) [Demo]
                  </span>
                  <span className="rounded bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300 border border-transparent dark:border-purple-800">
                    Institution
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Location: Athipalayam Road, Chinnavedampatti | Affiliation: Anna University Autonomous
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  Attached: AICTE_Affiliation_Order_2026.pdf
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("Verification approved. College coordinator can now submit visit requests.")}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve & Verify
                </button>
                <button
                  type="button"
                  onClick={() => alert("Verification rejected.")}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 transition"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}