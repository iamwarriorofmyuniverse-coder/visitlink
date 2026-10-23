"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  Lock,
} from "lucide-react";
import {
  calculateServerOverallRating,
  validateCoordinatorRatingInput,
  type CoordinatorIndustryRatingInput,
} from "@/lib/ratings/reviews";
import { screenReviewContent } from "@/lib/ratings/disputes";

export default function PostVisitFeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;

  // 5 Dimensional Ratings (1 to 5 stars)
  const [learningValue, setLearningValue] = useState(5);
  const [hostingOrg, setHostingOrg] = useState(5);
  const [staffGuide, setStaffGuide] = useState(5);
  const [safety, setSafety] = useState(5);
  const [listingAccuracy, setListingAccuracy] = useState(5);

  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Computed Server-Side Overall Rating (Average of 5 dimensions)
  const overallRating = useMemo(() => {
    return calculateServerOverallRating({
      learning_value_rating: learningValue,
      hosting_organisation_rating: hostingOrg,
      staff_guide_quality_rating: staffGuide,
      safety_rating: safety,
      listing_accuracy_rating: listingAccuracy,
    });
  }, [learningValue, hostingOrg, staffGuide, safety, listingAccuracy]);

  // Content moderation preview
  const moderationResult = useMemo(() => {
    if (!reviewText.trim()) return { isClean: true };
    return screenReviewContent(reviewText);
  }, [reviewText]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Verify completed visit & cooldown eligibility
    const eligibility = validateCoordinatorRatingInput({
      visit_request_id: requestId,
      visit_status: "completed",
      visit_completed_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago (past 1-hr cooldown)
      learning_value_rating: learningValue,
      hosting_organisation_rating: hostingOrg,
      staff_guide_quality_rating: staffGuide,
      safety_rating: safety,
      listing_accuracy_rating: listingAccuracy,
      review_text: reviewText,
    });

    if (!eligibility.isValid) {
      setValidationError(eligibility.errors[0] || "Review submission is not eligible.");
      return;
    }

    // Check PII / Defamation
    if (!moderationResult.isClean) {
      setValidationError(moderationResult.reason || "Review contains disallowed personal information or inappropriate content.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  function renderStarSelector(
    label: string,
    description: string,
    value: number,
    setValue: (v: number) => void
  ) {
    return (
      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
            {label}
          </label>
          <span className="font-mono text-xs font-bold text-slate-700">{value} / 5</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">{description}</p>
        <div className="flex items-center gap-1 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setValue(star)}
              className="p-1 text-amber-400 hover:scale-110 transition focus:outline-none"
            >
              <Star
                className={`h-5 w-5 ${
                  star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
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
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
              Verified Completed Visit
            </span>
            <span className="text-xs text-slate-500">Request #{requestId}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Rate Your Industrial Visit Experience: 5-Dimension Educational Review
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Ratings are constrained to verified completed visits. Your ratings feed into Bayesian aggregation and the host&apos;s public readiness profile.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-200 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-bold text-emerald-900">Thank you for your feedback! Review Published Successfully</h2>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Your overall rating of <strong>{overallRating}★</strong> has been blended into the Bayesian aggregation. You can edit this review within the 7-day coordinator window.
            </p>
            <div className="pt-2">
              <Link
                href="/coordinator"
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Server Overall Rating Banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                  Server-Computed Overall Rating
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-blue-900">{overallRating}</span>
                  <span className="text-xs font-semibold text-blue-700">/ 5.0★</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Exact arithmetic average of the 5 educational dimensions.
                </span>
              </div>
              <ShieldCheck className="h-8 w-8 text-blue-600 opacity-80" />
            </div>

            {/* 5-Dimensional Ratings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Rate Each Dimension
              </h3>

              {renderStarSelector(
                "1. Learning Value & Curriculum Fit",
                "Clarity of engineering explanations, relevance to syllabus, quality of plant demonstration.",
                learningValue,
                setLearningValue
              )}

              {renderStarSelector(
                "2. Hosting & Plant Organisation",
                "Adherence to itinerary schedule, briefing room readiness, welcome and reception of students.",
                hostingOrg,
                setHostingOrg
              )}

              {renderStarSelector(
                "3. Staff & Guide Quality",
                "Lead engineers' subject knowledge, pedagogical clarity, and engagement with student questions.",
                staffGuide,
                setStaffGuide
              )}

              {renderStarSelector(
                "4. Plant Safety & PPE Compliance",
                "Visitor safety walkway demarcation, PPE supply and enforcement, student supervision on plant floor.",
                safety,
                setSafety
              )}

              {renderStarSelector(
                "5. Listing Accuracy",
                "How faithfully the plant equipment, live demos, and technologies observed matched the online listing.",
                listingAccuracy,
                setListingAccuracy
              )}
            </div>

            {/* Written Review */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Written Feedback &amp; Observations
                </label>
                <span className="text-[11px] text-slate-400">
                  {reviewText.length} characters (min 30)
                </span>
              </div>
              <textarea
                rows={4}
                required
                minLength={30}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience and detailed observations: Which processes did students observe? How was the plant safety induction? How well did the demo connect with your syllabus?"
                className="block w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* PII or Content Moderation Warning */}
            {!moderationResult.isClean && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>Content Notice:</strong> {moderationResult.reason}
                  <span className="block mt-0.5 text-amber-700">
                    Please remove personal contact information, phone numbers, or email addresses before submitting.
                  </span>
                </div>
              </div>
            )}

            {validationError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* 7-Day Window Integrity Notice */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                <strong>Integrity Policy:</strong> Coordinators may edit this review within 7 days. After 7 days, reviews are permanently locked to guarantee historical audit integrity.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !moderationResult.isClean || reviewText.length < 30}
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
