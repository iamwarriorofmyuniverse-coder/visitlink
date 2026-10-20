"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Users,
  ShieldAlert,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
  Utensils,
  Car,
  CloudSun,
  AlertTriangle,
} from "lucide-react";
import seedCatalog from "@/supabase/seed_catalog.json";
import {
  evaluateFoodLogistics,
  evaluateParkingLogistics,
} from "@/lib/logistics/validation";

export default function BookVisitPage() {
  const params = useParams();
  const router = useRouter();
  const industryId = params.industryId as string;

  // Find facility from catalog
  const facility = (seedCatalog.industries.find(
    (i) => i.readable_id === industryId
  ) || seedCatalog.industries[0]) as any;

  const ratioLimit = 15; // default 1 teacher per 15 students

  const [date, setDate] = useState("2026-11-10");
  const [slot, setSlot] = useState("10:00:00 - 13:00:00");
  const [studentCount, setStudentCount] = useState(30);
  const [teacherCount, setTeacherCount] = useState(2);
  const [department, setDepartment] = useState("4th Sem B.E. Mechanical Engineering");
  const [course, setCourse] = useState("Manufacturing Technology & Machine Tools");
  const [objectives, setObjectives] = useState(
    "Observe automated casting, CNC precision tooling, and quality metrology on the production shop-floor."
  );
  const [hasMinors, setHasMinors] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [indemnityAccepted, setIndemnityAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Logistics State (Food & Parking)
  const [mealsNeeded, setMealsNeeded] = useState(false);
  const [mealHeadcount, setMealHeadcount] = useState(30);
  const [dietaryNotes, setDietaryNotes] = useState("");
  const [busesCount, setBusesCount] = useState(1);
  const [carsCount, setCarsCount] = useState(1);

  // Real-time Logistics Evaluations
  const foodEval = useMemo(() => {
    return evaluateFoodLogistics(
      {
        canteen_available: facility.canteen_available ?? true,
        meal_options: facility.meal_options ?? ["veg"],
        max_meal_capacity: facility.max_meal_capacity ?? 50,
        outside_food_allowed: facility.outside_food_allowed ?? true,
        refreshments_provided: facility.refreshments_provided ?? true,
        food_notes: facility.food_notes ?? "",
      },
      {
        meals_needed: mealsNeeded,
        meal_headcount: mealHeadcount,
        dietary_notes: dietaryNotes,
      }
    );
  }, [facility, mealsNeeded, mealHeadcount, dietaryNotes]);

  const parkingEval = useMemo(() => {
    return evaluateParkingLogistics(
      {
        bus_parking_slots: facility.bus_parking_slots ?? 2,
        car_parking_slots: facility.car_parking_slots ?? 6,
        max_vehicle_height_m: facility.max_vehicle_height_m ?? 4.2,
        entry_gate_instructions: facility.entry_gate_instructions ?? "",
        parking_notes: facility.parking_notes ?? "",
      },
      {
        buses_count: busesCount,
        cars_count: carsCount,
      }
    );
  }, [facility, busesCount, carsCount]);

  // Teacher Ratio Validation
  const minTeachersNeeded = Math.ceil(studentCount / ratioLimit);
  const isRatioValid = teacherCount >= minTeachersNeeded;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("File exceeds 5MB limit. Please upload a smaller PDF or image.");
        return;
      }
      setFileName(file.name);
      setFileUploaded(true);
      setErrorMsg(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!isRatioValid) {
      setErrorMsg(
        `Insufficient accompanying teachers. Facility requires at least ${minTeachersNeeded} teachers for ${studentCount} students (1:${ratioLimit} ratio).`
      );
      return;
    }

    if (hasMinors && !fileUploaded) {
      setErrorMsg(
        "Parental consent undertaking and signed student roster must be uploaded for groups containing minors."
      );
      return;
    }

    if (!indemnityAccepted) {
      setErrorMsg(
        "You must acknowledge safety regulations and accept the institution indemnity declaration."
      );
      return;
    }

    setSubmitting(true);

    // Save submitted logistics to session storage for demo preview
    const logisticsSnapshot = {
      mealsNeeded,
      mealHeadcount,
      dietaryNotes,
      busesCount,
      carsCount,
      foodEval,
      parkingEval,
    };
    try {
      sessionStorage.setItem("last_visit_logistics", JSON.stringify(logisticsSnapshot));
    } catch {}

    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(
        "Visit request submitted successfully! Your request has been queued with logistics and AI compliance screening."
      );
      setTimeout(() => {
        router.push("/coordinator");
      }, 1500);
    }, 1000);
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-3xl">
      <Link
        href="/coordinator/explore"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Facility Search
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Booking Request Wizard
            </span>
            {facility.outdoor_component && (
              <span className="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-200 flex items-center gap-1">
                <CloudSun className="h-3 w-3" />
                Outdoor Operations
              </span>
            )}
            {facility.heat_sensitive && (
              <span className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 border border-orange-200">
                Heat-Sensitive Plant
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {facility.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sector: <strong className="text-slate-700 capitalize">{facility.sector}</strong> | Max Capacity: {facility.max_group_size} students
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800 border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Schedule Selection */}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              1. Date & Time Window
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Requested Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Available Visit Slot
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="10:00:00 - 13:00:00">Slot A: 10:00 AM - 1:00 PM (Morning)</option>
                  <option value="14:00:00 - 17:00:00">Slot B: 2:00 PM - 5:00 PM (Afternoon)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Group Size & Ratio Check */}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              2. Student Headcount & Teacher Ratio Check
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="studentCount" className="block text-xs font-semibold text-slate-700 uppercase">
                  Student Count (Headcount)
                </label>
                <input
                  id="studentCount"
                  type="number"
                  min="5"
                  max={facility.max_group_size}
                  required
                  value={studentCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value) || 0;
                    setStudentCount(count);
                    if (mealsNeeded) setMealHeadcount(count);
                  }}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Facility max cap is {facility.max_group_size}. Atomic engine locks capacity upon approval.
                </p>
              </div>

              <div>
                <label htmlFor="teacherCount" className="block text-xs font-semibold text-slate-700 uppercase">
                  Accompanying Teachers / Faculty
                </label>
                <input
                  id="teacherCount"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={teacherCount}
                  onChange={(e) => setTeacherCount(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  {isRatioValid ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ratio compliant: 1 teacher per {Math.round(studentCount / teacherCount)} students
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Requires at least {minTeachersNeeded} teachers (1:{ratioLimit} ratio rule)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Minors Checkbox */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Are any participating students minors (under 18 years of age)?
                </span>
                <p className="text-[11px] text-slate-500">
                  Mandatory parental consent upload and human manager sign-off required.
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasMinors}
                onChange={(e) => setHasMinors(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Step 3: Visit Logistics (Food & Parking) */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-600" />
              3. Visit Logistics (Food & Parking Declarations)
            </h2>

            {/* Food Section */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    On-Site Canteen & Meal Requisition
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Canteen: {facility.canteen_available ? "Available" : "Not Available"} | Max meal capacity: {facility.max_meal_capacity ?? 0} | Outside food: {facility.outside_food_allowed ? "Allowed" : "Prohibited"}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mealsNeeded}
                    onChange={(e) => {
                      setMealsNeeded(e.target.checked);
                      if (e.target.checked && mealHeadcount === 0) setMealHeadcount(studentCount);
                    }}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  Meals Needed
                </label>
              </div>

              {mealsNeeded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label htmlFor="mealHeadcount" className="block text-xs font-semibold text-slate-700 uppercase">
                      Meal Headcount
                    </label>
                    <input
                      id="mealHeadcount"
                      type="number"
                      min="1"
                      value={mealHeadcount}
                      onChange={(e) => setMealHeadcount(parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dietaryNotes" className="block text-xs font-semibold text-slate-700 uppercase">
                      Dietary Requirements (e.g. Jain, Veg)
                    </label>
                    <input
                      id="dietaryNotes"
                      type="text"
                      placeholder="e.g. 5 students require Jain food"
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Real-time food warning */}
              {foodEval.status === "warning" && (
                <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{foodEval.details}</span>
                </div>
              )}
            </div>

            {/* Parking Section */}
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Vehicle Parking & Coach Bays
                </span>
                <p className="text-[11px] text-slate-500">
                  Facility Capacity: {facility.bus_parking_slots ?? 2} Bus bays | {facility.car_parking_slots ?? 6} Car slots | Max height clearance: {facility.max_vehicle_height_m ?? 4.2}m
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="busesCount" className="block text-xs font-semibold text-slate-700 uppercase">
                    Institution Buses
                  </label>
                  <input
                    id="busesCount"
                    type="number"
                    min="0"
                    value={busesCount}
                    onChange={(e) => setBusesCount(parseInt(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="carsCount" className="block text-xs font-semibold text-slate-700 uppercase">
                    Faculty / Accompanying Cars
                  </label>
                  <input
                    id="carsCount"
                    type="number"
                    min="0"
                    value={carsCount}
                    onChange={(e) => setCarsCount(parseInt(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Real-time parking warning */}
              {parkingEval.status === "warning" && (
                <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{parkingEval.details}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Academic Details for AI Triage */}
          <div className="border-t border-slate-100 pt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              4. Academic Context & Learning Objectives
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Class / Department / Semester
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Course or Subject Title
                </label>
                <input
                  type="text"
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Specific Learning Objectives
              </label>
              <textarea
                rows={2}
                required
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Step 5: Compliance Upload & Indemnity */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              5. Safety & Compliance Verification
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Upload Student Roster & Parental Consent Forms (PDF / JPG, Max 5MB)
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Stored in private Supabase Storage bucket. Accessible only by authorized coordinator, facility manager, and admins via short-lived signed URLs.
              </p>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition">
                  <Upload className="h-3.5 w-3.5" />
                  Choose File
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {fileName && (
                  <span className="text-xs text-slate-600 font-medium">
                    Attached: {fileName}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={indemnityAccepted}
                  onChange={(e) => setIndemnityAccepted(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I confirm that all visiting students and faculty will strictly adhere to mandatory PPE requirements, stay within designated yellow visitor walkways, and respect the industrial facility&apos;s non-disclosure and photography restrictions.
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/coordinator/explore"
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {submitting ? "Submitting Request..." : "Submit Visit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
