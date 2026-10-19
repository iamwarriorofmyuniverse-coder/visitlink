import Link from "next/link";
import { Building2, Calendar, ClipboardList, ShieldAlert, Plus, Users, Clock, CheckCircle } from "lucide-react";

export default function IndustryDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Industry Host Portal
          </h1>
          <p className="text-sm text-slate-600">
            Manage your industrial facility profile, configure capacity slots, and screen student visit requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/industry/slots"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Calendar className="h-4 w-4" />
            Manage Slots
          </Link>
          <Link
            href="/industry/profile"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
          >
            <Building2 className="h-4 w-4" />
            Edit Facility Profile
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">3</div>
          <p className="text-xs text-amber-600 mt-1">Requires manager review & triage</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Slots / Week</span>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">4</div>
          <p className="text-xs text-slate-500 mt-1">Tue & Thu (10am-1pm, 2pm-5pm)</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Weekly Capacity</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">180 Students</div>
          <p className="text-xs text-emerald-600 mt-1">Zero overbooking guaranteed</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Safety Status</span>
            <ShieldAlert className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">Verified</div>
          <p className="text-xs text-blue-600 mt-1">PPE rules & Minors policy active</p>
        </div>
      </div>

      {/* Main Request Queue Preview */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Incoming Visit Requests</h2>
            <p className="text-xs text-slate-500">
              AI pre-screened requests waiting for your approval.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            3 Pending
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Sample Request 1 */}
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  PSG College of Technology [Demo]
                </span>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Undergraduate
                </span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  AI Triage: Pass
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Department: <span className="font-medium text-slate-800">4th Sem B.E. Mechanical Engineering</span> | Group: <span className="font-medium text-slate-800">40 Students, 3 Faculty</span> (Ratio 1:13 OK)
              </p>
              <p className="text-xs text-slate-500">
                Requested Slot: <span className="font-medium">Tuesday, Nov 10, 2026 (10:00 AM - 1:00 PM)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/industry/requests/demo-req-01"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Review & Triage
              </Link>
            </div>
          </div>

          {/* Sample Request 2 */}
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">
                  Stanes Higher Secondary School [Demo]
                </span>
                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  School / Minors Present
                </span>
                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  AI Triage: Flagged (Minors)
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Department: <span className="font-medium text-slate-800">11th Grade Science Stream</span> | Group: <span className="font-medium text-slate-800">30 Students, 2 Faculty</span>
              </p>
              <p className="text-xs text-slate-500">
                Requested Slot: <span className="font-medium">Thursday, Nov 12, 2026 (2:00 PM - 5:00 PM)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/industry/requests/demo-req-02"
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Review & Triage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
