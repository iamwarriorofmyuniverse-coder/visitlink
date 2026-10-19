"use client";

import Link from "next/link";
import { ShieldCheck, CheckCircle2, XCircle, FileText, AlertTriangle, Building2, School } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            Platform Admin & Verification Center
          </h1>
          <p className="text-sm text-slate-600">
            Audit registered institutions, verify host industrial facilities, and monitor safety compliance.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Pending Verifications
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">2</div>
          <p className="text-xs text-slate-500 mt-1">1 Industry, 1 Institution</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Verified Facilities
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">20</div>
          <p className="text-xs text-emerald-600 mt-1">Coimbatore Hub Active</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Verified Institutions
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">10</div>
          <p className="text-xs text-emerald-600 mt-1">Engineering Colleges & Schools</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Completed Visits
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">48</div>
          <p className="text-xs text-blue-600 mt-1">Average Rating: 4.9/5</p>
        </div>
      </div>

      {/* Verification Queue Section */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Entity Verification Queue</h2>
            <p className="text-xs text-slate-500">
              Review official registration documentation before granting verified badge.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            2 Pending Review
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Queue Item 1 */}
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-slate-900">
                  Marudham Automated Textile Machineries [Demo]
                </span>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Industry / Facility
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Location: Mettupalayam Highway, Periyanaickenpalayam | Sector: Textiles
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Attached: Factory_License_Certificate_2026.pdf (Verified GST/CIN)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("Verification approved. Facility is now verified and active in public search.")}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve & Verify
              </button>
              <button
                type="button"
                onClick={() => alert("Verification rejected with request for additional documentation.")}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
          </div>

          {/* Queue Item 2 */}
          <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <School className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-slate-900">
                  Kumaraguru College of Technology (KCT) [Demo]
                </span>
                <span className="rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                  Institution
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Location: Athipalayam Road, Chinnavedampatti | Affiliation: Anna University Autonomous
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                Attached: AICTE_Affiliation_Order_2026.pdf
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert("Verification approved. College coordinator can now submit visit requests.")}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve & Verify
              </button>
              <button
                type="button"
                onClick={() => alert("Verification rejected.")}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
