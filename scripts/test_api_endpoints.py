import urllib.request
import json

def test_api():
    print("Testing /match endpoint...")
    match_payload = {
        "user_lat": 11.0168,
        "user_lng": 76.9558,
        "radius_km": 25.0,
        "course_or_subject": "Automobile Engineering",
        "department_or_grade": "6th Sem Mechanical",
        "visit_objectives": "Observe automotive telematics, sensor manufacturing and surface mount pick-and-place lines",
        "education_level": "undergraduate",
        "group_size": 35,
        "weight_semantic": 0.7,
        "weight_distance": 0.3
    }
    req = urllib.request.Request(
        "http://127.0.0.1:8000/match",
        data=json.dumps(match_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    match_data = json.loads(res.read().decode("utf-8"))
    
    print("\n--- MATCH RESULTS (Top 3 Facilities for Automotive Telematics) ---")
    for r in match_data["ranked_results"][:3]:
        print(f"[{r['readable_id']}] {r['name']}")
        print(f"  Similarity: {r['semantic_similarity']:.4f} | Distance: {r['distance_km']} km | Final Combined Score: {r['combined_score']:.4f}")

    # Assert that all results are within radius
    assert all(r["distance_km"] <= match_payload["radius_km"] for r in match_data["ranked_results"]), "All results must be within 25km radius"
    
    # Assert that automotive-cbe-01 is retrieved with high semantic similarity
    auto_plant = next(r for r in match_data["ranked_results"] if r["readable_id"] == "automotive-cbe-01")
    assert auto_plant["semantic_similarity"] > 0.70, f"Expected high semantic similarity, got {auto_plant['semantic_similarity']}"
    print(f"\nSUCCESS: Hybrid scoring executed with distance-semantic balance! Automotive plant similarity: {auto_plant['semantic_similarity']:.4f}")

    print("\nTesting /triage endpoint...")
    triage_payload = {
        "industry_rules": {
            "max_group_size": 40,
            "min_group_size": 10,
            "student_to_teacher_ratio": 15,
            "minors_allowed": False,
            "min_education_level": "undergraduate",
            "ppe_requirements": ["Safety shoes", "Helmet"]
        },
        "request_payload": {
            "student_count": 35,
            "teacher_count": 3,
            "has_minors": False,
            "education_level": "undergraduate",
            "course_or_subject": "Manufacturing Processes",
            "department_or_grade": "4th Sem Mechanical",
            "visit_objectives": "Foundry inspection"
        }
    }
    req2 = urllib.request.Request(
        "http://127.0.0.1:8000/triage",
        data=json.dumps(triage_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res2 = urllib.request.urlopen(req2)
    triage_data = json.loads(res2.read().decode("utf-8"))

    print("\n--- TRIAGE RESULTS ---")
    print(f"Verdict: {triage_data['overall_verdict']}")
    print(f"Human Review Required: {triage_data['requires_human_review']}")
    print(f"Rules Evaluated: {len(triage_data['rule_evaluations'])}")
    print(f"Generated Draft Reply: {triage_data['draft_reply']}")

    assert triage_data["overall_verdict"] == "pass"
    assert triage_data["requires_human_review"] is True
    print("\nSUCCESS: Triage returned strict Pydantic validated response with mandatory human approval flag.")

if __name__ == "__main__":
    test_api()
