"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Save,
  MapPin,
  ShieldAlert,
  Check,
  AlertCircle,
  Sparkles,
  BookOpen,
  Building,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Upload,
  Calendar,
  Layers,
  Wrench,
  Camera,
  Info,
} from "lucide-react";
import {
  ALLOWED_INTERACTIVE_ELEMENTS,
  type InteractiveElement,
  formatEngagementBadge,
} from "@/lib/engagement/profile";
import {
  ALLOWED_PROCESS_STAGES,
  ALLOWED_TECHNOLOGY_LEVELS,
  ALLOWED_CERT_TYPES,
  type ProcessStage,
  type TechnologyLevel,
  type CertificationType,
} from "@/lib/resourceful/capabilities";
import {
  calculateLearningValueScore,
  calculateHostingReadinessScore,
} from "@/lib/resourceful/scoring";

export default function IndustryProfilePage() {
  const [name, setName] = useState("Kovai Precision Foundry & Heavy Castings [Demo]");
  const [sector, setSector] = useState("foundry");
  const [address, setAddress] = useState("SF No. 142, Malumichampatti Industrial Area");
  const [city, setCity] = useState("Coimbatore");
  const [lat, setLat] = useState("10.9125");
  const [lng, setLng] = useState("76.9942");
  const [minGroupSize, setMinGroupSize] = useState(15);
  const [maxGroupSize, setMaxGroupSize] = useState(45);
  const [ratio, setRatio] = useState(15);
  const [minorsAllowed, setMinorsAllowed] = useState(false);
  const [minEduLevel, setMinEduLevel] = useState("undergraduate");
  const [ppeList, setPpeList] = useState<string[]>([
    "Steel-toe safety shoes",
    "Hard hat / Helmet",
    "Safety goggles",
    "Heavy cotton lab coats",
  ]);
  const [dressCode, setDressCode] = useState(
    "Strict long trousers and thick cotton shirts. No synthetic fibers or loose jewelry."
  );
  const [highlights, setHighlights] = useState(
    "Cupola furnace tapping, green sand automated moulding line, spectrographic metallurgy lab."
  );
  const [curriculumTopics, setCurriculumTopics] = useState(
    "Manufacturing processes, foundry technology, metallurgy, casting defect analysis, nondestructive testing."
  );

  // Student Engagement Profile State (Phase p1)
  const [interactiveElements, setInteractiveElements] = useState<InteractiveElement[]>([
    "live_demo",
    "q_and_a_engineers",
    "product_showcase",
  ]);
  const [qAndAAvailable, setQAndAAvailable] = useState(true);
  const [estimatedInteractiveMinutes, setEstimatedInteractiveMinutes] = useState(60);
  const [engagementNotes, setEngagementNotes] = useState(
    "Live cupola furnace molten tapping demo and chief metallurgist Q&A session."
  );

  // Resourceful Sites: Learning Capabilities State (Phase q1)
  const [processStages, setProcessStages] = useState<ProcessStage[]>([
    "raw_material_prep",
    "primary_forming",
    "surface_treatment",
    "quality_ndt_testing",
  ]);
  const [techLevels, setTechLevels] = useState<TechnologyLevel[]>([
    "semi_automated",
    "cnc",
  ]);
  const [liveDemoAvailable, setLiveDemoAvailable] = useState(true);
  const [handsOnAvailable, setHandsOnAvailable] = useState(false);
  const [engineerQaAvailable, setEngineerQaAvailable] = useState(true);
  const [guideAvailable, setGuideAvailable] = useState(true);
  const [studentObsDesc, setStudentObsDesc] = useState(
    "Students will observe the raw iron charging, cupola furnace thermal tapping, sand mold compaction, and ultrasonic casting flaw testing."
  );

  // Resourceful Sites: Hosting Readiness State (Phase q1)
  const [safeWalkway, setSafeWalkway] = useState(true);
  const [restrooms, setRestrooms] = useState(true);
  const [ppeSupplied, setPpeSupplied] = useState(true);
  const [briefingRoom, setBriefingRoom] = useState(true);
  const [avEquipment, setAvEquipment] = useState(true);
  const [visitorStaffCount, setVisitorStaffCount] = useState(3);

  // Photos & Listing
  const [photos, setPhotos] = useState<string[]>([
    "/images/facilities/foundry-cbe-01-1.jpg",
    "/images/facilities/foundry-cbe-01-2.jpg",
    "/images/facilities/foundry-cbe-01-3.jpg",
    "/images/facilities/foundry-cbe-01-4.jpg",
  ]);

  // Certifications
  const [certifications, setCertifications] = useState<any[]>([
    {
      id: "cert-1",
      cert_type: "ISO 9001",
      cert_file_path: "/storage/certs/foundry_iso9001.pdf",
      expiry_date: "2027-12-31",
      admin_verification_status: "verified",
    },
    {
      id: "cert-2",
      cert_type: "ISO 14001",
      cert_file_path: "/storage/certs/foundry_iso14001.pdf",
      expiry_date: "2026-11-30",
      admin_verification_status: "verified",
    },
  ]);

  const [newCertType, setNewCertType] = useState<CertificationType>("ISO 45001");
  const [newCertExpiry, setNewCertExpiry] = useState("2028-06-30");
  const [newCertFile, setNewCertFile] = useState("safety_iso45001.pdf");

  const [savedMsg, setSavedMsg] = useState(false);

  // Real-time score calculator preview
  const previewScores = useMemo(() => {
    const input = {
      process_stages_visible: processStages,
      technology_levels: techLevels,
      live_demo_available: liveDemoAvailable,
      hands_on_available: handsOnAvailable,
      engineer_qa_available: engineerQaAvailable,
      guide_available: guideAvailable,
      estimated_interactive_minutes: estimatedInteractiveMinutes,
      student_observation_description: studentObsDesc,
      briefing_room: briefingRoom,
      av_equipment: avEquipment,
      safe_visitor_walkway: safeWalkway,
      restrooms_available: restrooms,
      ppe_supplied: ppeSupplied,
      max_group_size: maxGroupSize,
      visitor_staff_count: visitorStaffCount,
      photos,
      certifications,
      admin_verified_claims: {
        safe_visitor_walkway: true,
        ppe_supplied: true,
        briefing_room: true,
      },
    };

    const learning = calculateLearningValueScore(input as any);
    const hosting = calculateHostingReadinessScore(input as any);

    return {
      learningScore: learning.score,
      hostingScore: hosting.score,
    };
  }, [
    processStages,
    techLevels,
    liveDemoAvailable,
    handsOnAvailable,
    engineerQaAvailable,
    guideAvailable,
    estimatedInteractiveMinutes,
    studentObsDesc,
    briefingRoom,
    avEquipment,
    safeWalkway,
    restrooms,
    ppeSupplied,
    maxGroupSize,
    visitorStaffCount,
    photos,
    certifications,
  ]);

  function handleAddCert(e: React.FormEvent) {
    e.preventDefault();
    if (!newCertExpiry || !newCertFile) return;
    setCertifications([
      ...certifications,
      {
        id: `cert-${Date.now()}`,
        cert_type: newCertType,
        cert_file_path: `/storage/certs/${newCertFile}`,
        expiry_date: newCertExpiry,
        admin_verification_status: "pending",
      },
    ]);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-4xl">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Facility Profile &amp; Hosting Readiness
          </h1>
          <p className="text-sm text-slate-600">
            Declare learning stages, safety equipment, and verified certifications for transparent VisitLink discovery.
          </p>
        </div>
        {savedMsg && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Check className="h-4 w-4" />
            Profile Saved
          </span>
        )}
      </div>

      {/* Live Score Preview Header Card */}
      <div className="mt-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/60 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-md">
              <Sparkles className="h-3.5 w-3.5" /> Live Discovery Score Preview
            </span>
            <h2 className="text-sm font-bold text-slate-900 mt-1">
              Transparent Scoring Checklist
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Self-declared items count at 50% weight until verified by admin during an on-site visit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-200 bg-white p-3 text-center min-w-[110px] shadow-xs">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Learning Value</span>
              <span className="text-2xl font-extrabold text-blue-700">{previewScores.learningScore}</span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-white p-3 text-center min-w-[110px] shadow-xs">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Hosting Ready</span>
              <span className="text-2xl font-extrabold text-emerald-700">{previewScores.hostingScore}</span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-blue-100 flex items-center gap-2 text-[11px] text-slate-600">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Anti-Bias Invariant:</strong> Plant age, company turnover, and photo aesthetics are strictly excluded from all algorithms.
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-8">
        {/* Section 1: Basic Facility Details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Basic Plant &amp; Geographic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Facility Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Industry Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500"
              >
                <option value="foundry">Foundry &amp; Castings</option>
                <option value="pumps">Pumps &amp; Hydraulics</option>
                <option value="textiles">Textile Automation</option>
                <option value="automotive">Automotive Sensors</option>
                <option value="manufacturing">Industrial Compressors</option>
                <option value="research_lab">Robotics &amp; 3D Lab</option>
                <option value="renewable_energy">Renewable Energy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Campus Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">City Hub</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Min Group Size</label>
              <input
                type="number"
                value={minGroupSize}
                onChange={(e) => setMinGroupSize(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Max Group Size</label>
              <input
                type="number"
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Visitor Staff Count</label>
              <input
                type="number"
                value={visitorStaffCount}
                onChange={(e) => setVisitorStaffCount(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Min Education</label>
              <select
                value={minEduLevel}
                onChange={(e) => setMinEduLevel(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500"
              >
                <option value="high_school">High School</option>
                <option value="diploma">Polytechnic Diploma</option>
                <option value="undergraduate">Undergraduate (B.E/B.Tech)</option>
                <option value="postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Learning Capabilities (Phase q1) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Learning Capabilities &amp; Process Visibility
            </h2>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Feeds Learning Score (0-100)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Process Stages Visible to Students
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALLOWED_PROCESS_STAGES.map((stage) => {
                const isChecked = processStages.includes(stage);
                return (
                  <button
                    type="button"
                    key={stage}
                    onClick={() => {
                      if (isChecked) {
                        setProcessStages(processStages.filter((s) => s !== stage));
                      } else {
                        setProcessStages([...processStages, stage]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                      isChecked
                        ? "border-blue-500 bg-blue-50/60 text-blue-900 ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{stage.replace(/_/g, " ")}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Technology Level Tags
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALLOWED_TECHNOLOGY_LEVELS.map((tech) => {
                const isChecked = techLevels.includes(tech);
                return (
                  <button
                    type="button"
                    key={tech}
                    onClick={() => {
                      if (isChecked) {
                        setTechLevels(techLevels.filter((t) => t !== tech));
                      } else {
                        setTechLevels([...techLevels, tech]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                      isChecked
                        ? "border-indigo-500 bg-indigo-50/60 text-indigo-900 ring-1 ring-indigo-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="capitalize">{tech.replace(/_/g, " ")}</span>
                      {isChecked && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={liveDemoAvailable}
                onChange={(e) => setLiveDemoAvailable(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span>Live Demonstration</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={handsOnAvailable}
                onChange={(e) => setHandsOnAvailable(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span>Hands-on Activity</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={engineerQaAvailable}
                onChange={(e) => setEngineerQaAvailable(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span>Engineer Q&amp;A</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-800 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={guideAvailable}
                onChange={(e) => setGuideAvailable(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span>Technical Guide</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              What Students Will Observe (Min 40 characters)
            </label>
            <textarea
              rows={3}
              value={studentObsDesc}
              onChange={(e) => setStudentObsDesc(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 3: Hosting Readiness & Safety Infrastructure (Phase q1) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-600" />
              Hosting Readiness &amp; Physical Infrastructure
            </h2>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Feeds Readiness Score (0-100)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={safeWalkway}
                onChange={(e) => setSafeWalkway(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Dedicated Visitor Safety Walkway</span>
                <span className="text-[11px] text-slate-500">Demarcated yellow safety gangway separated from heavy machinery</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={restrooms}
                onChange={(e) => setRestrooms(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Student Restrooms Available</span>
                <span className="text-[11px] text-slate-500">Clean on-site sanitation facilities for student batches</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={ppeSupplied}
                onChange={(e) => setPpeSupplied(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">PPE Supplied On-Site</span>
                <span className="text-[11px] text-slate-500">Host provides helmets, protective goggles, and vests</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={briefingRoom}
                onChange={(e) => setBriefingRoom(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Visitor Briefing Room</span>
                <span className="text-[11px] text-slate-500">Dedicated orientation hall before plant tour</span>
              </div>
            </label>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={avEquipment}
                onChange={(e) => setAvEquipment(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">AV Equipment / Projector in Briefing Room</span>
                <span className="text-[11px] text-slate-500">Screen projection available for pre-visit engineering slides</span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 4: Verified Certifications Manager (Phase q1) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Verified Industry Certifications (ISO / IATF / NABL)
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              {certifications.length} certificates on file
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Verified certifications award 10 points to Hosting Readiness score. Expired certificates automatically forfeit points.
          </p>

          <div className="space-y-2">
            {certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-slate-900">{cert.cert_type}</span>
                    <span className="block text-[11px] text-slate-500 font-mono">
                      Expires: {cert.expiry_date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cert.admin_verification_status === "verified" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" /> Admin Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Pending Audit
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setCertifications(certifications.filter((c) => c.id !== cert.id))}
                    className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Certification Form */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Upload New Certificate
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Cert Standard</label>
                <select
                  value={newCertType}
                  onChange={(e) => setNewCertType(e.target.value as any)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                >
                  {ALLOWED_CERT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Expiry Date</label>
                <input
                  type="date"
                  value={newCertExpiry}
                  onChange={(e) => setNewCertExpiry(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">Certificate PDF</label>
                <input
                  type="text"
                  value={newCertFile}
                  onChange={(e) => setNewCertFile(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddCert}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-2xs"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Certificate for Admin Verification
            </button>
          </div>
        </div>

        {/* Section 5: Real Facility Photos (Min 4 Real Photos Required) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-slate-700" />
              Plant Photography (Minimum 4 Real Photos)
            </h2>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              photos.length >= 4
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {photos.length}/4 Minimum
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Real photos of production lines, safety gangways, and briefing areas help coordinators prepare students. Stock photography or marketing mockups are strictly rejected by admins.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map((p, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center p-2 text-center"
              >
                <span className="text-[11px] font-mono text-slate-600 truncate">{p.split("/").pop()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Save className="h-4 w-4" />
            Save Profile &amp; Submit Capabilities
          </button>
        </div>
      </form>
    </div>
  );
}
