"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  Star,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function CoordinatorRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [status, setStatus] = useState<"pending" | "approved" | "reschedule_proposed" | "completed">("approved");
  const [rescheduleAccepted, setRescheduleAccepted] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-4xl">
      <Link
        href="/coordinator"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Coordinator Dashboard
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">Request #{requestId}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  status === "approved"
                    ? "bg-emerald-100 text-emerald-800"
                    : status === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : status === "reschedule_proposed"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {status.replace("_", " ")}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Kovai Precision Foundry & Heavy Castings [Demo]
            </h1>
            <p className="text-xs text-slate-500">
              Sector: Foundry & Heavy Castings | Malumichampatti, Coimbatore
            </p>
          </div>

          <div className="flex items-center gap-2">
            {status === "approved" && (
              <button
                type="button"
                onClick={() => setStatus("completed")}
                className="px-3.5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition"
              >
                Mark Visit Completed
              </button>
            )}
            {status === "completed" && (
              <Link
                href={`/feedback/${requestId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
              >
                <Star className="h-4 w-4" />
                Submit Visit Feedback
              </Link>
            )}
          </div>
        </div>

        {/* Reschedule Proposal Banner if applicable */}
        {status === "reschedule_proposed" && !rescheduleAccepted && (
          <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Industry Manager Proposed an Alternative Date
            </div>
            <p className="text-xs text-amber-700">
              The facility has limited capacity on your requested date and has offered the following alternative:
            </p>
            <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs font-semibold text-slate-900">
              Proposed Date: Tuesday, Nov 17, 2026 (10:00 AM - 1:00 PM)
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setRescheduleAccepted(true);
                  setStatus("approved");
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                Accept New Date
              </button>
              <button
                type="button"
                onClick={() => alert("Reschedule declined. Request cancelled.")}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Decline & Cancel
              </button>
            </div>
          </div>
        )}

        {/* Progress Stepper */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
            Visit Progress Timeline
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              1. Submitted
            </div>
            <div
              className={`p-2 rounded-lg font-semibold border ${
                status === "approved" || status === "completed"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              2. Host Approved
            </div>
            <div
              className={`p-2 rounded-lg font-semibold border ${
                status === "completed"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              3. Visit Completed
            </div>
            <div
              className={`p-2 rounded-lg font-semibold border ${
                status === "completed"
                  ? "bg-blue-50 text-blue-800 border-blue-200"
                  : "bg-slate-100 text-slate-400 border-slate-200"
              }`}
            >
              4. Mutual Feedback
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Visit Parameters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Date</span>
              <strong className="text-slate-900 text-sm">Tuesday, Nov 10, 2026</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Time Window</span>
              <strong className="text-slate-900 text-sm">10:00 AM - 1:00 PM</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Group Size</span>
              <strong className="text-slate-900 text-sm">40 Students (3 Teachers)</strong>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Minors Present</span>
              <strong className="text-slate-900 text-sm">No (All 18+)</strong>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase mb-1">
              Safety Briefing & Gate Instructions from Facility Head:
            </h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              &ldquo;Please ensure all 40 students arrive wearing safety shoes and safety glasses. Report to Gate 2 at 9:45 AM for the safety induction briefing. No mobile phones permitted on the main casting shop floor.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
