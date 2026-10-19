-- ====================================================================
-- VisitLink Phase a1: Core Database Schema (PostGIS + pgvector + Tables)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('coordinator', 'industry_manager', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_state AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM (
        'pending', 
        'approved', 
        'rejected', 
        'reschedule_proposed', 
        'completed', 
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE triage_verdict AS ENUM ('pass', 'flagged', 'fail');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'coordinator',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Institutions (Schools / Colleges)
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    readable_id TEXT UNIQUE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    institution_type TEXT NOT NULL CHECK (institution_type IN ('school', 'college', 'university', 'polytechnic')),
    affiliation_number TEXT,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Coimbatore',
    state TEXT NOT NULL DEFAULT 'Tamil Nadu',
    pincode TEXT NOT NULL,
    verification_status verification_state DEFAULT 'pending',
    verification_doc_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_institutions_location ON institutions USING GIST (location);

-- 5. Industries (Host Facilities)
CREATE TABLE IF NOT EXISTS industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    readable_id TEXT UNIQUE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    description TEXT NOT NULL,
    highlights TEXT,
    curriculum_topics TEXT,
    embedding VECTOR(384),
    min_education_level TEXT NOT NULL DEFAULT 'middle_school',
    min_age INT DEFAULT 12,
    min_group_size INT DEFAULT 10,
    max_group_size INT DEFAULT 60,
    student_to_teacher_ratio INT DEFAULT 15,
    safety_rules JSONB DEFAULT '{"helmet": true, "safety_shoes": true, "no_loose_clothing": true}'::jsonb,
    ppe_requirements TEXT[] DEFAULT ARRAY['Closed-toe shoes', 'Safety vest'],
    minors_allowed BOOLEAN DEFAULT TRUE,
    dress_code TEXT DEFAULT 'Full sleeves and long trousers. No loose jewelry or scarves.',
    location GEOGRAPHY(Point, 4326) NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Coimbatore',
    state TEXT NOT NULL DEFAULT 'Tamil Nadu',
    pincode TEXT NOT NULL,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    verification_status verification_state DEFAULT 'pending',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_industries_location ON industries USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_industries_sector ON industries (sector);
CREATE INDEX IF NOT EXISTS idx_industries_status ON industries (verification_status, is_active);
CREATE INDEX IF NOT EXISTS idx_industries_embedding ON industries USING hnsw (embedding vector_cosine_ops);

-- 6. Visit Slots
CREATE TABLE IF NOT EXISTS visit_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
    specific_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    is_recurring BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_slot_time CHECK (end_time > start_time)
);
CREATE INDEX IF NOT EXISTS idx_visit_slots_industry ON visit_slots (industry_id, is_active);

-- 7. Visit Requests
CREATE TABLE IF NOT EXISTS visit_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES visit_slots(id),
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    coordinator_id UUID NOT NULL REFERENCES profiles(id),
    requested_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    student_count INT NOT NULL CHECK (student_count > 0),
    teacher_count INT NOT NULL CHECK (teacher_count > 0),
    education_level TEXT NOT NULL,
    department_or_grade TEXT NOT NULL,
    course_or_subject TEXT NOT NULL,
    visit_objectives TEXT NOT NULL,
    request_embedding VECTOR(384),
    has_minors BOOLEAN NOT NULL DEFAULT FALSE,
    special_requests TEXT,
    status request_status DEFAULT 'pending',
    proposed_reschedule_slot_id UUID REFERENCES visit_slots(id),
    proposed_reschedule_date DATE,
    indemnity_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    safety_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    roster_file_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_visit_requests_industry ON visit_requests (industry_id, status);
CREATE INDEX IF NOT EXISTS idx_visit_requests_institution ON visit_requests (institution_id, status);
CREATE INDEX IF NOT EXISTS idx_visit_requests_slot_date ON visit_requests (slot_id, requested_date, status);

-- 8. AI Triage Logs
CREATE TABLE IF NOT EXISTS ai_triage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_request_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    latency_ms INT NOT NULL,
    prompt_tokens INT,
    completion_tokens INT,
    input_payload JSONB NOT NULL,
    output_payload JSONB NOT NULL,
    has_minors_flag BOOLEAN NOT NULL DEFAULT FALSE,
    overall_verdict triage_verdict NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_triage_logs_request ON ai_triage_logs (visit_request_id);

-- 9. Visit Request Analytics (Event Logging)
CREATE TABLE IF NOT EXISTS visit_request_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_request_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
    student_count INT NOT NULL,
    teacher_count INT NOT NULL,
    student_teacher_ratio NUMERIC(5,2) NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL,
    lead_time_days INT NOT NULL,
    sector TEXT NOT NULL,
    education_level TEXT NOT NULL,
    has_minors BOOLEAN NOT NULL,
    triage_risk_flag_count INT DEFAULT 0,
    semantic_similarity_score NUMERIC(4,3),
    final_outcome TEXT DEFAULT 'pending',
    turnaround_time_hours INT,
    post_visit_rating INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_analytics_outcome ON visit_request_analytics (final_outcome);

-- 10. Visit Request History (Audit Trail)
CREATE TABLE IF NOT EXISTS visit_request_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_request_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
    previous_status request_status,
    new_status request_status NOT NULL,
    changed_by UUID NOT NULL REFERENCES profiles(id),
    reason_or_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Feedbacks & Ratings
CREATE TABLE IF NOT EXISTS visit_feedbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_request_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
    author_profile_id UUID NOT NULL REFERENCES profiles(id),
    target_entity_type TEXT NOT NULL CHECK (target_entity_type IN ('industry', 'institution')),
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
    safety_compliance_rating INT CHECK (safety_compliance_rating BETWEEN 1 AND 5),
    educational_value_rating INT CHECK (educational_value_rating BETWEEN 1 AND 5),
    review TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT one_feedback_per_side UNIQUE (visit_request_id, author_profile_id)
);

-- 12. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    notification_type TEXT DEFAULT 'status_update',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Automatic Profile Creation on Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, phone)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'VisitLink User'),
        new.email,
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'coordinator'::user_role),
        new.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
