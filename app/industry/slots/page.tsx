"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2, Clock, Users, CheckCircle, AlertCircle } from "lucide-react";
import { formatTime, getDayName } from "@/lib/utils";

interface SlotItem {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_capacity: number;
  is_recurring: boolean;
  is_active: boolean;
}

export default function IndustrySlotsPage() {
  const [slots, setSlots] = useState<SlotItem[]>([
    {
      id: "slot-01",
      day_of_week: 2, // Tuesday
      start_time: "10:00",
      end_time: "13:00",
      max_capacity: 45,
      is_recurring: true,
      is_active: true,
    },
    {
      id: "slot-02",
      day_of_week: 4, // Thursday
      start_time: "14:00",
      end_time: "17:00",
      max_capacity: 45,
      is_recurring: true,
      is_active: true,
    },
    {
      id: "slot-03",
      day_of_week: 6, // Saturday
      start_time: "09:30",
      end_time: "12:30",
      max_capacity: 40,
      is_recurring: true,
      is_active: false,
    },
  ]);

  const [dayOfWeek, setDayOfWeek] = useState(2);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("13:00");
  const [capacity, setCapacity] = useState(45);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    const newSlot: SlotItem = {
      id: `slot-${Date.now()}`,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      max_capacity: capacity,
      is_recurring: true,
      is_active: true,
    };
    setSlots([...slots, newSlot]);
    setShowAddModal(false);
    setSuccessMsg("New visit slot added successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  }

  function toggleSlotActive(id: string) {
    setSlots(
      slots.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
  }

  function deleteSlot(id: string) {
    setSlots(slots.filter((s) => s.id !== id));
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Visit Slot Capacity Engine
          </h1>
          <p className="text-sm text-slate-600">
            Define available time windows and student capacity caps. Concurrency engine serializes approvals to prevent overbooking.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
        >
          <Plus className="h-4 w-4" />
          Add Visit Slot
        </button>
      </div>

      {successMsg && (
        <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
          {successMsg}
        </div>
      )}

      {/* Slots List */}
      <div className="mt-6 space-y-4">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border transition ${
              slot.is_active
                ? "bg-white border-slate-200 shadow-sm"
                : "bg-slate-50 border-slate-200 opacity-60"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-sm ${
                  slot.is_active
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {getDayName(slot.day_of_week).substring(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">
                    Every {getDayName(slot.day_of_week)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      slot.is_active
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {slot.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    Max Capacity: {slot.max_capacity} Students
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => toggleSlotActive(slot.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
              >
                {slot.is_active ? "Pause Slot" : "Activate Slot"}
              </button>
              <button
                type="button"
                onClick={() => deleteSlot(slot.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Delete Slot"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Add Recurring Visit Slot</h2>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Max Student Capacity (Headcount Cap)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(parseInt(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Requests exceeding this limit will be rejected by the transactional capacity engine.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-500 transition"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
