"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
  GraduationCap,
  Upload,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import VisitReadinessCard from "@/components/logistics/VisitReadinessCard";

export default function CoordinatorRequestDetailsPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [status, setStatus] = useState<"pending" | "approved" | "reschedule_proposed" | "completed" | "unverified" | "no_show">("approved");
  const [rescheduleAccepted, setRescheduleAccepted] = useState(false);
  const [reportFile, setReportFile] = useState<string | null>(null);
  const [reportUploaded, setReportUploaded] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  // Intent State from session storage if available
  const [intent, setIntent] = useState({
    course_name: "Manufacturing Technology & Machine Tools",
    semester_class: "4th Sem B.E. Mechanical Engineering",
    syllabus_topic: "Unit 3: Metal Casting Processes & High-Pressure Die Casting",
    learning_objectives: [
      "Study automated green sand moulding lines, cupola furnace melting, and non-destructive casting flaw inspections.",
      "Observe CNC precision machining operations and coordinate measuring machine (CMM) quality metrology workflows.",
    ],
    pre_visit_agenda:
      "Detailed 3-hour plant walkthrough: 45m cupola furnace & casting floor, 45m CNC machining shop, 45m metrology inspection lab, 45m Q&A with chief metallurgist.",
    expected_deliverable: "report",
    faculty_name: "Dr. R. Karthikeyan",
    faculty_email: "karthikeyan.mech@psgtech.edu",
    faculty_phone: "+91 94432 18920",
    faculty_email_verified: true,
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("last_visit_intent");
      if (stored) {
        const parsed = JSON.parse(stored);
        setIntent((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  function handleReportUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setReportFile(file.name);
      setReportUploaded(true);
      setUploadMsg("Visit report submitted successfully! Institutional trust score updated (+50 pts on-time bonus).");
    }
  }

  // Logistics Readiness Evaluation for Coordinator
  const hasLogisticsWarning = requestId.includes("warning") || requestId === "req-cbe-02";

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
                    : status === "unverified"
                    ? "bg-purple-100 text-purple-800"
                    : status === "no_show"
                    ? "bg-red-100 text-red-800"
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
                Simulate Post-Visit Completion
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
              The facility has limited capacity or weather advisory on your requested date and has offered the following alternative:
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

        {/* Unified Visit Readiness & Logistics Card */}
        <VisitReadinessCard
          food={foodLogistics}
          parking={parkingLogistics}
          traffic={trafficLogistics}
          weather={weatherLogistics}
          isApproved={status === "approved" || status === "completed"}
        />

        {/* Mandatory Educational Intent Card (Phase m1) */}
        <div className="p-6 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              Verified Educational Intent & Academic Sponsoring
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Academic Anti-Abuse Pass
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Course & Class</span>
              <p className="font-semibold text-slate-900">{intent.course_name}</p>
              <p className="text-slate-600">{intent.semester_class}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Syllabus Topic</span>
              <p className="font-semibold text-slate-900">{intent.syllabus_topic}</p>
              <p className="text-slate-600">Expected Deliverable: <strong className="capitalize">{intent.expected_deliverable}</strong></p>
            </div>
          </div>

          <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-purple-600" />
              Declared Learning Objectives
            </span>
            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700">
              {intent.learning_objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Plant Observation Agenda</span>
            <p className="text-slate-700 leading-relaxed">{intent.pre_visit_agenda}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span>
                Faculty-In-Charge: <strong>{intent.faculty_name}</strong> ({intent.faculty_phone})
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Verified Email: {intent.faculty_email}
            </span>
          </div>
        </div>

        {/* Post-Visit Report Upload & Verification Card (Phase m2) */}
        {(status === "completed" || status === "approved") && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Post-Visit Report & Learning Summary (7-Day Requirement)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutions must submit a technical visit report or learning summary within 7 days of visit completion to maintain Verified/Trusted status.
                </p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                reportUploaded ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {reportUploaded ? "Report Submitted" : "Pending Submission (Day 2 of 7)"}
              </span>
            </div>

            {uploadMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{uploadMsg}</span>
              </div>
            )}

            {!reportUploaded ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Upload Student Visit Report (PDF / DOCX, Max 10MB)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      System automatically schedules reminder alerts at Day 3 and Day 6 if unsubmitted.
                    </span>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition">
                    <Upload className="h-3.5 w-3.5" />
                    Upload Report
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleReportUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-700" />
                  <span className="font-semibold text-emerald-900">
                    {reportFile || "PSG_Mechanical_Industrial_Visit_Report.pdf"}
                  </span>
                </div>
                <span className="text-emerald-700 font-medium">On-Time Submission Confirmed</span>
              </div>
            )}
          </div>
        )}

        {/* Visit Parameters Card */}
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
              &ldquo;Please ensure all students arrive wearing safety shoes and safety glasses. Report to Gate 2 at 9:45 AM for the safety induction briefing. No mobile phones permitted on the main casting shop floor.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}