"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  GraduationCap,
  Mail,
  UserCheck,
  Shield,
  BookOpen,
} from "lucide-react";
import seedCatalog from "@/supabase/seed_catalog.json";
import {
  evaluateFoodLogistics,
  evaluateParkingLogistics,
} from "@/lib/logistics/validation";
import {
  validateEducationalIntent,
  validateFacultyEmail,
  isFreemailDomain,
  containsPlaceholderText,
} from "@/lib/antiabuse/validation";
import {
  canInstitutionBook,
  InstitutionTrustTier,
} from "@/lib/antiabuse/trust";

export default function BookVisitPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const industryId = params.industryId as string;

  // Find facility from catalog
  const facility = (seedCatalog.industries.find(
    (i) => i.readable_id === industryId
  ) || seedCatalog.industries[0]) as any;

  // Institution trust tier state (allows testing different tiers via query param or default verified)
  const tierParam = (searchParams.get("instTier") as InstitutionTrustTier) || "verified";
  const pendingCountParam = parseInt(searchParams.get("pending") || "0", 10);
  const [institutionTier, setInstitutionTier] = useState<InstitutionTrustTier>(tierParam);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(pendingCountParam);
  const [allowFreemailOverride, setAllowFreemailOverride] = useState(false);

  const ratioLimit = 15; // default 1 teacher per 15 students

  const [date, setDate] = useState("2026-11-10");
  const [slot, setSlot] = useState("10:00:00 - 13:00:00");
  const [studentCount, setStudentCount] = useState(30);
  const [teacherCount, setTeacherCount] = useState(2);
  const [hasMinors, setHasMinors] = useState(false);
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

  // Scheduled Social Slot (Phase p5)
  const [plannedSocialBreakMinutes, setPlannedSocialBreakMinutes] = useState(0);

  // Mandatory Educational Intent Fields (Phase m1)
  const [objective1, setObjective1] = useState(
    "Study automated green sand moulding lines, cupola furnace melting, and non-destructive casting flaw inspections."
  );
  const [objective2, setObjective2] = useState(
    "Observe CNC precision machining operations and coordinate measuring machine (CMM) quality metrology workflows."
  );
  const [courseName, setCourseName] = useState("Manufacturing Technology & Machine Tools");
  const [semesterClass, setSemesterClass] = useState("4th Sem B.E. Mechanical Engineering");
  const [syllabusTopic, setSyllabusTopic] = useState("Unit 3: Metal Casting Processes & High-Pressure Die Casting");
  const [preVisitAgenda, setPreVisitAgenda] = useState(
    "Detailed 3-hour plant walkthrough: 45m cupola furnace & casting floor, 45m CNC machining shop, 45m metrology inspection lab, 45m Q&A with chief metallurgist."
  );
  const [expectedDeliverable, setExpectedDeliverable] = useState<"report" | "quiz" | "project" | "case_study">("report");
  const [facultyName, setFacultyName] = useState("Dr. R. Karthikeyan");
  const [facultyEmail, setFacultyEmail] = useState("karthikeyan.mech@psgtech.edu");
  const [facultyPhone, setFacultyPhone] = useState("+91 94432 18920");

  // Facility Minimum Trust Tier Gatekeeper Check (Phase m3)
  const facilityMinTier = facility.min_trust_tier || "new";
  const gatekeeperCheck = useMemo(() => {
    return canInstitutionBook(
      {
        trust_tier: institutionTier,
        trust_score: institutionTier === "trusted" ? 92 : institutionTier === "verified" ? 78 : institutionTier === "restricted" ? 25 : 50,
        active_strikes_count: institutionTier === "restricted" ? 3 : 0,
        restriction_reason: institutionTier === "restricted" ? "Accumulated policy violations (3 strikes in 12 months)." : undefined,
      },
      facilityMinTier,
      pendingRequestsCount
    );
  }, [institutionTier, facilityMinTier, pendingRequestsCount]);

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

  // Real-time Intent Quality Diagnostics
  const emailValidation = useMemo(() => {
    return validateFacultyEmail(facultyEmail, allowFreemailOverride);
  }, [facultyEmail, allowFreemailOverride]);

  const obj1Placeholder = useMemo(() => containsPlaceholderText(objective1), [objective1]);
  const obj2Placeholder = useMemo(() => containsPlaceholderText(objective2), [objective2]);
  const agendaPlaceholder = useMemo(() => containsPlaceholderText(preVisitAgenda), [preVisitAgenda]);

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

    // 1. Gatekeeper check
    if (!gatekeeperCheck.allowed) {
      setErrorMsg(gatekeeperCheck.reason || "Booking not permitted under institutional trust tier rules.");
      return;
    }

    // 2. Validate Educational Intent Fields
    const intentValidation = validateEducationalIntent({
      learning_objectives: [objective1, objective2],
      course_name: courseName,
      semester_class: semesterClass,
      syllabus_topic: syllabusTopic,
      pre_visit_agenda: preVisitAgenda,
      expected_deliverable: expectedDeliverable,
      faculty_name: facultyName,
      faculty_email: facultyEmail,
      faculty_phone: facultyPhone,
      allow_freemail: allowFreemailOverride,
    });

    if (!intentValidation.isValid) {
      setErrorMsg(intentValidation.errors.map((err) => err.message).join(" "));
      return;
    }

    // 3. Validate Teacher Ratio
    if (!isRatioValid) {
      setErrorMsg(
        `Insufficient accompanying teachers. Facility requires at least ${minTeachersNeeded} teachers for ${studentCount} students (1:${ratioLimit} ratio).`
      );
      return;
    }

    // 4. Minors check
    if (hasMinors && !fileUploaded) {
      setErrorMsg(
        "Parental consent undertaking and signed student roster must be uploaded for groups containing minors."
      );
      return;
    }

    // 5. Indemnity
    if (!indemnityAccepted) {
      setErrorMsg(
        "You must acknowledge safety regulations and accept the institution indemnity declaration."
      );
      return;
    }

    setSubmitting(true);

    // Save submitted logistics & intent to session storage for demo preview
    const logisticsSnapshot = {
      mealsNeeded,
      mealHeadcount,
      dietaryNotes,
      busesCount,
      carsCount,
      foodEval,
      parkingEval,
    };

    const intentSnapshot = {
      learning_objectives: [objective1, objective2],
      course_name: courseName,
      semester_class: semesterClass,
      syllabus_topic: syllabusTopic,
      pre_visit_agenda: preVisitAgenda,
      expected_deliverable: expectedDeliverable,
      faculty_name: facultyName,
      faculty_email: facultyEmail,
      faculty_phone: facultyPhone,
      faculty_email_verified: !isFreemailDomain(facultyEmail) || allowFreemailOverride,
      submitted_at: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem("last_visit_logistics", JSON.stringify(logisticsSnapshot));
      sessionStorage.setItem("last_visit_intent", JSON.stringify(intentSnapshot));
    } catch {}

    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(
        "Visit request submitted successfully! Your educational intent has been verified and queued for industry review."
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
            {facilityMinTier && facilityMinTier !== "new" && (
              <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-200 flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Min Tier: {facilityMinTier.toUpperCase()}
              </span>
            )}
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
            Sector: <strong className="text-slate-700 capitalize">{facility.sector}</strong> | Max Capacity: {facility.max_group_size} students | Facility Tier Policy: <strong className="text-slate-700 capitalize">{facilityMinTier}</strong>
          </p>
        </div>

        {/* Gatekeeper Blocking Notice if Institution Fails Tier Requirements */}
        {!gatekeeperCheck.allowed && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-red-900">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <span>Booking Access Restricted by Anti-Abuse Policy</span>
            </div>
            <p className="text-xs text-red-700 leading-relaxed">
              {gatekeeperCheck.reason}
            </p>
            <div className="text-[11px] text-red-600 pt-1 flex items-center gap-2">
              <span>Your Current Tier: <strong>{institutionTier.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Required Tier: <strong>{facilityMinTier.toUpperCase()}</strong></span>
            </div>
          </div>
        )}

        {/* Institution Tier Simulation Switcher for Testing/Demo */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-slate-600">Simulate Institution Tier:</span>
          <div className="flex items-center gap-1.5">
            {(["new", "verified", "trusted", "restricted"] as InstitutionTrustTier[]).map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setInstitutionTier(tier)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  institutionTier === tier
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
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

            {/* Optional Planned Social Break (Phase p5) */}
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label htmlFor="socialBreak" className="text-xs font-bold text-slate-800 block">
                    Planned Informal / Social Break (Optional, 0-30 min)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Brief informal period for students to network or eat refreshments. Displayed to host industry for scheduling.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    id="socialBreak"
                    type="number"
                    min="0"
                    max="30"
                    value={plannedSocialBreakMinutes}
                    onChange={(e) => setPlannedSocialBreakMinutes(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                    className="w-16 rounded-lg border border-slate-300 p-1.5 text-xs text-slate-900 text-center font-bold"
                  />
                  <span className="text-xs font-semibold text-slate-600">mins</span>
                </div>
              </div>
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

              {parkingEval.status === "warning" && (
                <div className="rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{parkingEval.details}</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Mandatory Educational Intent & Faculty Verification (Phases m1-m4) */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-purple-600" />
                4. Mandatory Educational Intent & Anti-Abuse Verification
              </h2>
              <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Quality Screened
              </span>
            </div>

            <p className="text-xs text-slate-500">
              To protect scarce industrial capacity and prevent recreational sightseeing trips, all visits must demonstrate rigorous syllabus alignment, concrete learning goals, and designated faculty sponsorship.
            </p>

            {/* Course & Academic Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="courseName" className="block text-xs font-semibold text-slate-700 uppercase">
                  Course / Subject Title *
                </label>
                <input
                  id="courseName"
                  type="text"
                  required
                  placeholder="e.g. Manufacturing Technology & Machine Tools"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="semesterClass" className="block text-xs font-semibold text-slate-700 uppercase">
                  Target Class / Semester *
                </label>
                <input
                  id="semesterClass"
                  type="text"
                  required
                  placeholder="e.g. 4th Sem B.E. Mechanical Engineering"
                  value={semesterClass}
                  onChange={(e) => setSemesterClass(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Syllabus Topic */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="syllabusTopic" className="block text-xs font-semibold text-slate-700 uppercase">
                  Syllabus Topic Linked to Visit *
                </label>
                <span className={`text-[11px] font-mono ${syllabusTopic.length < 10 ? "text-amber-600" : "text-slate-400"}`}>
                  {syllabusTopic.length}/10 chars min
                </span>
              </div>
              <input
                id="syllabusTopic"
                type="text"
                required
                placeholder="e.g. Unit 3: Metal Casting Processes, Sand Moulding, & Die Casting"
                value={syllabusTopic}
                onChange={(e) => setSyllabusTopic(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-purple-500"
              />
            </div>

            {/* Learning Objectives 1 & 2 */}
            <div className="space-y-3 p-4 bg-purple-50/40 rounded-xl border border-purple-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                Specific Learning Objectives (Min 2 required, 30 chars each, no placeholders)
              </span>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="objective1" className="block text-[11px] font-semibold text-slate-700">
                    Objective #1: What technical process will students study?
                  </label>
                  <span className={`text-[11px] font-mono ${objective1.length < 30 ? "text-amber-600" : "text-slate-400"}`}>
                    {objective1.length}/30 min
                  </span>
                </div>
                <textarea
                  id="objective1"
                  rows={2}
                  required
                  placeholder="e.g. Study automated green sand moulding lines and cupola furnace melting..."
                  value={objective1}
                  onChange={(e) => setObjective1(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-purple-500"
                />
                {obj1Placeholder && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Generic placeholder detected (e.g. &quot;visit&quot; or &quot;exposure&quot;). Please specify technical concepts.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="objective2" className="block text-[11px] font-semibold text-slate-700">
                    Objective #2: What quality/engineering workflow will students observe?
                  </label>
                  <span className={`text-[11px] font-mono ${objective2.length < 30 ? "text-amber-600" : "text-slate-400"}`}>
                    {objective2.length}/30 min
                  </span>
                </div>
                <textarea
                  id="objective2"
                  rows={2}
                  required
                  placeholder="e.g. Observe coordinate measuring machine (CMM) quality inspection for automotive tolerances..."
                  value={objective2}
                  onChange={(e) => setObjective2(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-purple-500"
                />
                {obj2Placeholder && (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Generic placeholder detected. Please detail specific engineering or testing procedures.
                  </p>
                )}
              </div>
            </div>

            {/* Pre-Visit Agenda & Expected Output */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="preVisitAgenda" className="block text-xs font-semibold text-slate-700 uppercase">
                  Pre-Visit Plant Agenda (Observation Timeline) *
                </label>
                <span className={`text-[11px] font-mono ${preVisitAgenda.length < 40 ? "text-amber-600" : "text-slate-400"}`}>
                  {preVisitAgenda.length}/40 chars min
                </span>
              </div>
              <textarea
                id="preVisitAgenda"
                rows={2}
                required
                placeholder="Detail the plant observation breakdown (e.g. 45m foundry floor, 45m CNC shop, 45m metrology lab, 45m Q&A)..."
                value={preVisitAgenda}
                onChange={(e) => setPreVisitAgenda(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 focus:border-purple-500"
              />
              {agendaPlaceholder && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Recreational or placeholder terms detected. Sightseeing tours are prohibited.
                </p>
              )}
            </div>

            {/* Deliverable Selector */}
            <div>
              <label htmlFor="expectedDeliverable" className="block text-xs font-semibold text-slate-700 uppercase">
                Expected Student Deliverable (Post-Visit Academic Output) *
              </label>
              <select
                id="expectedDeliverable"
                value={expectedDeliverable}
                onChange={(e) => setExpectedDeliverable(e.target.value as any)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-purple-500"
              >
                <option value="report">Formal Technical Report (Mandatory 7-day post-visit submission)</option>
                <option value="quiz">Objective Knowledge Quiz / Assessment</option>
                <option value="project">Course Project / Laboratory Demonstration</option>
                <option value="case_study">Industry Case Study / Problem Analysis</option>
              </select>
            </div>

            {/* Faculty-in-Charge Sponsorship & Verification */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                Faculty-In-Charge Sponsorship & Email Verification
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="facultyName" className="block text-[11px] font-semibold text-slate-700">
                    Faculty Full Name *
                  </label>
                  <input
                    id="facultyName"
                    type="text"
                    required
                    placeholder="e.g. Dr. R. Karthikeyan"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="facultyEmail" className="block text-[11px] font-semibold text-slate-700">
                    Official Institutional Email *
                  </label>
                  <input
                    id="facultyEmail"
                    type="email"
                    required
                    placeholder="e.g. karthik@psgtech.edu"
                    value={facultyEmail}
                    onChange={(e) => setFacultyEmail(e.target.value)}
                    className={`mt-1 block w-full rounded-lg border p-2 text-xs text-slate-900 ${
                      !emailValidation.valid ? "border-red-400 bg-red-50/30" : "border-slate-300"
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="facultyPhone" className="block text-[11px] font-semibold text-slate-700">
                    Faculty Mobile Number *
                  </label>
                  <input
                    id="facultyPhone"
                    type="tel"
                    required
                    placeholder="+91 94432 18920"
                    value={facultyPhone}
                    onChange={(e) => setFacultyPhone(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Institutional Email Warning & Rural Exemption notice */}
              {!emailValidation.valid && (
                <div className="rounded-lg bg-red-50 p-2.5 border border-red-200 text-xs text-red-800 space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                    Consumer Freemail Domain Rejected
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {emailValidation.error}
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600">
                    <span>Small or rural institution lacking .edu domain?</span>
                    <button
                      type="button"
                      onClick={() => setAllowFreemailOverride(!allowFreemailOverride)}
                      className="text-blue-600 font-semibold underline hover:text-blue-800"
                    >
                      {allowFreemailOverride ? "Revert to strict mode" : "Simulate Admin Freemail Override"}
                    </button>
                  </div>
                </div>
              )}

              {allowFreemailOverride && isFreemailDomain(facultyEmail) && (
                <div className="rounded-lg bg-blue-50 p-2 border border-blue-200 text-[11px] text-blue-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  Admin Freemail Override Active: Documented manual institutional verification on file.
                </div>
              )}
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
              disabled={submitting || !gatekeeperCheck.allowed}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Submitting Request..." : "Submit Visit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}