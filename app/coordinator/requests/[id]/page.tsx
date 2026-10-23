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
  Sparkles,
  Link2,
  Award,
  Printer,
  Lock,
  MessageSquare,
  Coffee,
  Check,
  Edit3,
} from "lucide-react";
import VisitReadinessCard from "@/components/logistics/VisitReadinessCard";
import {
  draftObservationSheetLocally,
  validateObservationSheet,
  canPrintObservationSheet,
  type ObservationSheetData,
} from "@/lib/engagement/observation_sheet";
import {
  calculateFeedbackAggregates,
  type StoredFeedbackRecord,
} from "@/lib/engagement/feedback";
import {
  buildCertificateTemplate,
  validateSocialBreakMinutes,
} from "@/lib/engagement/certificate";

export default function CoordinatorRequestDetailsPage() {
  const params = useParams();
  const requestId = params.id as string;

  const [status, setStatus] = useState<"pending" | "approved" | "reschedule_proposed" | "completed" | "unverified" | "no_show">("approved");
  const [rescheduleAccepted, setRescheduleAccepted] = useState(false);
  const [reportFile, setReportFile] = useState<string | null>(null);
  const [reportUploaded, setReportUploaded] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  // Student Engagement & Token State (Phase p2)
  const [briefToken, setBriefToken] = useState("demo-brief-valid-128bit-token-cbe");
  const [isBriefRevoked, setIsBriefRevoked] = useState(false);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  function handleCopyBriefLink() {
    const url = `${window.location.origin}/brief/${isBriefRevoked ? "revoked" : briefToken}`;
    navigator.clipboard.writeText(url);
    setCopyMsg("Brief link copied to clipboard!");
    setTimeout(() => setCopyMsg(null), 3000);
  }

  function handleRevokeBriefToken() {
    setIsBriefRevoked(true);
    setCopyMsg("Token revoked. Students accessing the link will now receive a secure 404.");
    setTimeout(() => setCopyMsg(null), 3000);
  }

  // Student Feedback & Anonymous Rating State (Phase p4)
  const [feedbackToken, setFeedbackToken] = useState("demo-feedback-valid-128bit-token-cbe");
  const [feedbackCopyMsg, setFeedbackCopyMsg] = useState<string | null>(null);
  const [feedbackSimulationCount, setFeedbackSimulationCount] = useState<number>(5);

  function handleCopyFeedbackLink() {
    const url = `${window.location.origin}/feedback/student/${feedbackToken}`;
    navigator.clipboard.writeText(url);
    setFeedbackCopyMsg("Anonymous feedback link copied!");
    setTimeout(() => setFeedbackCopyMsg(null), 3000);
  }

  // Student Observation Sheet State & Faculty Review (Phase p3)
  const [sheet, setSheet] = useState<ObservationSheetData>(() =>
    draftObservationSheetLocally({
      visitRequestId: requestId,
      facilityName: "Kovai Precision Foundry & Heavy Castings",
      courseName: "Manufacturing Technology & Machine Tools",
      syllabusTopic: "Unit 3: Metal Casting Processes & High-Pressure Die Casting",
      learningObjectives: [
        "Study automated green sand moulding lines, cupola furnace melting, and non-destructive casting flaw inspections.",
        "Observe CNC precision machining operations and coordinate measuring machine (CMM) quality metrology workflows.",
      ],
      sector: "Foundry & Heavy Castings",
    })
  );
  const [sheetReviewMsg, setSheetReviewMsg] = useState<string | null>(null);

  function handleMarkSheetReviewed() {
    setSheet((prev) => ({
      ...prev,
      status: "reviewed",
      facultyReviewedBy: "Dr. R. Karthikeyan (Faculty-In-Charge)",
      facultyReviewedAt: new Date().toISOString(),
    }));
    setSheetReviewMsg("Observation sheet reviewed & approved! You can now print student sheets.");
    setTimeout(() => setSheetReviewMsg(null), 4000);
  }

  function handlePrintSheet() {
    const check = canPrintObservationSheet(sheet);
    if (!check.canPrint) {
      alert(check.reason);
      return;
    }
    window.print();
  }

  // Participation Certificate & Social Break State (Phase p5)
  const [showCertModal, setShowCertModal] = useState(false);
  const [certStudentName, setCertStudentName] = useState("Arun Kumar R.");
  const [plannedSocialBreakMinutes, setPlannedSocialBreakMinutes] = useState(15);

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

        {/* Student Engagement & Tokenised Pre-Visit Brief (Phase p2) */}
        {(status === "approved" || status === "completed") && (
          <div className="p-6 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Pre-Visit Student Brief (Tokenised, No Login Required)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Shareable one-page overview with learning goals, PPE dress code, and reflection questions.
                </p>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                isBriefRevoked
                  ? "bg-red-100 text-red-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                {isBriefRevoked ? "Link Revoked" : "Active (128-Bit Token)"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Public Shareable URL for Students & Parents:
                </span>
                <span className="text-[11px] text-slate-500">
                  Expires: Nov 17, 2026 (Visit Date + 7d)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`/brief/${isBriefRevoked ? "revoked-token" : briefToken}`}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyBriefLink}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition shrink-0"
                >
                  Copy Link
                </button>
                <Link
                  href={`/brief/${isBriefRevoked ? "revoked" : briefToken}`}
                  target="_blank"
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0 flex items-center gap-1"
                >
                  Open Brief
                </Link>
                {!isBriefRevoked && (
                  <button
                    type="button"
                    onClick={handleRevokeBriefToken}
                    className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100 transition shrink-0"
                  >
                    Revoke
                  </button>
                )}
              </div>

              {copyMsg && (
                <p className="text-xs font-medium text-emerald-700">{copyMsg}</p>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>Privacy Assurance:</strong> This public page contains zero personal student data, zero student names, and zero consent documents. It displays only facility instructions, mandatory PPE, and academic objectives.
              </p>
            </div>
          </div>
        )}

        {/* Student Observation Sheet & Faculty Review Guardrail (Phase p3) */}
        {(status === "approved" || status === "completed") && (
          <div className="p-6 rounded-2xl bg-white border border-indigo-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Student Observation Sheet (AI-Drafted with Ruled Spaces)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Technical observation prompts derived from syllabus objectives. Faculty must review questions before printing.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  sheet.status === "draft"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {sheet.status === "draft"
                  ? "Faculty Review Pending (Print Locked)"
                  : "Reviewed & Approved by Faculty"}
              </span>
            </div>

            {sheet.status === "draft" && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Faculty Review Guardrail:</strong> Print and export actions are locked until faculty reviews the drafted questions. Inspect the questions below and click <strong>&quot;Mark Reviewed & Authorize Printing&quot;</strong>.
                </div>
              </div>
            )}

            {sheetReviewMsg && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                {sheetReviewMsg}
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-3">
              {sheet.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Q{idx + 1}. {q.topic}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      Target: {q.observation_target}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {q.prompt}
                  </p>
                  {/* Ruled lines for student handwriting */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Student Handwritten Notes ({q.space_lines} Ruled Lines):
                    </span>
                    {Array.from({ length: q.space_lines }).map((_, lineIdx) => (
                      <div
                        key={lineIdx}
                        className="border-b border-dashed border-slate-300 h-4"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                Pydantic-validated AI schema | Never auto-sent to students.
              </span>
              <div className="flex items-center gap-2">
                {sheet.status === "draft" ? (
                  <button
                    type="button"
                    onClick={handleMarkSheetReviewed}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Mark Reviewed & Authorize Printing
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mr-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Reviewed by {sheet.facultyReviewedBy}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handlePrintSheet}
                  disabled={sheet.status === "draft"}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition shadow-sm ${
                    sheet.status === "draft"
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  }`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Observation Sheets
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Anonymous Student Feedback Aggregates (Phase p4) */}
        {(status === "approved" || status === "completed") && (
          <div className="p-6 rounded-2xl bg-white border border-teal-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-teal-600" />
                  Anonymous Student Post-Visit Feedback (No Accounts)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Shareable link for student evaluations. Protected by server-side anonymity thresholds (minimum 5 responses).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Test Simulation:</span>
                <button
                  type="button"
                  onClick={() => setFeedbackSimulationCount(4)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                    feedbackSimulationCount === 4
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  4 Responses (&lt; 5)
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackSimulationCount(5)}
                  className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                    feedbackSimulationCount === 5
                      ? "bg-teal-100 text-teal-800 border-teal-300"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  5 Responses (Threshold Met)
                </button>
              </div>
            </div>

            {/* Public shareable link */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Shareable Student Feedback Form (Unguessable 128-Bit Token):
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`/feedback/student/${feedbackToken}`}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyFeedbackLink}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 text-xs font-semibold text-white hover:bg-teal-500 transition shrink-0"
                >
                  Copy Link
                </button>
                <Link
                  href={`/feedback/student/${feedbackToken}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shrink-0"
                >
                  Open Form
                </Link>
              </div>
              {feedbackCopyMsg && (
                <p className="text-xs font-medium text-emerald-700">{feedbackCopyMsg}</p>
              )}
            </div>

            {/* Threshold enforcement condition */}
            {feedbackSimulationCount < 5 ? (
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Lock className="h-4 w-4 text-amber-600" />
                  Server-Enforced Anonymity Shield Active ({feedbackSimulationCount} of 5 Responses Received)
                </div>
                <p className="leading-relaxed">
                  Aggregate ratings, student quotes, and suggestions remain strictly withheld until at least <strong>5 student responses</strong> have been submitted. This guarantees that individual student responses (especially from minor students) cannot be isolated or identified by faculty or host managers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-teal-800">
                      Average Usefulness Rating
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-teal-900">4.8</span>
                      <span className="text-xs font-semibold text-teal-700">/ 5.0 (5 responses)</span>
                    </div>
                    <div className="flex text-amber-400 text-xs">★★★★★</div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-800">
                      Average Engagement Rating
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
                    Moderated Student Highlights (Automated Content Moderation Approved):
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    <li>&ldquo;Seeing the automated green sand moulding lines and pouring process in real-time made our textbook foundry concepts completely clear.&rdquo;</li>
                    <li>&ldquo;The 30-minute technical Q&A with the chief metallurgist on casting shrinkage defects was top notch.&rdquo;</li>
                  </ul>
                  <div className="pt-2 border-t border-slate-200 text-slate-600">
                    <strong>Student Suggestions:</strong> &ldquo;Would love 15 minutes extra time in the CMM metrology inspection bay.&rdquo;
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-600 border border-slate-200 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>Scope Guardrail:</strong> Student feedback is advisory for host engineers and faculty syllabus refinement. It contributes to host industry ratings but <strong>NEVER</strong> affects institution strikes, trust scores, or tier status.
              </span>
            </div>
          </div>
        )}

        {/* Participation Certificate Generator (Phase p5) */}
        {(status === "approved" || status === "completed") && (
          <div className="p-6 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  Participation Certificates (Client-Side Batch Generator)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate print-ready industrial visit certificates with official institution and facility details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 text-xs font-semibold text-white shadow-sm hover:bg-purple-500 transition"
              >
                <Award className="h-4 w-4" />
                Generate Certificate Template
              </button>
            </div>

            <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>Client-Side Zero-PII Guarantee:</strong> Student names are typed directly in your browser at print time and are <strong>never</strong> transmitted to or stored on VisitLink servers or any database.
              </div>
            </div>
          </div>
        )}

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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
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
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Planned Social Break</span>
              <strong className="text-slate-900 text-sm">{plannedSocialBreakMinutes} Mins (0-30m cap)</strong>
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

        {/* Certificate Generator Modal (Phase p5) */}
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Industrial Visit Participation Certificate
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Guard:</strong> Enter student names locally right before printing. Names are never stored or transmitted.
                </span>
              </div>

              <div>
                <label htmlFor="certStudentName" className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Recipient Student Name (Rendered Client-Side Only):
                </label>
                <input
                  id="certStudentName"
                  type="text"
                  value={certStudentName}
                  onChange={(e) => setCertStudentName(e.target.value)}
                  placeholder="e.g. Arun Kumar R."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Certificate Template Preview */}
              <div className="p-6 rounded-xl border-4 border-double border-purple-200 bg-gradient-to-b from-purple-50/30 to-white text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-purple-700">
                    PSG College of Technology &bull; Department of Mechanical Engineering
                  </span>
                  <h4 className="text-lg font-black tracking-wide text-slate-900 uppercase">
                    Certificate of Industrial Visit Completion
                  </h4>
                </div>

                <p className="text-xs text-slate-600 italic">
                  This is to certify that
                </p>

                <div className="text-xl font-bold text-purple-900 border-b-2 border-purple-300 pb-1 max-w-sm mx-auto">
                  {certStudentName || "[Student Name]"}
                </div>

                <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  has successfully participated in the certified academic industrial visit to{" "}
                  <strong>Kovai Precision Foundry & Heavy Castings</strong>, Coimbatore on{" "}
                  <strong>Tuesday, Nov 10, 2026</strong>.
                </p>

                <div className="p-3 bg-white/80 rounded-lg border border-purple-100 text-[11px] text-left text-slate-600 space-y-1">
                  <span className="font-bold text-purple-900 block">Verified Learning Objectives:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    <li>Study automated green sand moulding lines, cupola furnace melting, and casting flaw inspections.</li>
                    <li>Observe CNC precision machining operations and CMM quality metrology workflows.</li>
                  </ul>
                </div>

                <div className="pt-4 flex justify-between items-end text-[10px] text-slate-500 border-t border-slate-200 px-4">
                  <div className="text-center">
                    <div className="h-6" />
                    <span className="border-t border-slate-400 block pt-1 font-semibold">Host Industry Engineer</span>
                  </div>
                  <div className="text-center">
                    <div className="h-6" />
                    <span className="border-t border-slate-400 block pt-1 font-semibold">Faculty Coordinator (Dr. R. Karthikeyan)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-xs font-semibold text-white hover:bg-purple-500 shadow-sm"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Certificate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}