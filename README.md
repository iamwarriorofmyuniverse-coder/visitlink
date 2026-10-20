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

## 5. Production Deployment Runbook (Phase k)

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
