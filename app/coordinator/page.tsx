"use client";

import Link from "next/link";
import {
  School,
  Compass,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  ArrowRight,
  ShieldCheck,
  Plus,
} from "lucide-react";

export default function CoordinatorDashboardPage() {
  const requests = [
    {
      id: "req-cbe-01",
      facility: "Kovai Precision Foundry & Heavy Castings [Demo]",
      sector: "Foundry & Heavy Engineering",
      date: "Nov 10, 2026",
      time: "10:00 AM - 01:00 PM",
      students: 30,
      teachers: 2,
      department: "4th Sem B.E. Mechanical Engineering",
      status: "approved",
      statusLabel: "Approved",
      statusColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      complianceStatus: "Verified & Locked",
    },
    {
      id: "req-cbe-02",
      facility: "Marudham Automated Textile Machineries [Demo]",
      sector: "Textile Machinery & Automation",
      date: "Nov 18, 2026",
      time: "02:00 PM - 05:00 PM",
      students: 25,
      teachers: 2,
      department: "5th Sem Textile Technology",
      status: "pending",
      statusLabel: "Pending Triage",
      statusColor: "bg-amber-100 text-amber-800 border-amber-200",
      complianceStatus: "AI Pre-screening Passed",
    },
    {
      id: "req-cbe-03",
      facility: "Siruvani Eco Water & Agro-Tech Processing [Demo]",
      sector: "Food Processing & Agro-Tech",
      date: "Oct 12, 2026",
      time: "10:00 AM - 01:00 PM",
      students: 40,
      teachers: 3,
      department: "3rd Sem Biotechnology",
      status: "completed",
      statusLabel: "Completed",
      statusColor: "bg-blue-100 text-blue-800 border-blue-200",
      complianceStatus: "Feedback Submitted (4.9/5)",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-transparent dark:border-blue-800 px-2 py-0.5 text-xs font-semibold">
              PSG College of Technology [Demo]
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Coimbatore Central Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Coordinator Visit Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Search nearby industries, coordinate visit schedules, and monitor student compliance rosters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/coordinator/explore"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Compass className="h-4 w-4" />
            Explore Industries
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Bookings</span>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">2</div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">1 Approved, 1 Pending</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Students Participating</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">95</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across 3 academic departments</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Status</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">100%</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Parental consent & ratio validated</p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Visits</span>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">1</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average rating: 4.9/5</p>
        </div>
      </div>

      {/* Safety Checklist Reminder Callout */}
      <div className="mt-6 rounded-xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div>
            <span className="font-semibold text-blue-900 dark:text-blue-200">
              Mandatory Safety & Compliance Guardrails
            </span>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              1:15 faculty-to-student escort ratio required. Signed parental consent slips must be uploaded for students under 18 prior to facility dispatch.
            </p>
          </div>
        </div>
        <Link
          href="/coordinator/explore"
          className="whitespace-nowrap text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition flex items-center gap-1"
        >
          Book new facility visit <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Visit Requests Table */}
      <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">My Visit Requests</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track status history, view approved slot passes, and complete post-visit reviews.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {requests.map((req) => (
            <div
              key={req.id}
              className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 p-3 rounded-xl transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {req.facility}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${req.statusColor}`}
                  >
                    {req.statusLabel}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {req.date} ({req.time})
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {req.students} Students ({req.teachers} Faculty)
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                    {req.department}
                  </span>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  Compliance: <span className="text-slate-600 dark:text-slate-300">{req.complianceStatus}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/coordinator/requests/${req.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  View Details & Status
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                {req.status === "completed" && (
                  <Link
                    href={`/feedback/${req.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                  >
                    View Feedback
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
