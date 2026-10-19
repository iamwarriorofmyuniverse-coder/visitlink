import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
import pytest
from eval.metrics import compute_recall_at_k, compute_ndcg_at_k, compute_precision_recall_flags
from fastembed import TextEmbedding

# Paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MATCHING_FILE = os.path.join(DATA_DIR, "matching_labeled_set.json")
TRIAGE_FILE = os.path.join(DATA_DIR, "triage_labeled_set.json")
CATALOG_FILE = os.path.join(os.path.dirname(__file__), "..", "supabase", "seed_catalog.json")

def run_keyword_search_baseline(query_text: str, catalog: list, top_k: int = 5):
    """Simple keyword matching baseline: counts word overlaps."""
    q_words = set(query_text.lower().split())
    scored = []
    for item in catalog:
        item_text = f"{item['name']} {item['sector']} {item['curriculum_topics']} {item['highlights']}".lower()
        overlap = sum(1 for w in q_words if w in item_text)
        scored.append((overlap, item["readable_id"]))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item_id for _, item_id in scored[:top_k]]

def run_semantic_matching(query_text: str, catalog: list, embedder: TextEmbedding, top_k: int = 5):
    """Semantic vector cosine similarity matching."""
    q_vec = list(embedder.embed([query_text]))[0]
    texts = [
        f"{c['name']}. Sector: {c['sector']}. Highlights: {c['highlights']}. Curriculum Topics: {c['curriculum_topics']}"
        for c in catalog
    ]
    vecs = list(embedder.embed(texts))

    import math
    def cos_sim(v1, v2):
        dot = sum(a * b for a, b in zip(v1, v2))
        n1 = math.sqrt(sum(a * a for a in v1))
        n2 = math.sqrt(sum(b * b for b in v2))
        return dot / (n1 * n2) if n1 and n2 else 0.0

    scored = []
    for c, vec in zip(catalog, vecs):
        sim = cos_sim(q_vec, vec)
        scored.append((sim, c["readable_id"]))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item_id for _, item_id in scored[:top_k]]


def test_matching_eval_benchmark():
    """
    Evaluates Keyword Baseline vs Semantic Matching on user-provided ground-truth dataset.
    Strict non-fabrication rule: If file is missing, skips and notifies user.
    """
    if not os.path.exists(MATCHING_FILE) or os.path.getsize(MATCHING_FILE) == 0:
        pytest.skip(
            f"Ground-truth matching labeled dataset ({MATCHING_FILE}) not yet provided. "
            "Please author labels against supabase/seed_catalog.json to run this benchmark."
        )

    with open(MATCHING_FILE, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    with open(CATALOG_FILE, "r", encoding="utf-8") as f:
        catalog_data = json.load(f)
    industries = catalog_data["industries"]

    embedder = TextEmbedding("BAAI/bge-small-en-v1.5")

    keyword_recalls = []
    keyword_ndcgs = []
    semantic_recalls = []
    semantic_ndcgs = []

    print("\n" + "=" * 65)
    print("MATCHING BENCHMARK: Keyword Baseline vs. Semantic Matching")
    print("=" * 65)

    for case in test_cases:
        query = f"{case.get('course_or_subject', '')} {case.get('visit_objectives', '')}"
        actual = case["relevant_industry_ids"]

        kw_pred = run_keyword_search_baseline(query, industries, top_k=5)
        sem_pred = run_semantic_matching(query, industries, embedder, top_k=5)

        kw_rec = compute_recall_at_k(actual, kw_pred, k=5)
        kw_ndcg = compute_ndcg_at_k(actual, kw_pred, k=5)
        sem_rec = compute_recall_at_k(actual, sem_pred, k=5)
        sem_ndcg = compute_ndcg_at_k(actual, sem_pred, k=5)

        keyword_recalls.append(kw_rec)
        keyword_ndcgs.append(kw_ndcg)
        semantic_recalls.append(sem_rec)
        semantic_ndcgs.append(sem_ndcg)

    mean_kw_rec = round(sum(keyword_recalls) / len(keyword_recalls), 4)
    mean_kw_ndcg = round(sum(keyword_ndcgs) / len(keyword_ndcgs), 4)
    mean_sem_rec = round(sum(semantic_recalls) / len(semantic_recalls), 4)
    mean_sem_ndcg = round(sum(semantic_ndcgs) / len(semantic_ndcgs), 4)

    print(f"Total Test Queries: {len(test_cases)}")
    print(f"Keyword Baseline  -> Recall@5: {mean_kw_rec:.4f} | NDCG@5: {mean_kw_ndcg:.4f}")
    print(f"Semantic Matching -> Recall@5: {mean_sem_rec:.4f} | NDCG@5: {mean_sem_ndcg:.4f}")
    print("=" * 65)


def test_triage_eval_benchmark():
    """
    Evaluates Precision and Recall of Triage Risk Flags against user-provided synthetic set.
    Strict non-fabrication rule: If file is missing, skips and notifies user.
    """
    if not os.path.exists(TRIAGE_FILE) or os.path.getsize(TRIAGE_FILE) == 0:
        pytest.skip(
            f"Ground-truth triage labeled dataset ({TRIAGE_FILE}) not yet provided. "
            "Please author synthetic cases using eval/data/triage_schema.json to run this benchmark."
        )

    with open(TRIAGE_FILE, "r", encoding="utf-8") as f:
        cases = json.load(f)

    from ai_service.main import triage_visit_request, TriageRequest, IndustryRules, RequestPayload

    precisions = []
    recalls = []

    print("\n" + "=" * 65)
    print("TRIAGE BENCHMARK: Precision & Recall on Safety Risk Flags")
    print("=" * 65)

    for case in cases:
        req = TriageRequest(
            industry_rules=IndustryRules(**case["industry_rules"]),
            request_payload=RequestPayload(**case["request_payload"])
        )
        res = triage_visit_request(req)
        predicted_flags = [f.category for f in res.risk_flags]
        actual_flags = case.get("expected_flags", [])

        prec, rec = compute_precision_recall_flags(actual_flags, predicted_flags)
        precisions.append(prec)
        recalls.append(rec)

    mean_prec = round(sum(precisions) / len(precisions), 4)
    mean_rec = round(sum(recalls) / len(recalls), 4)

    print(f"Total Triage Test Cases: {len(cases)}")
    print(f"Triage Flag Precision : {mean_prec:.4f}")
    print(f"Triage Flag Recall    : {mean_rec:.4f} (Safety Priority)")
    print("=" * 65)

if __name__ == "__main__":
    import sys
    pytest.main([__file__, "-v", "-s"])
