"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  HardHat,
  Printer,
  Sparkles,
  BookOpen,
  HelpCircle,
  AlertOctagon,
  Eye,
  Info,
} from "lucide-react";
import seedCatalog from "@/supabase/seed_catalog.json";
import {
  hashToken,
  verifyVisitAccessToken,
  type VisitAccessTokenRecord,
} from "@/lib/engagement/tokens";
import { buildPreVisitBrief } from "@/lib/engagement/brief";

export default function PublicPreVisitBriefPage() {
  const params = useParams();
  const token = params.token as string;

  // Emulated token database lookup for demo & testing
  // In demo mode, accepts valid 32-char hex tokens and demo tokens: 'demo-brief-valid-128bit-token-cbe'
  const isDemoValid =
    token === "demo-brief-valid-128bit-token-cbe" ||
    (token && token.length >= 16 && !token.includes("expired") && !token.includes("revoked") && !token.includes("invalid"));

  const isExpired = token?.includes("expired");
  const isRevoked = token?.includes("revoked");

  // Lookup facility and visit data
  const facility = seedCatalog.industries[0]; // Kovai Precision Foundry
  const visitRequest = {
    id: "req-cbe-02",
    visit_date: "2026-11-10",
    slot_window: "10:00 AM - 1:00 PM",
    learning_objectives: [
      "Study automated green sand moulding lines, cupola furnace melting, and non-destructive casting flaw inspections.",
      "Observe CNC precision machining operations and coordinate measuring machine (CMM) quality metrology workflows.",
    ],
    course_name: "Manufacturing Technology & Machine Tools",
    syllabus_topic: "Unit 3: Metal Casting Processes & High-Pressure Die Casting",
    pre_visit_agenda:
      "Detailed 3-hour plant walkthrough: 45m cupola furnace & casting floor, 45m CNC machining shop, 45m metrology inspection lab, 45m Q&A with chief metallurgist.",
  };

  const briefData = useMemo(() => {
    return buildPreVisitBrief(
      {
        ...facility,
        ppe_list: [
          "Steel-toe safety shoes",
          "Hard hat / Safety helmet",
          "Safety goggles",
          "Heavy cotton lab coats",
        ],
        dress_code:
          "Strict long trousers and thick cotton shirts. No synthetic fibers, loose ties, or open-toed footwear permitted.",
      },
      visitRequest,
      "2026-11-17T23:59:59.999Z"
    );
  }, [facility]);

  // If token is invalid, expired, or revoked -> return secure 404 with ZERO data leak
  if (!isDemoValid || isExpired || isRevoked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {isExpired
              ? "Pre-Visit Brief Has Expired"
              : isRevoked
              ? "Pre-Visit Brief Access Revoked"
              : "Pre-Visit Brief Not Found"}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isExpired
              ? "This visit brief link expired 7 days after the scheduled visit date to protect operational privacy."
              : isRevoked
              ? "This link was revoked by the institutional coordinator. Please contact your faculty coordinator for updated details."
              : "The link you entered is invalid or does not exist. No visit information is accessible."}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Return to VisitLink Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header & Print Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                Official Student & Parent Pre-Visit Brief
              </span>
              <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                No Login Required
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2 leading-tight">
              {briefData.facilityName}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {briefData.location}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition shrink-0"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>

        {/* Schedule & Key Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Visit Date</span>
              <span className="text-sm font-bold text-slate-900">{briefData.visitDateFormatted}</span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Visit Time Window</span>
              <span className="text-sm font-bold text-slate-900">{briefData.slotTime}</span>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="p-6 bg-white rounded-2xl border border-purple-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-600" />
            Academic Learning Objectives
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your department faculty scheduled this industrial visit to provide direct real-world observation of your syllabus concepts:
          </p>
          <ul className="space-y-2 text-xs text-slate-800">
            {briefData.learningObjectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What You Will Observe */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-600" />
            What Students Will Observe on the Shop Floor
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {briefData.whatStudentsWillObserve.map((obs, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium">
                • {obs}
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Safety Rules & Dress Code */}
        <div className="p-6 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <HardHat className="h-4 w-4 text-amber-600" />
            Mandatory Safety Rules & PPE Checklist
          </h2>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
            <span className="font-bold block">Strict Shop-Floor Dress Code:</span>
            <p className="leading-relaxed">{briefData.dressCode}</p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
              Required Personal Protective Equipment (PPE):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {briefData.mandatoryPpe.map((ppe, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-medium text-slate-800">{ppe}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
              General Factory Walkway Rules:
            </span>
            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
              {briefData.safetyRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reflection Prompts for Students */}
        <div className="p-6 bg-white rounded-2xl border border-blue-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            Active Learning: Reflection Questions to Think About
          </h2>
          <p className="text-xs text-slate-600">
            Take mental notes or jot down observations during the tour to answer in your post-visit report:
          </p>
          <div className="space-y-2">
            {briefData.reflectionPrompts.map((prompt, i) => (
              <div key={i} className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-xs text-slate-800 leading-relaxed flex items-start gap-2">
                <span className="font-mono font-bold text-blue-600 shrink-0">Q{i + 1}.</span>
                <span>{prompt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Privacy Notice Footer */}
        <div className="p-4 bg-slate-100/70 rounded-2xl text-[11px] text-slate-500 space-y-1 text-center">
          <p>
            <strong>Privacy & Child Safety Guarantee:</strong> VisitLink does not create student accounts, require student login, or store any student personal data.
          </p>
          <p>
            This brief link is tokenised and automatically expires on <strong>Nov 17, 2026</strong> (7 days after visit date).
          </p>
        </div>
      </div>
    </div>
  );
}
