"use client";

import { useState } from "react";
import { Building2, Save, MapPin, ShieldAlert, Check, AlertCircle, Sparkles } from "lucide-react";
import {
  ALLOWED_INTERACTIVE_ELEMENTS,
  type InteractiveElement,
  formatEngagementBadge,
} from "@/lib/engagement/profile";

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

  const [savedMsg, setSavedMsg] = useState(false);

  const availablePPE = [
    "Steel-toe safety shoes",
    "Hard hat / Helmet",
    "Safety goggles",
    "Ear defenders / plugs",
    "High-visibility vest",
    "Heavy cotton lab coats",
    "Shoe covers / Booties",
    "ESD wristband (cleanroom)",
    "Dust mask",
  ];

  function togglePPE(item: string) {
    if (ppeList.includes(item)) {
      setPpeList(ppeList.filter((p) => p !== item));
    } else {
      setPpeList([...ppeList, item]);
    }
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
            Facility Profile & Safety Compliance
          </h1>
          <p className="text-sm text-slate-600">
            Define visit boundaries, PPE rules, and curriculum keywords for AI matching.
          </p>
        </div>
        {savedMsg && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <Check className="h-4 w-4" />
            Profile Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="mt-6 space-y-8">
        {/* Basic Facility Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            General Facility Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Facility / Plant Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Industrial Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="foundry">Foundry & Heavy Castings</option>
                <option value="pumps">Pumps & Fluid Systems</option>
                <option value="textiles">Textile Machinery & Automation</option>
                <option value="automotive">Automotive Sensors & Telematics</option>
                <option value="manufacturing">Industrial Air Compressors</option>
                <option value="electronics">Switchgear & Relays</option>
                <option value="food_processing">Food Processing & Bio-Agriculture</option>
                <option value="renewable_energy">Renewable Energy & Wind Power</option>
                <option value="research_lab">Robotics & Additive Manufacturing</option>
                <option value="information_technology">Data Centers & Cloud Ops</option>
              </select>
            </div>
          </div>

          {/* Location Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Safety & Eligibility Guardrails */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            Safety Rules & Group Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Min Group Size
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={minGroupSize}
                onChange={(e) => setMinGroupSize(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Max Group Size
              </label>
              <input
                type="number"
                min="10"
                max="150"
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Teacher-to-Student Ratio
              </label>
              <div className="mt-1 flex items-center">
                <span className="text-sm font-medium text-slate-500 mr-2">1 teacher per</span>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={ratio}
                  onChange={(e) => setRatio(parseInt(e.target.value))}
                  className="block w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-500 ml-2">students</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Minimum Education Level
              </label>
              <select
                value={minEduLevel}
                onChange={(e) => setMinEduLevel(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="middle_school">Middle School (Grades 6-8)</option>
                <option value="high_school">High School (Grades 9-12)</option>
                <option value="undergraduate">Undergraduate (College / Engg)</option>
                <option value="postgraduate">Postgraduate (Masters / Research)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Minors Allowed (&lt; 18 years)
              </label>
              <div className="mt-2 flex items-center gap-4">
                <label className="inline-flex items-center text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="minors"
                    checked={minorsAllowed === true}
                    onChange={() => setMinorsAllowed(true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">Yes (Consent Form Required)</span>
                </label>
                <label className="inline-flex items-center text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="minors"
                    checked={minorsAllowed === false}
                    onChange={() => setMinorsAllowed(false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">No (Strictly 18+ Only)</span>
                </label>
              </div>
            </div>
          </div>

          {/* PPE Selection */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Mandatory PPE Checklist (Students Must Bring or Wear)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {availablePPE.map((ppe) => (
                <button
                  type="button"
                  key={ppe}
                  onClick={() => togglePPE(ppe)}
                  className={`text-left text-xs p-2.5 rounded-lg border transition ${
                    ppeList.includes(ppe)
                      ? "border-blue-600 bg-blue-50 text-blue-800 font-semibold"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {ppeList.includes(ppe) ? "✓ " : "+ "}
                  {ppe}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Dress Code & Shop-Floor Safety Instructions
            </label>
            <textarea
              rows={2}
              value={dressCode}
              onChange={(e) => setDressCode(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* AI Semantic Indexing Fields */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Academic Alignment & Curriculum Keywords
          </h2>
          <p className="text-xs text-slate-500">
            These fields are embedded using <code>BAAI/bge-small-en-v1.5</code> so college coordinators can discover your plant when searching for specific engineering or science courses.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              What Students Will See (Highlights)
            </label>
            <textarea
              rows={2}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">
              Relevant Curriculum & Syllabus Topics
            </label>
            <textarea
              rows={2}
              value={curriculumTopics}
              onChange={(e) => setCurriculumTopics(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Student Engagement Profile Section (Phase p1) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Student Engagement & Interactive Offerings
            </h2>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Curricular Engagement
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Declare the interactive engineering and observation components your plant provides to students. These appear as verified badges in facility discovery.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
              Available Interactive Elements (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALLOWED_INTERACTIVE_ELEMENTS.map((elem) => {
                const badge = formatEngagementBadge(elem);
                const isChecked = interactiveElements.includes(elem);
                return (
                  <button
                    type="button"
                    key={elem}
                    onClick={() => {
                      if (isChecked) {
                        setInteractiveElements(interactiveElements.filter((e) => e !== elem));
                      } else {
                        setInteractiveElements([...interactiveElements, elem]);
                      }
                    }}
                    className={`text-left p-3 rounded-xl border transition ${
                      isChecked
                        ? "border-blue-500 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{badge.label}</span>
                      <span className={`text-xs ${isChecked ? "text-blue-600" : "text-slate-400"}`}>
                        {isChecked ? "✓ Selected" : "+ Add"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {badge.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="estimatedInteractiveMinutes" className="block text-xs font-semibold text-slate-700 uppercase">
                Estimated Interactive Duration (Minutes, 0-240)
              </label>
              <input
                id="estimatedInteractiveMinutes"
                type="number"
                min="0"
                max="240"
                value={estimatedInteractiveMinutes}
                onChange={(e) => setEstimatedInteractiveMinutes(parseInt(e.target.value) || 0)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Time dedicated specifically to hands-on, live demos, or Q&A.
              </span>
            </div>

            <div className="flex flex-col justify-center pt-4 sm:pt-0">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={qAndAAvailable}
                  onChange={(e) => setQAndAAvailable(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>Dedicated Q&A with Lead Plant Engineers Available</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="engagementNotes" className="block text-xs font-semibold text-slate-700 uppercase">
              Engagement Instructions & Technical Context
            </label>
            <textarea
              id="engagementNotes"
              rows={2}
              value={engagementNotes}
              onChange={(e) => setEngagementNotes(e.target.value)}
              placeholder="e.g. Students will be given demo sand cores to examine before furnace tapping..."
              className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
            <strong>Scope Notice:</strong> VisitLink student engagement tools are designed exclusively to deepen academic understanding. Tourism extras, amusement metrics, or entertainment ratings are not collected or permitted.
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Save className="h-4 w-4" />
            Save Profile & Update Embeddings
          </button>
        </div>
      </form>
    </div>
  );
}
