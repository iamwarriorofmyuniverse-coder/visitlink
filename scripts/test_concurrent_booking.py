"""
VisitLink: Concurrent-Booking Race Condition Simulation & Verification
Tests the atomic capacity locking mechanism of the approve_visit_request stored procedure.

Scenario:
- A slot has maximum capacity = 40.
- Currently approved students = 0.
- Two coordinators simultaneously submit requests for 30 students each.
- Under naive non-locking logic: both requests see (0 + 30 <= 40) and both approve -> 60 students booked (OVERBOOKING DISASTER).
- Under VisitLink atomic logic (SELECT FOR UPDATE row-locking on the slot):
  - Request 1 acquires row lock: (0 + 30 <= 40) -> APPROVED, new total = 30.
  - Request 2 waits for lock release, then inspects: (30 + 30 > 40) -> REJECTED with CapacityExceeded.
"""

import threading
import time
from typing import Dict, Any

class MockVisitSlot:
    def __init__(self, slot_id: str, max_capacity: int):
        self.slot_id = slot_id
        self.max_capacity = max_capacity
        self.approved_students = 0
        self.lock = threading.Lock()  # Simulates PostgreSQL row-level lock (SELECT ... FOR UPDATE)

    def atomic_approve(self, request_id: str, student_count: int) -> Dict[str, Any]:
        """Simulates the PostgreSQL stored procedure approve_visit_request"""
        # 1. Acquire row-level lock (FOR UPDATE)
        with self.lock:
            # 2. Check current booked count
            current_booked = self.approved_students
            new_total = current_booked + student_count

            # Simulate slight database processing delay to test race susceptibility
            time.sleep(0.05)

            # 3. Capacity verification
            if new_total > self.max_capacity:
                return {
                    "success": False,
                    "error": f"Capacity exceeded. Slot maximum is {self.max_capacity}, currently approved is {current_booked}, requested is {student_count}",
                    "status_code": 409
                }

            # 4. Update status & increment approved attendees
            self.approved_students = new_total
            return {
                "success": True,
                "message": "Request approved successfully",
                "remaining_capacity": self.max_capacity - new_total,
                "status_code": 200
            }


def test_concurrent_booking_race():
    print("=" * 70)
    print("RUNNING CONCURRENT-BOOKING RACE TEST (Atomic Capacity Locking Engine)")
    print("=" * 70)

    # Setup slot with capacity 40
    slot = MockVisitSlot("slot-foundry-cbe-01", max_capacity=40)
    results = {}

    def worker(worker_id: str, req_id: str, students: int):
        print(f"[{worker_id}] Attempting to approve request {req_id} for {students} students...")
        res = slot.atomic_approve(req_id, students)
        results[worker_id] = res
        print(f"[{worker_id}] Result: status_code={res['status_code']}, success={res['success']}")

    # Create two threads attempting simultaneous approval for 30 students each
    t1 = threading.Thread(target=worker, args=("Worker-1 (PSG Tech)", "req-01", 30))
    t2 = threading.Thread(target=worker, args=("Worker-2 (CIT)", "req-02", 30))

    t1.start()
    t2.start()

    t1.join()
    t2.join()

    print("\n--- Verification Results ---")
    print(f"Total Approved Students: {slot.approved_students} / {slot.max_capacity}")
    
    statuses = [r["status_code"] for r in results.values()]
    print(f"HTTP Status Codes returned: {statuses}")

    # Exactly one must succeed (200) and one must be rejected (409)
    assert statuses.count(200) == 1, f"Expected exactly 1 success, got {statuses.count(200)}"
    assert statuses.count(409) == 1, f"Expected exactly 1 conflict (409), got {statuses.count(409)}"
    assert slot.approved_students <= slot.max_capacity, "OVERBOOKING DETECTED! Capacity check failed."

    print("SUCCESS: Zero overbooking! Atomic capacity locking serialized concurrent requests safely.")
    print("=" * 70)

if __name__ == "__main__":
    test_concurrent_booking_race()
