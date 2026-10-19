import math
from typing import List, Tuple

def compute_recall_at_k(actual: List[str], predicted: List[str], k: int = 5) -> float:
    """
    Computes Recall@K: proportion of relevant items found in top K predictions.
    """
    if not actual:
        return 0.0
    top_k_pred = set(predicted[:k])
    relevant_retrieved = sum(1 for item in actual if item in top_k_pred)
    return round(relevant_retrieved / len(actual), 4)

def compute_ndcg_at_k(actual: List[str], predicted: List[str], k: int = 5) -> float:
    """
    Computes Normalized Discounted Cumulative Gain at K (NDCG@K) with binary relevance.
    """
    if not actual:
        return 0.0
    
    top_k_pred = predicted[:k]
    dcg = 0.0
    for idx, item in enumerate(top_k_pred):
        if item in actual:
            # Discount formula: 1 / log2(rank + 1), where rank is 1-indexed (idx + 1)
            dcg += 1.0 / math.log2((idx + 1) + 1)
            
    # Ideal DCG (all relevant items ranked at top)
    idcg = sum(1.0 / math.log2(i + 2) for i in range(min(len(actual), k)))
    if idcg == 0.0:
        return 0.0
    return round(dcg / idcg, 4)

def compute_precision_recall_flags(actual_flags: List[str], predicted_flags: List[str]) -> Tuple[float, float]:
    """
    Computes Precision and Recall for safety risk flags.
    Prioritizes Recall (penalizing false negatives where a safety hazard is missed).
    """
    act_set = set(actual_flags)
    pred_set = set(predicted_flags)

    if not act_set and not pred_set:
        return 1.0, 1.0
    if not pred_set and act_set:
        return 0.0, 0.0
    if pred_set and not act_set:
        return 0.0, 1.0

    true_positives = len(act_set.intersection(pred_set))
    precision = round(true_positives / len(pred_set), 4)
    recall = round(true_positives / len(act_set), 4)
    return precision, recall
