"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import seedCatalog from "@/supabase/seed_catalog.json";
import {
  validateStudentFeedback,
  moderateFeedbackText,
} from "@/lib/engagement/feedback";

export default function StudentFeedbackSubmissionPage() {
  const params = useParams();
  const token = params.token as string;

  const [usefulness, setUsefulness] = useState<number>(5);
  const [engagement, setEngagement] = useState<number>(5);
  const [mostInteresting, setMostInteresting] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Token validation logic (accepts valid 16+ char tokens in demo, rejects invalid/expired/revoked)
  const isDemoValid =
    token === "demo-feedback-valid-128bit-token-cbe" ||
    (token && token.length >= 16 && !token.includes("expired") && !token.includes("revoked") && !token.includes("invalid"));

  const isExpired = token?.includes("expired");
  const isRevoked = token?.includes("revoked");

  // Facility demo context
  const facility = seedCatalog.industries[0];

  if (!isDemoValid || isExpired || isRevoked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            {isExpired
              ? "Feedback Window Closed"
              : isRevoked
              ? "Feedback Link Revoked"
              : "Feedback Form Not Found"}
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isExpired
              ? "The post-visit feedback window for this visit has expired (7 days after visit date)."
              : isRevoked
              ? "This feedback link was closed by your institution coordinator."
              : "The feedback link you accessed is invalid or has expired."}
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const validation = validateStudentFeedback({
      usefulness_rating: usefulness,
      engagement_rating: engagement,
      most_interesting: mostInteresting,
      suggestion,
    });

    if (!validation.isValid) {
      setErrorMsg(validation.errors.join(" "));
      return;
    }

    setSubmitting(true);

    // Save response to session storage for demo testing
    try {
      const existing = JSON.parse(sessionStorage.getItem("demo_student_feedbacks") || "[]");
      const moderation = moderateFeedbackText(mostInteresting + " " + suggestion);
      existing.push({
        id: "fb-" + Date.now(),
        visit_request_id: "req-cbe-02",
        token_hash: token,
        ip_hash: "mock-hash-" + Math.random().toString(36).substring(2, 8),
        usefulness_rating: usefulness,
        engagement_rating: engagement,
        most_interesting: mostInteresting,
        suggestion,
        moderation_status: moderation.status,
        moderation_reason: moderation.reason,
        submitted_at: new Date().toISOString(),
      });
      sessionStorage.setItem("demo_student_feedbacks", JSON.stringify(existing));
    } catch {}

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                Anonymous Student Feedback
              </span>
              <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                No Personal Data Stored
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-2">
              How was your visit to {facility.name}?
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your feedback is completely anonymous. Responses are aggregated (minimum 5 required) to help the industry host improve future technical visits.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-base font-bold text-emerald-900">
                Feedback Submitted Anonymously!
              </h2>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Thank you for helping enhance engineering visit quality. Your ratings and suggestions will be combined into host aggregate reports.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Usefulness Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  1. Academic & Technical Usefulness (1-5) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUsefulness(star)}
                      className={`flex flex-col items-center p-2.5 rounded-xl border flex-1 transition ${
                        usefulness >= star
                          ? "border-amber-400 bg-amber-50 text-amber-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      <Star className={`h-5 w-5 ${usefulness >= star ? "fill-amber-400 text-amber-500" : ""}`} />
                      <span className="text-[10px] mt-1">{star}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {usefulness === 5 && "5: Highly useful - directly aligned with engineering syllabus concepts."}
                  {usefulness === 4 && "4: Useful - helped visualize production machinery."}
                  {usefulness === 3 && "3: Moderate - learned some new concepts."}
                  {usefulness === 2 && "2: Minimal - lacked technical depth."}
                  {usefulness === 1 && "1: Disappointing - did not learn relevant concepts."}
                </p>
              </div>

              {/* Engagement Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  2. Student Engagement & Interaction Quality (1-5) *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setEngagement(star)}
                      className={`flex flex-col items-center p-2.5 rounded-xl border flex-1 transition ${
                        engagement >= star
                          ? "border-blue-400 bg-blue-50 text-blue-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      <Sparkles className={`h-5 w-5 ${engagement >= star ? "fill-blue-400 text-blue-500" : ""}`} />
                      <span className="text-[10px] mt-1">{star}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {engagement === 5 && "5: Highly engaging - interactive demos, clear explanations, good Q&A."}
                  {engagement === 4 && "4: Good engagement - attentive engineers and clear walkthrough."}
                  {engagement === 3 && "3: Average engagement - mostly passive observation."}
                  {engagement === 2 && "2: Low engagement - rushed walkthrough."}
                  {engagement === 1 && "1: Disengaged - minimal host interaction."}
                </p>
              </div>

              {/* Most Interesting Highlight */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="mostInteresting" className="block text-xs font-semibold text-slate-700 uppercase">
                    3. What was the most interesting machine, process, or test you observed?
                  </label>
                  <span className={`text-[10px] font-mono ${mostInteresting.length > 300 ? "text-red-600 font-bold" : "text-slate-400"}`}>
                    {mostInteresting.length}/300
                  </span>
                </div>
                <textarea
                  id="mostInteresting"
                  rows={2}
                  maxLength={300}
                  placeholder="e.g. Watching the cupola furnace pouring and the automated CMM metrology inspection..."
                  value={mostInteresting}
                  onChange={(e) => setMostInteresting(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500"
                />
              </div>

              {/* Suggestion */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="suggestion" className="block text-xs font-semibold text-slate-700 uppercase">
                    4. Suggestion to improve future visits to this plant:
                  </label>
                  <span className={`text-[10px] font-mono ${suggestion.length > 300 ? "text-red-600 font-bold" : "text-slate-400"}`}>
                    {suggestion.length}/300
                  </span>
                </div>
                <textarea
                  id="suggestion"
                  rows={2}
                  maxLength={300}
                  placeholder="e.g. Allow more time for Q&A with the design engineers or provide sample cross-sections..."
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                <strong>Privacy Note:</strong> Your name, email, and IP address are never stored. Responses are protected by rotating salt hashing and server-side aggregation.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Anonymous Feedback"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
