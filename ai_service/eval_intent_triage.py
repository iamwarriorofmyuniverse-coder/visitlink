"""
Evaluation script for Educational Intent Triage (Phase m4).
Reads a user-provided labeled dataset of genuine vs. weak-intent requests
and reports Precision, Recall, and False Positive Rate.

Optimizes for avoiding False Positives (high precision), as wrongly flagging
a genuine school visit is the costly marketplace error.
"""

import os
import sys
import json
from typing import Dict, Any, List

def run_evaluation(dataset_path: str = "ai_service/eval_intent_set.json"):
    if not os.path.exists(dataset_path):
        print(f"\n[INFO] Labeled evaluation file '{dataset_path}' not found.")
        print("As per project instructions, zero synthetic labels are fabricated.")
        print("\nPlease provide your labeled JSON dataset with schema:")
        print("""[
  {
    "id": "eval-01",
    "ground_truth": "weak_intent", // or "genuine"
    "request": {
      "learning_objectives": ["..."],
      "pre_visit_agenda": "...",
      "syllabus_topic": "...",
      "course_or_subject": "..."
    }
  }
]""")
        return

    with open(dataset_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    print(f"\nRunning Educational Intent Triage Evaluation on {len(cases)} labeled cases...")
    print(f"Dataset: {dataset_path}")

    tp = 0 # Weak intent correctly flagged
    fp = 0 # Genuine visit wrongly flagged (Costly error!)
    tn = 0 # Genuine visit passed without flag
    fn = 0 # Weak intent missed

    # Import triage endpoint logic
    sys.path.append(os.path.dirname(__file__))
    from main import RequestPayload, IndustryRules, TriageRequest, triage_request

    default_rules = IndustryRules(
        max_group_size=50,
        min_group_size=10,
        student_to_teacher_ratio=15,
        minors_allowed=True,
        min_education_level="undergraduate",
        ppe_requirements=["safety_shoes"]
    )

    for case in cases:
        req_data = case["request"]
        ground_truth = case["ground_truth"] # "genuine" or "weak_intent"

        payload = RequestPayload(
            student_count=req_data.get("student_count", 30),
            teacher_count=req_data.get("teacher_count", 2),
            has_minors=req_data.get("has_minors", False),
            education_level=req_data.get("education_level", "undergraduate"),
            course_or_subject=req_data.get("course_or_subject", "Mechanical Engineering"),
            visit_objectives=req_data.get("visit_objectives", "Understand casting processes"),
            learning_objectives=req_data.get("learning_objectives"),
            syllabus_topic=req_data.get("syllabus_topic"),
            pre_visit_agenda=req_data.get("pre_visit_agenda")
        )

        triage_req = TriageRequest(industry_rules=default_rules, request_payload=payload)
        res = triage_request(triage_req)

        is_flagged = bool(res.intent_assessment and res.intent_assessment.intent_flags)

        if ground_truth == "weak_intent":
            if is_flagged:
                tp += 1
            else:
                fn += 1
        elif ground_truth == "genuine":
            if is_flagged:
                fp += 1
            else:
                tn += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    print("\n" + "=" * 50)
    print("EDUCATIONAL INTENT TRIAGE EVALUATION METRICS")
    print("=" * 50)
    print(f"Total Cases:         {len(cases)}")
    print(f"True Positives (TP): {tp}")
    print(f"False Positives(FP): {fp} (Target: Minimise this!)")
    print(f"True Negatives (TN): {tn}")
    print(f"False Negatives(FN): {fn}")
    print("-" * 50)
    print(f"Precision:           {precision:.2%}")
    print(f"Recall:              {recall:.2%}")
    print(f"False Positive Rate: {fpr:.2%}")
    print("=" * 50)

if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "ai_service/eval_intent_set.json"
    run_evaluation(path)
