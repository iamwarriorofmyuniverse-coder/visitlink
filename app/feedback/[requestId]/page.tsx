"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function PostVisitFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;

  const [overallRating, setOverallRating] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [safetyCompliance, setSafetyCompliance] = useState(5);
  const [educationalValue, setEducationalValue] = useState(5);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 800);
  }

  function renderStarSelector(value: number, setValue: (v: number) => void) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setValue(star)}
            className="p-1 text-amber-400 hover:scale-110 transition"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs font-bold text-slate-700">{value} / 5</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-2xl">
      <Link
        href="/coordinator"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Post-Visit Review
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Rate Your Industrial Visit Experience
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visit Request #{requestId} | Verified Feedback builds community trust.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-200 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-bold text-emerald-900">Thank you for your feedback!</h2>
            <p className="text-xs text-emerald-700">
              Your rating and evaluation have been published to the verified facility profile.
            </p>
            <Link
              href="/coordinator"
              className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Overall Visit Rating
              </label>
              {renderStarSelector(overallRating, setOverallRating)}
            </div>

            {/* Dimensional Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                  Punctuality & Schedule
                </label>
                {renderStarSelector(punctuality, setPunctuality)}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                  Safety Compliance
                </label>
                {renderStarSelector(safetyCompliance, setSafetyCompliance)}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                  Educational Value
                </label>
                {renderStarSelector(educationalValue, setEducationalValue)}
              </div>
            </div>

            {/* Written Review */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Written Review & Feedback
              </label>
              <textarea
                rows={4}
                required
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience: What did students learn? How was the plant floor safety guidance? Any recommendations for future batches?"
                className="block w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {submitting ? "Publishing Review..." : "Publish Verified Feedback"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
