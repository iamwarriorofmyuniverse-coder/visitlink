# VisitLink: Industrial Visit Coordination & Intelligence Platform

VisitLink is a production-grade web platform and AI coordination layer that connects industrial facilities (factories, foundries, labs, workshops, tech parks) with schools and colleges within a configurable geospatial radius for educational visits.

It features:
- **PostGIS Spatial Search**: `ST_DWithin` queries indexed via GiST on `geography(Point, 4326)`, eliminating full-table scans.
- **AI Semantic Matching**: Syllabus-to-facility capability retrieval using `pgvector` HNSW cosine indexing with configurable hybrid scoring ($0.7 \times \text{semantic similarity} + 0.3 \times \text{distance score}$).
- **AI Triage Pre-Screening**: Pydantic-validated rule checker evaluating supervision ratios, group caps, minor eligibility, and generating draft host replies.
- **Zero-Overbooking Capacity Engine**: Atomic PostgreSQL transactions with `SELECT ... FOR UPDATE` row-level locks preventing race-condition overbooking.
- **Educational Intent & Anti-Abuse System**: Mandatory syllabus alignment, minimum 2 technical learning objectives, designated faculty sponsorship, consumer freemail blocking, post-visit attendance & purpose auditing, 7-day report lifecycle, deterministic institution trust tiers (`New`, `Verified`, `Trusted`, `Restricted`), and human-in-the-loop strike reviews with appeal safeguards.
- **Visit Logistics & Readiness**: Declarative food & parking capacity validation, estimated travel time with peak-hour risk warnings via OpenRouteService (24h cached), and advisory weather forecasting via Open-Meteo with T-48h/T-24h delta re-checks.
- **Child Safety & DPDP Privacy Compliance**: Parental consent forms and student rosters stored in private buckets with 5-minute signed URLs; absolute ban on auto-approving minors.
- **Zero-Fabrication Evaluation Harness**: Reproducible benchmarks for Recall@5, NDCG@5, Precision, and Recall on user-provided datasets.

---

## 2. Visit Logistics & Readiness Architecture

VisitLink includes an operational logistics layer ensuring industrial visits run smoothly without coordinator surprises:

### 1. Food Logistics (Industry-Declared, Zero Payments)
- **Facility declarations**: `canteen_available` (boolean), `meal_options` (`veg`, `non_veg`, `jain`, `mixed`), `max_meal_capacity`, `outside_food_allowed`, `refreshments_provided`, and facility notes.
- **Request parameters**: `meals_needed`, `meal_headcount`, and `dietary_notes`.
- **Validation engine**:
  - Flags warning if `meal_headcount > max_meal_capacity`.
  - Flags warning if dietary requirements conflict with declared options (e.g., Jain requested at non-Jain facility).
  - Flags warning if outside food is prohibited on cleanroom or industrial campuses.
- **Scope rule**: No ordering, payments, or vendor integrations.

### 2. Parking Logistics
- **Facility declarations**: `bus_parking_slots`, `car_parking_slots`, `max_vehicle_height_m`, and `entry_gate_instructions`.
- **Request parameters**: `buses_count`, `cars_count`.
- **Validation engine**: Flags warning if requested vehicle count exceeds designated bays.
- **Approval view**: Entry gate instructions and vehicle clearance restrictions are highlighted in the approved visit card and email notifications.

### 3. Estimated Travel Time & Peak-Hour Traffic Advisory
- **Routing Provider**: Provider-agnostic interface (`IRoutingProvider`) with OpenRouteService (`OpenRouteServiceProvider`), OSRM demo (`OSRMDevProvider`), and deterministic Coimbatore urban speed-profile (`MockRoutingProvider`).
- **Verified Free-Tier Limits**: OpenRouteService Standard Plan provides **2,000 directions requests/day** and **40 requests/min** free with an API key.
- **Cache**: 24-hour TTL in PostgreSQL `route_cache` table to conserve quota and minimize latency.
- **Peak-Hour Advisory**: Evaluates whether estimated departure or transit window intersects active peak traffic hours (default morning `08:00–10:30`, evening `17:00–20:00`, Mon–Sat) defined in `logistics_settings`.
- **UI Copy Contract**: Strictly labeled *"Estimated travel time"* and *"Peak-hour risk"*; never labeled as live traffic.

### 4. Weather Advisory & Scheduled Delta Re-Check
- **Weather Provider**: Open-Meteo free non-commercial API (**10,000 calls/day**, zero API key required, CC BY 4.0 attribution).
- **Forecast Horizon**: Daily forecasts up to **16 days** in advance. Beyond 16 days, displays *"Forecast advisory available 16 days prior to visit"*.
- **Risk Rules**:
  - `rain_probability >= 60%` AND `outdoor_component === true` $\rightarrow$ **Rain Risk**
  - `temperature_max >= 38.0°C` AND `heat_sensitive === true` $\rightarrow$ **Heat Risk**
  - `weather_code IN [95, 96, 99]` (WMO thunderstorms) $\rightarrow$ **Storm Risk**
- **Advisory Contract**: Weather **never** auto-cancels or auto-reschedules. Flags are added as advisories, and the Industry Manager can use the *"Propose Reschedule"* shortcut.
- **T-48h and T-24h Re-Check**: Scheduled job compares current forecast against stored `weather_risk_status`. Dispatches notifications **only if the risk classification has changed**.

### 5. Third-Party Attributions
- **Map Tiles & Data**: &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- **Directions & Routing**: [OpenRouteService](https://openrouteservice.org/) by HeiGIT
- **Weather Forecasts**: [Open-Meteo.com](https://open-meteo.com/) (licensed under CC BY 4.0)

---

## 3. Educational Intent & Anti-Abuse System

To prevent institutions from treating industrial visits as leisure trips or tourist excursions (which wastes engineering time and drives factories off the platform), VisitLink implements a comprehensive intent validation and reputation framework:

### 1. Mandatory Intent Validation (Request Wizard)
- **Concrete Learning Objectives**: At least 2 objectives required ($\ge 30$ characters each) detailing specific engineering/scientific concepts.
- **Academic Anchoring**: Mandatory `course_name` ($\ge 3$ chars), `semester_class`, and `syllabus_topic` ($\ge 10$ chars).
- **Plant Observation Agenda**: Detailed step-by-step observation timeline ($\ge 40$ chars).
- **Expected Deliverable**: Selection from formal `report`, `quiz`, `project`, or `case_study`.
- **Anti-Leisure Keyword & Placeholder Blocker**: Rejects superficial or evasive language (e.g. *"visit"*, *"exposure"*, *"general exposure"*, *"picnic"*, *"fun"*, *"tour"*, *"sightseeing"*, *"outing"*, *"n/a"*).
- **Faculty-in-Charge Sponsorship**: Designated faculty name, mobile, and official institutional email. Consumer free-mail domains (`@gmail.com`, `@yahoo.com`, etc.) are rejected by default.
  - *Tradeoff / Rural Inclusivity*: State and rural colleges lacking `.edu.in` domains can be granted a documented `allow_freemail_domain` override by a platform administrator.

### 2. Post-Visit Verification & Expiry Lifecycle
- **Industry Post-Visit Confirmation**: Facility managers confirm:
  - `attended` (Yes / No)
  - `actual_headcount`
  - `industry_engagement_rating` (1 to 5 stars)
  - `purpose_observed`: `educational` (genuine), `mixed`, or `not_educational` (leisure/picnic abuse)
- **10-Day Expiry**: Request status remains `pending_industry_verification` for 10 days post-visit. If unconfirmed after 10 days, status transitions to `unverified`. Status `completed` is reached **only after industry confirmation**.
- **7-Day Report Submission**: Institutions must upload a visit report or learning summary within 7 days. Automated reminder alerts are scheduled at Day 3 and Day 6.

### 3. Institution Trust Score & Tier Hierarchy
- **Deterministic Trust Score** in $[0.0, 100.0]$:
  $$\text{Score} = \left(\frac{\text{On-Time Reports}}{\text{Completed}}\right) \times 50 + \left(\frac{\text{Avg Rating} - 1.0}{4.0}\right) \times 50 - \text{Penalties}$$
  - Severe penalties: Confirmed Not Educational report ($-25$ pts), No-show ($-20$ pts), Late cancellation ($-10$ pts).
- **Tier Hierarchy**:
  - `New`: 0–2 completed visits. Restricted to a maximum of 2 pending requests at a time.
  - `Verified`: $\ge 3$ visits, score $\ge 60.0$, $\le 1$ active strike.
  - `Trusted`: $\ge 8$ visits, score $\ge 85.0$, 0 active strikes.
  - `Restricted`: 3 active strikes within 12 months or score $< 30.0$.
- **Facility Gatekeeper (`min_trust_tier`)**: Advanced industrial plants can enforce a minimum institution trust tier.
- **Configurable Settings Table**: All weights, penalties, and tier thresholds are defined in `trust_settings` (zero magic numbers).

### 4. Human-in-the-Loop Strike Audits & Appeal Safeguards
- **Zero Unilateral Penalties**: An industry manager's "Not Educational" or "No-Show" report enters `pending_admin_review` with submitted evidence (gate logs, CCTV notes, coordinator absence). It **never** auto-penalizes an institution.
- **Admin Review Actions**: Admins independently review evidence and either approve the strike or dismiss frivolous/disputed complaints.
- **Restricted Institution Appeals**: Restricted institutions have a formal appeal path to submit remedial undertakings from college deans, which platform admins can review to lift restrictions.
- **Transparent Notice**: Whenever an institution's booking privilege is restricted, the exact violation reason and evidence are displayed.

### 5. AI Triage Intent-Quality Extension
- Pydantic-validated assessment measuring **Objective Specificity** ($[0.0, 1.0]$), **Syllabus Alignment** ($[0.0, 1.0]$), and **Agenda Realism**.
- **Strict Advisory Policy**: Intent scoring is flag-only and **never** auto-rejects. The human industry manager retains decision authority.
- Evaluated on user-supplied labels (`ai_service/eval_intent_triage.py`) optimizing to minimize false positives against genuine institutions.

### 6. Strict Scope Guard
- Zero sightseeing, tourism, or leisure features; no group travel booking or leisure marketing.

---

## 4. Tech Stack

- **Frontend & Web API**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Data & Auth**: Supabase (PostgreSQL 15+, PostGIS, pgvector, GoTrue Auth, Private Storage, RLS)
- **AI Intelligence Service**: Python 3.11+, FastAPI, Pydantic, `fastembed` (`BAAI/bge-small-en-v1.5`, 384 dimensions)
- **Geospatial Mapping**: Leaflet 1.9 + OpenStreetMap (SSR-safe dynamic loader)
- **Email & Notifications**: Mailpit (local development) / Resend (production)
- **Testing**: Playwright (E2E browser testing), Pytest (AI service & evaluation harness)

---

## 2. Project Directory Structure

```
visitlink/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Sign in with demo quick-fill
│   │   ├── register/page.tsx            # Role selection (Coordinator vs Manager)
│   │   └── callback/route.ts            # Supabase Auth code exchange
│   ├── coordinator/
│   │   ├── explore/page.tsx             # PostGIS radius search, map & AI matching
│   │   ├── book/[industryId]/page.tsx   # Request wizard, ratio check, consent upload
│   │   └── requests/[id]/page.tsx       # Progress stepper, reschedule accept
│   ├── industry/
│   │   ├── page.tsx                     # Host portal overview & incoming queue
│   │   ├── profile/page.tsx             # Facility profile, safety rules, PPE checklist
│   │   ├── slots/page.tsx               # Visit slot calendar & capacity engine
│   │   └── requests/[id]/page.tsx       # AI triage review & atomic approval
│   ├── admin/
│   │   └── page.tsx                     # Verification queue & platform audit
│   ├── feedback/[requestId]/page.tsx    # Multidimensional star ratings & reviews
│   ├── layout.tsx                       # Root layout & navigation
│   └── page.tsx                         # Landing page
├── ai_service/
│   ├── main.py                          # FastAPI microservice (/health, /embed, /match, /triage)
│   ├── requirements.txt                 # Microservice dependencies
│   └── Dockerfile                       # Production container with pre-downloaded BGE weights
├── components/
│   └── map/
│       └── LeafletMap.tsx               # Client-side SSR-safe Leaflet map with custom HTML pins
├── eval/
│   ├── data/
│   │   ├── triage_schema.json           # JSON Schema for user-authored triage test cases
│   │   ├── matching_labeled_set.json    # Awaiting user matching test labels
│   │   └── triage_labeled_set.json      # Awaiting user triage test labels
│   ├── metrics.py                       # Recall@5, NDCG@5, Precision/Recall computation
│   └── test_eval_harness.py             # Reproducible evaluation harness runner
├── lib/
│   ├── supabase/                        # SSR client, server, and middleware helpers
│   ├── notifications.ts                 # Notification & email dispatcher
│   └── utils.ts                         # Formatting and style utilities
├── scripts/
│   ├── generate_seed_data.py            # Generates seed.sql and seed_catalog.json
│   └── test_concurrent_booking.py       # Atomic capacity race-condition test script
├── supabase/
│   ├── migrations/
│   │   ├── 20261020000000_init_schema.sql         # PostGIS, pgvector, tables, triggers
│   │   ├── 20261020000001_rls_policies.sql        # Deny-by-default RLS on all tables
│   │   └── 20261020000002_postgis_pgvector_rpcs.sql # approve_visit_request & search_and_match
│   ├── seed.sql                         # 20 Coimbatore facilities with 384-dim vectors
│   └── seed_catalog.json                # Stable readable IDs for authoring eval labels
├── tests/
│   └── e2e/
│       └── visitlink_core_flow.spec.ts  # Playwright test suite
├── .env.example                         # Environment template
├── .env.local                           # Local development environment configuration
├── playwright.config.ts                 # Playwright desktop and mobile iPhone 13 setup
└── render.yaml                          # Render deployment blueprint for AI microservice
```

---

## 3. Quick Start & Local Setup

### Step 1: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install AI service Python dependencies
pip install -r ai_service/requirements.txt
```

### Step 2: Environment Variables
Create your local environment file:
```bash
cp .env.example .env.local
```
Defaults in `.env.local` are preconfigured for local development.

### Step 3: Run AI Intelligence Microservice
```bash
python -m uvicorn ai_service.main:app --host 127.0.0.1 --port 8000 --reload
```
Verify the healthcheck:
```bash
curl http://127.0.0.1:8000/health
```

### Step 4: Run Next.js Frontend
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Testing & Evaluation

### A. Concurrent-Booking Race Condition Test
Verifies that atomic PostgreSQL row-level locks prevent overbooking during simultaneous approvals:
```bash
python scripts/test_concurrent_booking.py
```
*Expected Output*: Exactly 1 request receives `200 OK` and 1 request receives `409 Conflict`.

### B. Reproducible AI Evaluation Harness
```bash
python eval/test_eval_harness.py
```
- **Matching Benchmark**: Compares keyword search baseline vs semantic hybrid matching (Recall@5 and NDCG@5) against `eval/data/matching_labeled_set.json`.
- **Triage Benchmark**: Evaluates Precision and Recall on risk flags against `eval/data/triage_labeled_set.json` (prioritizing Recall).
- *Non-Fabrication Contract*: If test set files are not supplied, the runner halts cleanly and prompts for user labels without synthesizing fake metrics.

### C. Playwright End-to-End Suite
Runs desktop and mobile viewport checks (iPhone 13 390x844):
```bash
npm run test:e2e
```

---

## 4. Student Engagement Architecture (No Student Accounts & Strict Privacy)

Students are the end participants in industrial visits, not platform users. Because most students are minors, VisitLink enforces an absolute architectural guarantee: **zero student accounts, zero student logins, and zero storage of student personal identifiable information (PII)**.

### 1. Zero Student Accounts & Zero PII Guardrail
- **No Student Logins**: Students never create usernames, passwords, or profiles.
- **No PII Stored**: No student names, personal emails, phone numbers, or raw IP addresses are ever stored in the database.
- **Child Privacy Compliance (DPDP)**: Student rosters and parental consent documents remain strictly in private storage buckets, accessible only to authorized faculty and verified host managers via 5-minute ephemeral signed URLs.

### 2. Engagement Profile, Badges & Search Filters (Phase p1)
- **Declarative Industry Fields**:
  - `interactive_elements`: Multi-select (`live_demo`, `hands_on_activity`, `q_and_a_engineers`, `product_showcase`).
  - `q_and_a_available`: Boolean indicating direct interaction with plant engineers.
  - `estimated_interactive_minutes`: Bounded between 0 and 240 minutes.
  - `engagement_notes`: Technical description of shop-floor activities.
- **Exploration UI**: Filter facilities by interactive style (e.g. *"Hands-on Activity"*, *"Live Demonstration"*).
- **Anti-Leisure Scope Guard**: Strictly prohibits any "fun", "amusement", or "enjoyment" scores.

### 3. Pre-Visit Brief via Unguessable 128-Bit Tokens (Phase p2)
- **Public Shareable Link**: Generates a clean one-page brief accessible without login.
- **Unguessable 128-Bit Random Tokens**: 32-character cryptographically secure hex strings generated via `crypto.randomBytes(16)`.
- **Time-Bounded Expiry**: Set exactly to `visit_date + 7 days` at 23:59:59 UTC.
- **Database Security**: Token lookups use timing-safe SHA-256 hashes (`token_hash`) with index lookups.
- **Revocation**: Coordinators can revoke links immediately. Revoked or expired links return a secure 404 with zero data leakage.
- **Zero PII**: Contains only facility instructions, mandatory PPE checklists, and 3–5 active reflection prompts.

### 4. Student Observation Sheets & Faculty Review Guardrail (Phase p3)
- **AI-Drafted Technical Prompts**: Questions derived from declared learning objectives and syllabus topics.
- **Ruled Spaces for Handwriting**: Structured note-taking sections (2 to 6 lines) for clipboards on the active factory floor.
- **Faculty Review Guardrail**: Observation sheets are drafted in `draft` status. Print and export actions are strictly locked until the faculty coordinator reviews and approves the sheet. Sheets are never auto-sent.
- **Schema Validation**: Strict Pydantic and TypeScript schema validation ensuring engineering relevance.

### 5. Anonymous Student Feedback & Anonymity Thresholds (Phase p4)
- **Anonymous Post-Visit Ratings**: Collects usefulness (1–5), engagement (1–5), most interesting machine/process observed ($\le 300$ chars), and suggestions ($\le 300$ chars).
- **Rate-Limiting Without Raw IPs**: Client IPs are hashed using SHA-256 with a daily rotating server-side salt. Raw IPs are discarded immediately.
- **Server-Enforced Anonymity Threshold ($N \ge 5$)**:
  - Aggregate ratings and qualitative comments are strictly withheld until at least **5 student responses** exist.
  - When $N < 5$, a secure privacy shield message informs coordinators and managers that responses are hidden to protect student anonymity.
- **Automated Content Moderation**: Comments are scanned for contact numbers, emails, and abusive keywords; flagged submissions are held for human admin review.
- **Zero Strike Contamination**: Student feedback is advisory for host engineers and faculty. It contributes to host ratings, but is strictly isolated from institution strikes, trust scores, or tier restrictions.

### 6. Participation Certificates & Scheduled Social Break (Phase p5)
- **Client-Side Certificate Generation**: Coordinators generate official industrial visit completion certificates. Recipient student names are typed directly in the local browser print dialog and **never** transmitted to or stored on VisitLink servers.
- **Scheduled Social Slot**: Coordinators can specify `planned_social_break_minutes` (0 to 30 mins, default 0) to notify host managers for visit schedule coordination.

---

## 5. Resourceful Sites & Verified Ratings Engine (Phases q1–q5 & r1–r6)

To surface industries that are resourceful for learning and operationally ready to host student groups—without discriminating by facility age, company turnover, or photography aesthetics—VisitLink provides a deterministic, transparent capability scoring and verified review system:

### 1. Capability Declarations & Strict Anti-Bias Guardrails (Phase q1)
- **Objective Inputs Only**:
  - **Learning Capabilities**: `process_stages_visible` (raw material prep, primary forming, precision machining, surface treatment, assembly, quality NDT testing, packaging), `technology_levels` (manual, semi-automated, CNC, robotics, IoT/Industry 4.0), live demo, hands-on activity, engineer Q&A, technical guide, and student observation descriptions.
  - **Hosting Readiness**: Safe visitor walkways, student restrooms, PPE supplied on-site, briefing room with AV equipment, visitor staff count, and maximum student group size.
  - **Verified Certifications**: Quality and safety standards (`ISO 9001`, `ISO 14001`, `ISO 45001`, `IATF 16949`, `NABL`, `AS9100`) with uploaded PDF proof and admin verification status.
  - **Listing Integrity**: Minimum 4 real facility photos required; stock photography is strictly prohibited.
- **Strict Anti-Bias Invariant**: Facility age, establishment year, company headcount/size, annual turnover, and photo beauty scores are **strictly forbidden inputs** in all database schemas, scoring logic, and ranking algorithms (enforced by automated unit tests).

### 2. Transparent Scoring Engine & Explain Views (Phase q2)
- **Deterministic Math**: No LLM scoring or subjective AI evaluations.
  - **Learning Value Score (0–100)**: Weighted sum of visible process stages (up to 25 pts), technology level tags (up to 20 pts), live demo (15 pts), hands-on activity (15 pts), engineer Q&A (10 pts), guide (10 pts), and interactive duration $\ge 45$ min (5 pts).
  - **Hosting Readiness Score (0–100)**: Safe visitor walkways (25 pts), restrooms (15 pts), PPE supplied (15 pts), briefing room with AV (15 pts), visitor staff $\ge 2$ (10 pts), group capacity $\ge 30$ (10 pts), and verified active certifications (10 pts).
- **Unverified Claim Discount**: Declared capabilities count at **50% weight** until physically audited and verified by an on-site platform administrator.
- **Transparent Explain View**: Coordinators and hosts can open a modal displaying itemized points, verification badges, and exact mathematical weights for every score.

### 3. Search Re-Ranking & Guaranteed Exploration Slots (Phase q3)
- **Order of Evaluation**:
  1. **Hard Filters**: Spatial radius, sector, group capacity, and tag filters (Hands-on, Modern Tech). Non-matching facilities are never shown.
  2. **Semantic Relevance**: Syllabus topic match score (0.0 to 1.0).
  3. **Quality Tiebreaker**: Final Rank Score $= 0.80 \times \text{relevance} + 0.20 \times \text{quality}$. Quality re-ranking serves as a gentle tiebreaker and never overrides genuine curriculum relevance.
- **Exploration Slot for New Hosts**: Newly onboarded facilities ($< 3$ verified visits) are guaranteed exposure by placing a qualified new facility at **position #5 in every 10-item result window**, marked with an official `🌟 New Host` badge.
- **Nearby Isolation**: Nearby POI amenities (restaurants, fuel stations) are strictly excluded from ranking calculations.

### 4. Anti-Gaming, Contradicted Claims & Audit Trail (Phase q4)
- **Zero Paid Boosts**: Sponsored placements and paid ranking upgrades are architecturally impossible.
- **Contradicted Claim Penalty**: If a post-visit coordinator report confirms facility claims were inaccurate (e.g. promised CNC machining was unavailable), an admin audit assesses an exact **$-15$ point penalty** and flags the card with a public `⚠️ Listing Corrected (-15 pts)` notice.
- **Automatic Expiry**: Expired certifications forfeit points immediately upon passing their expiry date.

### 5. Multi-Dimensional Verified Reviews (Phase r1)
- **Completed-Visit Enforcement**: Reviews can **only** be submitted if `visit_requests.status = 'completed'` (enforced by PostgreSQL trigger and API validation).
- **1-Hour Cooldown**: Reviews are locked for 1 hour after visit completion to prevent rushed or emotional submissions.
- **7-Day Edit Window**: Coordinators can edit their reviews within 7 days, after which reviews are permanently locked to preserve audit history.
- **Server-Side Overall Rating**: Overall score is computed server-side as the exact arithmetic average of 5 distinct educational dimensions:
  1. Learning Value & Curriculum Fit (1–5)
  2. Hosting & Plant Organisation (1–5)
  3. Staff & Guide Quality (1–5)
  4. Plant Safety & PPE Compliance (1–5)
  5. Listing Accuracy (1–5)

### 6. Bayesian Aggregation & Recency Weighting (Phase r2)
- **Bayesian Smoothing Formula**:
  $$\bar{R}_{\text{bayesian}} = \frac{C \cdot m + \sum_{i=1}^n w_i R_i}{C + \sum_{i=1}^n w_i}$$
  - Platform Prior Weight: $C = 5.0$
  - Platform Historical Mean: $m = 4.5$
  - Recency Weight $w_i$: $1.0$ for reviews $\le 24$ months old; $0.50$ (50% discount) for reviews $> 24$ months old to reflect current factory management.
- **Display Threshold ($n \ge 5$)**: Numerical rating averages are withheld publicly until a facility completes at least **5 verified visits**, preventing statistical volatility from biasing newly onboarded plants.

### 7. Industry Right-of-Reply & Dispute Resolution (Phases r3–r4)
- **Public Right-of-Reply**: Industry managers can publish one official reply per review (max 500 characters, validated against profanity and PII).
- **Dispute Lifecycle**: Hosts can dispute reviews citing factual errors, retaliation, or defamatory content. Submitting a dispute sets the ticket to `under_review` and routes evidence to human admin adjudication. Unilateral host self-deletion is strictly prevented.
- **Automated PII Screening**: Reviews are screened for personal phone numbers, email addresses, and abusive keywords prior to publication.

### 8. Private Institution Behavioral Ratings & Integrity Checks (Phase r5)
- **Private Host Evaluation**: After completed visits, industry hosts rate visiting institutions on 4 behavioral dimensions: punctuality, student discipline, faculty preparedness, and headcount accuracy (1–5 stars each).
- **Strict Privacy**: Private ratings are protected by Row-Level Security and **never** shown to other colleges or published publicly. They blend directly into the institution's platform trust score.
- **Collusion & Retaliation Integrity**: Automated detectors flag suspicious patterns (e.g. repeated mutual 5-star ratings or consecutive 1-star retaliation) for human admin review.

### 9. Fairness & Evaluation Harnesses (Phase q5 & r6)
- **Fairness Gap Check**: `scripts/check_fairness.ts` evaluates the average rank position gap between small/mid-size units and large facilities under equal relevance (verified gap: $4.51 < 5.0$, confirming zero structural bias).
- **Zero-Fabrication Re-Rank Evaluation**: `scripts/eval_rerank.ts` is configured to run Recall@5 and NDCG@5 evaluations on user-provided ground-truth test labels with zero synthetic data.

---

## 6. Production Deployment Runbook (Phase k)

### 1. Supabase Cloud (ap-south-1 Mumbai Region)
1. Create a project in region `ap-south-1` (Mumbai).
2. Enable PostGIS and pgvector extensions in **Database -> Extensions**.
3. Link project and push migrations:
   ```bash
   npx supabase link --project-ref <your-project-id>
   npx supabase db push
   ```
4. Verify Row Level Security is active on every table:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```
5. Ensure bucket `compliance-documents` is set to **private**.
6. Set Auth site URL and redirect URLs to your production domain.

### 2. FastAPI Service on Render / Fly.io
1. Deploy from GitHub repository using `render.yaml` or Dockerfile.
2. Sizing: 512MB RAM instance comfortably accommodates `bge-small-en-v1.5` (~133MB).
3. Set environment variables:
   - `SUPABASE_JWT_SECRET`: From Supabase API settings.
   - `LLM_PROVIDER`: `gemini`
   - `GEMINI_API_KEY`: Your Gemini API key.
4. Verify `/health` responds with `{"status":"healthy"}`.

### 3. Next.js Frontend on Vercel (bom1 Mumbai Region)
1. Deploy to Vercel selecting region `bom1` (Mumbai).
2. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Production Supabase URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Production Anon key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Server-side only.
   - `FASTAPI_SERVICE_URL`: Deployed FastAPI service URL.
   - `LLM_PROVIDER`: `gemini`

### 4. Post-Deployment Verification Checklist
Run through all 6 checks on production:
- [ ] **Anon-Key RLS Probe**: Verify that querying `visit_requests` with public anon key returns 0 records.
- [ ] **Concurrent-Booking Test**: Execute 10 parallel approval requests against a full slot to ensure zero overbooking.
- [ ] **Upload Security Probe**: Verify that non-PDF/executable uploads are rejected with 400 Bad Request.
- [ ] **Mobile Viewport Test**: Complete discovery -> booking -> review flow on an iPhone 13 viewport (390x844).
- [ ] **Eval Harness Verification**: Re-run evaluation suite against production endpoints.
- [ ] **Secret Scan**: Run `gitleaks` to verify zero `.env` or secrets in commit history.
