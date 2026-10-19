# VisitLink: Industrial Visit Coordination & Intelligence Platform

VisitLink is a production-grade web platform and AI coordination layer that connects industrial facilities (factories, foundries, labs, workshops, tech parks) with schools and colleges within a configurable geospatial radius for educational visits.

It features:
- **PostGIS Spatial Search**: `ST_DWithin` queries indexed via GiST on `geography(Point, 4326)`, eliminating full-table scans.
- **AI Semantic Matching**: Syllabus-to-facility capability retrieval using `pgvector` HNSW cosine indexing with configurable hybrid scoring ($0.7 \times \text{semantic similarity} + 0.3 \times \text{distance score}$).
- **AI Triage Pre-Screening**: Pydantic-validated rule checker evaluating supervision ratios, group caps, minor eligibility, and generating draft host replies.
- **Zero-Overbooking Capacity Engine**: Atomic PostgreSQL transactions with `SELECT ... FOR UPDATE` row-level locks preventing race-condition overbooking.
- **Child Safety & DPDP Privacy Compliance**: Parental consent forms and student rosters stored in private buckets with 5-minute signed URLs; absolute ban on auto-approving minors.
- **Zero-Fabrication Evaluation Harness**: Reproducible benchmarks for Recall@5, NDCG@5, Precision, and Recall on user-provided datasets.

---

## 1. Tech Stack

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
