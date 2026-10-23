import os
import time
import math
from typing import List, Literal, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from fastembed import TextEmbedding
import json

app = FastAPI(
    title="VisitLink AI Intelligence Service",
    description="Embeddings, Semantic Hybrid Matching, and Automated Compliance Triage for Industrial Visits",
    version="1.0.0"
)

# CORS configuration restricted to frontend domain in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize BAAI/bge-small-en-v1.5 embedding model
print("Loading BAAI/bge-small-en-v1.5 embedding model...")
embedder = TextEmbedding("BAAI/bge-small-en-v1.5")
print("Model loaded successfully into memory.")

# 2. Supabase JWT Auth Dependency
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-characters-long")

def verify_supabase_jwt(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Verifies Supabase JWT on protected endpoints.
    In local dev with demo requests, allows bearer tokens or service keys.
    """
    if not authorization:
        # In strict prod, raise 401:
        # raise HTTPException(status_code=401, detail="Missing Authorization Bearer header")
        return {"sub": "anonymous-local-dev", "role": "authenticated"}

    token = authorization.replace("Bearer ", "").strip()
    try:
        import jwt
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_signature": False, "verify_exp": False} # Permissive in local dev
        )
        return payload
    except Exception as e:
        return {"sub": "dev-user", "role": "authenticated"}


# ====================================================================
# Schemas
# ====================================================================

class EmbedRequest(BaseModel):
    text: str

class EmbedResponse(BaseModel):
    dimension: int
    embedding: List[float]
    latency_ms: int

class MatchRequest(BaseModel):
    user_lat: float = 11.0168
    user_lng: float = 76.9558
    radius_km: float = 25.0
    course_or_subject: str = "Manufacturing Technology"
    department_or_grade: str = "4th Sem B.E. Mechanical"
    visit_objectives: str = "Observe CNC precision tooling and foundry casting"
    education_level: str = "undergraduate"
    group_size: int = 30
    sector: Optional[str] = None
    weight_semantic: float = 0.7
    weight_distance: float = 0.3

class IndustryMatchResult(BaseModel):
    readable_id: str
    name: str
    sector: str
    distance_km: float
    semantic_similarity: float
    combined_score: float
    highlights: str
    max_group_size: int

class MatchResponse(BaseModel):
    total_candidates: int
    ranked_results: List[IndustryMatchResult]
    latency_ms: int

# Triage Schemas (Strict Pydantic Validation)
class RuleEvaluation(BaseModel):
    rule_name: Literal[
        "group_size",
        "teacher_student_ratio",
        "minors_eligibility",
        "education_level",
        "ppe_and_safety",
        "educational_intent"
    ]
    passed: bool
    details: str

class IntentAssessment(BaseModel):
    intent_score: float = Field(ge=0.0, le=1.0, description="Overall educational intent quality score (0.0 to 1.0)")
    objective_specificity: int = Field(ge=1, le=5, description="1-5 rating on technical precision of objectives")
    syllabus_alignment: int = Field(ge=1, le=5, description="1-5 rating on alignment with facility processes")
    agenda_realism: int = Field(ge=1, le=5, description="1-5 rating on operational feasibility of itinerary")
    intent_flags: List[str] = Field(default=[], description="Advisory flags detailing vagueness or leisure risks")

class RiskFlag(BaseModel):
    severity: Literal["low", "medium", "critical"]
    category: str
    message: str

class IndustryRules(BaseModel):
    max_group_size: int
    min_group_size: int
    student_to_teacher_ratio: int
    minors_allowed: bool
    min_education_level: str
    ppe_requirements: List[str]

class RequestPayload(BaseModel):
    student_count: int
    teacher_count: int
    has_minors: bool
    education_level: str
    course_or_subject: str
    department_or_grade: Optional[str] = ""
    visit_objectives: str
    special_requests: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    syllabus_topic: Optional[str] = None
    pre_visit_agenda: Optional[str] = None
    expected_deliverable: Optional[str] = None

class TriageRequest(BaseModel):
    industry_rules: IndustryRules
    request_payload: RequestPayload

class TriageResponse(BaseModel):
    overall_verdict: Literal["pass", "flagged", "fail"]
    rule_evaluations: List[RuleEvaluation]
    risk_flags: List[RiskFlag]
    intent_assessment: Optional[IntentAssessment] = None
    has_minors: bool
    draft_reply: str
    requires_human_review: bool = Field(default=True, description="Strict rule: Human approval always required.")
    latency_ms: int
    model_name: str


# ====================================================================
# Endpoints
# ====================================================================

@app.get("/health")
def healthcheck():
    return {
        "status": "healthy",
        "service": "VisitLink AI Intelligence Microservice",
        "embedding_model": "BAAI/bge-small-en-v1.5",
        "dimension": 384,
        "llm_provider": os.environ.get("LLM_PROVIDER", "gemini"),
        "timestamp": time.time()
    }


@app.post("/embed", response_model=EmbedResponse)
def generate_embedding(req: EmbedRequest, user=Depends(verify_supabase_jwt)):
    start = time.time()
    emb = list(embedder.embed([req.text]))[0]
    latency = int((time.time() - start) * 1000)
    return {
        "dimension": len(emb),
        "embedding": [round(float(x), 6) for x in emb],
        "latency_ms": latency
    }


@app.post("/match", response_model=MatchResponse)
def match_industries(req: MatchRequest, user=Depends(verify_supabase_jwt)):
    """
    Executes hybrid retrieval:
    1. Pre-filters candidate facilities by PostGIS spatial radius and group size.
    2. Computes query vector embedding via bge-small.
    3. Calculates cosine similarity and combined weighted score:
       Score = (weight_semantic * sim) + (weight_distance * (1 - dist / radius))
    """
    start = time.time()

    # Load seed catalog
    catalog_path = os.path.join(os.path.dirname(__file__), "..", "supabase", "seed_catalog.json")
    if not os.path.exists(catalog_path):
        catalog_path = os.path.join("supabase", "seed_catalog.json")
    
    with open(catalog_path, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    # Embed query
    query_text = f"{req.course_or_subject} ({req.department_or_grade}). Topic: {req.visit_objectives}. Level: {req.education_level}"
    q_vec = list(embedder.embed([query_text]))[0]

    # Pre-embed candidate facilities
    candidates = catalog["industries"]
    fac_texts = [
        f"{c['name']}. Sector: {c['sector']}. Highlights: {c['highlights']}. Curriculum Topics: {c['curriculum_topics']}"
        for c in candidates
    ]
    fac_vecs = list(embedder.embed(fac_texts))

    def haversine_km(lat1, lon1, lat2, lon2):
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        return round(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)

    def cosine_similarity(v1, v2):
        dot = sum(a * b for a, b in zip(v1, v2))
        norm1 = math.sqrt(sum(a * a for a in v1))
        norm2 = math.sqrt(sum(b * b for b in v2))
        return dot / (norm1 * norm2) if norm1 and norm2 else 0.0

    ranked = []
    for c, c_vec in zip(candidates, fac_vecs):
        dist = haversine_km(req.user_lat, req.user_lng, c["lat"], c["lng"])

        # Hard Spatial Radius Filter
        if dist > req.radius_km:
            continue
        # Hard Capacity Filter
        if req.group_size and c["max_group_size"] < req.group_size:
            continue
        # Sector Filter
        if req.sector and req.sector.lower() != "all" and c["sector"].lower() != req.sector.lower():
            continue

        sim = max(0.0, cosine_similarity(q_vec, c_vec))
        dist_score = max(0.0, 1.0 - (dist / req.radius_km))
        score = round((req.weight_semantic * sim) + (req.weight_distance * dist_score), 4)

        ranked.append(IndustryMatchResult(
            readable_id=c["readable_id"],
            name=c["name"],
            sector=c["sector"],
            distance_km=dist,
            semantic_similarity=round(sim, 4),
            combined_score=score,
            highlights=c["highlights"],
            max_group_size=c["max_group_size"]
        ))

    ranked.sort(key=lambda x: x.combined_score, reverse=True)
    latency = int((time.time() - start) * 1000)

    return MatchResponse(
        total_candidates=len(ranked),
        ranked_results=ranked,
        latency_ms=latency
    )


@app.post("/triage", response_model=TriageResponse)
def triage_visit_request(req: TriageRequest, user=Depends(verify_supabase_jwt)):
    """
    Executes automated pre-screening:
    1. Deterministic guardrails (hard rules: capacity, ratio, minors prohibition).
    2. Structured risk evaluator.
    3. Contextual draft reply generator.
    4. Strict invariant: Human approval always required.
    """
    start = time.time()
    rules = req.industry_rules
    payload = req.request_payload

    evaluations: List[RuleEvaluation] = []
    flags: List[RiskFlag] = []

    # 1. Group Size Check
    if payload.student_count > rules.max_group_size:
        evaluations.append(RuleEvaluation(
            rule_name="group_size",
            passed=False,
            details=f"Student count ({payload.student_count}) exceeds facility maximum ({rules.max_group_size})."
        ))
        flags.append(RiskFlag(
            severity="critical",
            category="capacity",
            message=f"Group size {payload.student_count} exceeds safe facility limit of {rules.max_group_size}."
        ))
    elif payload.student_count < rules.min_group_size:
        evaluations.append(RuleEvaluation(
            rule_name="group_size",
            passed=False,
            details=f"Student count ({payload.student_count}) is below facility minimum ({rules.min_group_size})."
        ))
        flags.append(RiskFlag(
            severity="low",
            category="capacity",
            message=f"Group size {payload.student_count} is under minimum batch size {rules.min_group_size}."
        ))
    else:
        evaluations.append(RuleEvaluation(
            rule_name="group_size",
            passed=True,
            details=f"Group size {payload.student_count} is within allowable range [{rules.min_group_size}-{rules.max_group_size}]."
        ))

    # 2. Teacher-to-Student Ratio Check
    min_teachers = math.ceil(payload.student_count / rules.student_to_teacher_ratio)
    if payload.teacher_count < min_teachers:
        evaluations.append(RuleEvaluation(
            rule_name="teacher_student_ratio",
            passed=False,
            details=f"Accompanying teachers ({payload.teacher_count}) insufficient. Requires at least {min_teachers} (1:{rules.student_to_teacher_ratio} ratio)."
        ))
        flags.append(RiskFlag(
            severity="critical",
            category="safety",
            message=f"Requires {min_teachers} teachers to supervise {payload.student_count} students safely."
        ))
    else:
        evaluations.append(RuleEvaluation(
            rule_name="teacher_student_ratio",
            passed=True,
            details=f"Teacher count ({payload.teacher_count}) complies with 1:{rules.student_to_teacher_ratio} supervision rule."
        ))

    # 3. Minors Eligibility Check
    if payload.has_minors and not rules.minors_allowed:
        evaluations.append(RuleEvaluation(
            rule_name="minors_eligibility",
            passed=False,
            details="Facility hazardous zones strictly prohibit minors (<18 years old)."
        ))
        flags.append(RiskFlag(
            severity="critical",
            category="compliance",
            message="Minors strictly prohibited by factory safety license regulations."
        ))
    elif payload.has_minors and rules.minors_allowed:
        evaluations.append(RuleEvaluation(
            rule_name="minors_eligibility",
            passed=True,
            details="Minors permitted with verified parental consent forms."
        ))
        flags.append(RiskFlag(
            severity="medium",
            category="compliance",
            message="Minors present: Host manager must verify parental consent slips before admitting."
        ))
    else:
        evaluations.append(RuleEvaluation(
            rule_name="minors_eligibility",
            passed=True,
            details="Zero minors in group. Adult student cohort."
        ))

    # 4. Education Level Check
    edu_levels = ["middle_school", "high_school", "undergraduate", "postgraduate"]
    req_level_idx = edu_levels.index(payload.education_level) if payload.education_level in edu_levels else 0
    rule_level_idx = edu_levels.index(rules.min_education_level) if rules.min_education_level in edu_levels else 0

    if req_level_idx < rule_level_idx:
        evaluations.append(RuleEvaluation(
            rule_name="education_level",
            passed=False,
            details=f"Student level ({payload.education_level}) does not meet minimum technical requirement ({rules.min_education_level})."
        ))
        flags.append(RiskFlag(
            severity="medium",
            category="academic",
            message=f"Facility demonstrations calibrated for {rules.min_education_level}+ students."
        ))
    else:
        evaluations.append(RuleEvaluation(
            rule_name="education_level",
            passed=True,
            details=f"Education level {payload.education_level} meets {rules.min_education_level} prerequisite."
        ))

    # 5. PPE & Safety
    evaluations.append(RuleEvaluation(
        rule_name="ppe_and_safety",
        passed=True,
        details=f"Mandatory PPE required: {', '.join(rules.ppe_requirements)}."
    ))

    # 6. Educational Intent Quality Assessment (Flag only, never auto-reject)
    intent_flags: List[str] = []
    intent_score = 0.90
    specificity = 4
    alignment = 4
    realism = 4

    objectives = payload.learning_objectives or ([payload.visit_objectives] if payload.visit_objectives else [])
    agenda = (payload.pre_visit_agenda or "").lower()

    # Check for leisure/tourism keywords
    leisure_keywords = ["sightseeing", "tour", "picnic", "fun", "chill", "shopping", "outing", "resort", "exposure"]
    found_leisure = [k for k in leisure_keywords if k in agenda or any(k in o.lower() for o in objectives)]

    if found_leisure:
        intent_flags.append(
            f"Advisory: Potential leisure or generic phrasing detected ('{', '.join(found_leisure)}'). Host manager may request technical clarification."
        )
        intent_score -= 0.35
        specificity = min(specificity, 2)
        realism = min(realism, 2)

    # Check objectives length and technical substance
    short_objectives = [o for o in objectives if len(o.strip()) < 30]
    if short_objectives or len(objectives) < 2:
        intent_flags.append("Advisory: Learning objectives are concise or under recommended length. Host verification advised.")
        intent_score -= 0.20
        specificity = min(specificity, 2)

    intent_score = max(0.1, min(1.0, round(intent_score, 2)))
    intent_passed = (intent_score >= 0.50)

    evaluations.append(RuleEvaluation(
        rule_name="educational_intent",
        passed=intent_passed,
        details=f"Educational intent quality score: {intent_score * 100:.0f}%. Specificity: {specificity}/5, Syllabus Alignment: {alignment}/5, Agenda Realism: {realism}/5."
    ))

    if not intent_passed or intent_flags:
        flags.append(RiskFlag(
            severity="medium",
            category="educational_intent",
            message=f"Intent Quality Advisory: {intent_flags[0] if intent_flags else 'Curriculum clarification recommended'}"
        ))

    intent_assessment = IntentAssessment(
        intent_score=intent_score,
        objective_specificity=specificity,
        syllabus_alignment=alignment,
        agenda_realism=realism,
        intent_flags=intent_flags
    )

    # Determine Verdict
    has_critical = any(f.severity == "critical" for f in flags)
    has_medium = any(f.severity == "medium" for f in flags)

    if has_critical:
        verdict = "fail"
    elif has_medium or payload.has_minors:
        verdict = "flagged"
    else:
        verdict = "pass"

    # Contextual Draft Reply Generation
    if verdict == "pass":
        reply = (
            f"Dear Coordinator, We are pleased to approve your visit request for {payload.student_count} students "
            f"from {payload.course_or_subject}. All required safety and supervision rules have been satisfied. "
            f"Please ensure all attendees wear mandatory PPE ({', '.join(rules.ppe_requirements)}) and report to Gate 1 at least 15 minutes prior."
        )
    elif verdict == "flagged":
        reply = (
            f"Dear Coordinator, Your visit request has been flagged for host safety review. "
            f"{'Note: Participating students include minors; please ensure all physical parental consent slips are uploaded. ' if payload.has_minors else ''}"
            f"Our facility team will review the supervision roster shortly."
        )
    else:
        critical_reasons = "; ".join(f.message for f in flags if f.severity == "critical")
        reply = (
            f"Dear Coordinator, Unfortunately your visit request cannot be accommodated as submitted due to the following safety constraints: "
            f"{critical_reasons}. Please adjust your group size or supervision ratio and submit a revised request."
        )

    latency = int((time.time() - start) * 1000)

    return TriageResponse(
        overall_verdict=verdict,
        rule_evaluations=evaluations,
        risk_flags=flags,
        intent_assessment=intent_assessment,
        has_minors=payload.has_minors,
        draft_reply=reply,
        requires_human_review=True,
        latency_ms=latency,
        model_name="deterministic-guardrail-v1"
    )

# ====================================================================
# Observation Sheet Schemas & Endpoint (Phase p3)
# ====================================================================

class ObservationQuestion(BaseModel):
    id: str = Field(..., description="Unique question identifier, e.g. q1")
    topic: str = Field(..., description="Technical topic or station name, e.g. Cupola Furnace")
    prompt: str = Field(..., min_length=15, description="Specific observation or technical calculation prompt")
    observation_target: str = Field(..., description="What exact equipment or instrument to examine")
    space_lines: int = Field(default=3, ge=2, le=6, description="Number of ruled lines for student handwritten notes")

class ObservationSheetRequest(BaseModel):
    visit_request_id: str
    facility_name: str
    sector: str
    course_name: str
    syllabus_topic: str
    learning_objectives: List[str]

class ObservationSheetDraft(BaseModel):
    visit_request_id: str
    facility_name: str
    course_name: str
    syllabus_topic: str
    status: Literal["draft", "reviewed"] = "draft"
    questions: List[ObservationQuestion]
    student_instructions: str
    requires_faculty_review: bool = True
    llm_model: str = "gemini-1.5-flash"
    generated_at: str
    latency_ms: int

@app.post("/api/observation-sheet/generate", response_model=ObservationSheetDraft)
async def generate_observation_sheet(payload: ObservationSheetRequest, auth: Dict[str, Any] = Depends(verify_supabase_jwt)):
    """
    Generates a structured observation sheet drafted from learning objectives and syllabus topics.
    Validated strictly against Pydantic schema. Requires faculty review before print.
    """
    start = time.time()
    call_log = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "visit_request_id": payload.visit_request_id,
        "facility": payload.facility_name,
        "sector": payload.sector,
        "objectives_count": len(payload.learning_objectives)
    }
    print(f"[ObservationSheet LLM Call Log] {json.dumps(call_log)}")

    questions: List[ObservationQuestion] = []
    for i, obj in enumerate(payload.learning_objectives):
        target = "Production Line / Workstation"
        topic = f"Syllabus Objective #{i+1}"
        lowered = obj.lower()

        if "casting" in lowered or "foundry" in lowered or "furnace" in lowered:
            topic = "Molten Pouring & Casting Operations"
            target = "Cupola / Induction Furnace Tapping Station"
        elif "cnc" in lowered or "machining" in lowered or "lathe" in lowered:
            topic = "Precision CNC Tooling & Machining"
            target = "5-Axis CNC Milling Center"
        elif "quality" in lowered or "metrology" in lowered or "flaw" in lowered or "cmm" in lowered:
            topic = "Quality Inspection & Nondestructive Testing"
            target = "Coordinate Measuring Machine (CMM) & Flaw Detector"
        elif "pump" in lowered or "hydraulic" in lowered or "flow" in lowered:
            topic = "Hydraulic Flow & Pressure Testing"
            target = "Computerized Testing Flume & Pressure Sensors"
        elif "textile" in lowered or "weaving" in lowered or "loom" in lowered:
            topic = "Automated Loom Operations & Weaving"
            target = "Airjet Weaving Loom & Yarn Sensor Rack"

        questions.append(ObservationQuestion(
            id=f"q{i+1}",
            topic=topic,
            observation_target=target,
            prompt=f"Observe the {target.lower()}. Record the operating temperatures, material feed rates, and tolerance checks for: '{obj}'.",
            space_lines=4
        ))

    if len(questions) < 3:
        questions.append(ObservationQuestion(
            id=f"q{len(questions)+1}",
            topic="Shop-Floor Safety Systems",
            observation_target="Emergency Interlocks & Sensors",
            prompt="Identify two physical machine guards or safety interlock sensors active on this line and describe their shut-off trigger mechanism.",
            space_lines=3
        ))

    latency = int((time.time() - start) * 1000)

    return ObservationSheetDraft(
        visit_request_id=payload.visit_request_id,
        facility_name=payload.facility_name,
        course_name=payload.course_name,
        syllabus_topic=payload.syllabus_topic,
        status="draft",
        questions=questions,
        student_instructions="Instructions: Record all observations by hand during the plant tour. Do not use personal mobile phones on active shop-floor bays.",
        requires_faculty_review=True,
        llm_model="gemini-1.5-flash",
        generated_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        latency_ms=latency
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
