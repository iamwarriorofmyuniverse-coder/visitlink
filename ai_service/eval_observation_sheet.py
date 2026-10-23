"""
Evaluation script for Student Observation Sheet Generation (Phase p3).
Evaluates observation question relevance, target specificity, and syllabus coverage
against a user-provided labeled evaluation set.

ZERO FABRICATION CONTRACT:
If no labeled evaluation file is provided, this script halts cleanly and prompts
the user for the labeled dataset without synthesizing artificial data.
"""

import os
import sys
import json
from typing import Dict, Any, List

def run_evaluation(dataset_path: str = "ai_service/eval_observation_sheets.json"):
    if not os.path.exists(dataset_path):
        print(f"\n[INFO] Labeled evaluation file '{dataset_path}' not found.")
        print("As per project instructions, zero synthetic labels are fabricated.")
        print("\nPlease provide your labeled evaluation dataset with schema:")
        print("""[
  {
    "id": "eval-obs-01",
    "request": {
      "visit_request_id": "req-01",
      "facility_name": "Kovai Precision Foundry",
      "sector": "foundry",
      "course_name": "Manufacturing Technology",
      "syllabus_topic": "Metal Casting & Moulding",
      "learning_objectives": [
        "Study automated green sand moulding lines and cupola furnace melting",
        "Observe CNC precision machining operations and CMM quality metrology"
      ]
    },
    "expected_topics": [
      "Metal Casting",
      "Precision CNC Machining",
      "Quality Metrology"
    ],
    "min_acceptable_questions": 2
  }
]""")
        return

    with open(dataset_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    print(f"\nRunning Observation Sheet Generation Evaluation on {len(cases)} labeled cases...")
    print(f"Dataset: {dataset_path}")

    sys.path.append(os.path.dirname(__file__))
    from main import ObservationSheetRequest, ObservationSheetDraft, generate_observation_sheet

    passed_cases = 0
    total_cases = len(cases)

    for case in cases:
        req = case["request"]
        expected_topics = [t.lower() for t in case.get("expected_topics", [])]
        min_questions = case.get("min_acceptable_questions", 2)

        payload = ObservationSheetRequest(**req)
        # In test mode, run synchronous generator
        draft = generate_observation_sheet(payload)

        has_min_questions = len(draft.questions) >= min_questions
        topics_covered = sum(1 for exp in expected_topics if any(exp in q.topic.lower() or exp in q.prompt.lower() for q in draft.questions))
        coverage_ratio = topics_covered / max(1, len(expected_topics))

        if has_min_questions and coverage_ratio >= 0.6:
            passed_cases += 1
            print(f"  [PASS] Case {case['id']}: {len(draft.questions)} questions generated, {coverage_ratio*100:.0f}% syllabus topic coverage.")
        else:
            print(f"  [FAIL] Case {case['id']}: {len(draft.questions)} questions, coverage {coverage_ratio*100:.0f}%.")

    print("\n" + "=" * 55)
    print("OBSERVATION SHEET GENERATION BENCHMARK RESULTS")
    print("=" * 55)
    print(f"Total Evaluated Cases:     {total_cases}")
    print(f"Successful Passes:          {passed_cases}")
    print(f"Overall Generation Pass:    {(passed_cases/max(1, total_cases))*100:.1f}%")
    print("=" * 55)

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "ai_service/eval_observation_sheets.json"
    run_evaluation(path)
