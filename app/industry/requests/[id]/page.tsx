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
} from "lucide-react";
import VisitReadinessCard from "@/components/logistics/VisitReadinessCard";

export default function IndustryRequestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "reschedule_proposed">("pending");
  const [managerNotes, setManagerNotes] = useState("");
  const [draftReply, setDraftReply] = useState(
    "Dear Coordinator, We are pleased to approve your visit request for 40 students from Mechanical Engineering. Please ensure all students arrive wearing safety shoes and safety glasses. Report to Gate 2 at 9:45 AM for the safety induction briefing."
  );
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState("2026-11-17");
  const [newTime, setNewTime] = useState("10:00 AM - 1:00 PM");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Logistics Readiness Evaluation for Industry Manager
  // Flag both parking and weather warning if requestId is req-cbe-02 or includes "warning" or "test"
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
              Department: 4th Sem B.E. Mechanical Engineering | Submitted 2 days ago
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
        </div>

        {actionMsg && (
          <div
            className={`p-4 rounded-xl border text-sm font-medium ${
              actionMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
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

        {/* AI Triage Pre-Screening Report */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              AI Triage Pre-Screening Report
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verdict: PASS (Low Risk)
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Validated by Pydantic rule schema. Evaluated request attributes against facility safety rules:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Group Size Check</span>
                <span className="text-emerald-600 font-bold">Passed (40 / 45 max)</span>
              </div>
              <p className="text-slate-500">Group fits within maximum single-slot attendee ceiling.</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Teacher Ratio Check</span>
                <span className="text-emerald-600 font-bold">Passed (3 teachers / 40 students)</span>
              </div>
              <p className="text-slate-500">Ratio is 1:13.3 (exceeds mandatory 1:15 minimum).</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Minors Status</span>
                <span className="text-emerald-600 font-bold">Passed (Zero Minors)</span>
              </div>
              <p className="text-slate-500">All participating college students are 18+ years old.</p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span>Syllabus Alignment</span>
                <span className="text-purple-600 font-bold">High (0.88 match)</span>
              </div>
              <p className="text-slate-500">Strong correlation with foundry casting & metallurgy courses.</p>
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

        {/* Visit Details & Roster Link */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Visit Parameters & Compliance Docs</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
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
