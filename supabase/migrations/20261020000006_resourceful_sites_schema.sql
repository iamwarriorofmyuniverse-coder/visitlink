-- ====================================================================
-- Migration: 20261020000006_resourceful_sites_schema.sql
-- Description: Resourceful Sites (Learning Value and Hosting Readiness)
-- Guardrails: No bias by facility age, company size, or photo aesthetics.
-- ====================================================================

-- 1. Extend Industries Table with Capability and Score Fields
ALTER TABLE industries
    ADD COLUMN IF NOT EXISTS process_stages_visible TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS technology_levels TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS live_demo_available BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS hands_on_available BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS engineer_qa_available BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS guide_available BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS briefing_room BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS av_equipment BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS safe_visitor_walkway BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS restrooms_available BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ppe_supplied BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS visitor_staff_count INT DEFAULT 1 CHECK (visitor_staff_count >= 0),
    ADD COLUMN IF NOT EXISTS student_observation_description TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS learning_value_score NUMERIC(5,2) DEFAULT 0.0 CHECK (learning_value_score BETWEEN 0.0 AND 100.0),
    ADD COLUMN IF NOT EXISTS hosting_readiness_score NUMERIC(5,2) DEFAULT 0.0 CHECK (hosting_readiness_score BETWEEN 0.0 AND 100.0),
    ADD COLUMN IF NOT EXISTS listing_corrected_flag BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS listing_corrected_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_industries_learning_score ON industries(learning_value_score);
CREATE INDEX IF NOT EXISTS idx_industries_hosting_score ON industries(hosting_readiness_score);

-- 2. Industry Certifications Table
CREATE TABLE IF NOT EXISTS industry_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    cert_type TEXT NOT NULL CHECK (cert_type IN ('ISO 9001', 'ISO 14001', 'ISO 45001', 'IATF 16949', 'NABL', 'AS9100', 'Other')),
    custom_cert_name TEXT,
    cert_file_path TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    admin_verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (admin_verification_status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_industry_certs_industry ON industry_certifications(industry_id);
CREATE INDEX IF NOT EXISTS idx_industry_certs_status ON industry_certifications(admin_verification_status, expiry_date);

-- 3. Configurable Settings Table (No Magic Numbers)
CREATE TABLE IF NOT EXISTS site_scoring_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Seed Default Scoring & Matching Weights
INSERT INTO site_scoring_settings (key, description, config) VALUES
('learning_value_weights', 'Weights for calculating Learning Value score (0-100)', '{
    "max_stages_points": 25.0,
    "points_per_stage": 6.25,
    "max_technology_points": 20.0,
    "technology_points": {
        "manual": 5.0,
        "semi_automated": 10.0,
        "cnc": 15.0,
        "robotics": 20.0,
        "iot_industry_4_0": 20.0,
        "other": 5.0
    },
    "live_demo_points": 15.0,
    "hands_on_points": 15.0,
    "engineer_qa_points": 10.0,
    "guide_available_points": 10.0,
    "interactive_time_min_minutes": 45,
    "interactive_time_points": 5.0,
    "unverified_claim_discount": 0.50,
    "contradicted_claim_penalty": 15.0
}'::jsonb),
('hosting_readiness_weights', 'Weights for calculating Hosting Readiness score (0-100)', '{
    "safe_visitor_walkway_points": 25.0,
    "restrooms_points": 15.0,
    "ppe_supplied_points": 15.0,
    "briefing_room_av_points": 15.0,
    "briefing_room_only_points": 8.0,
    "min_visitor_staff_count": 2,
    "visitor_staff_points": 10.0,
    "min_group_size_threshold": 30,
    "group_capacity_points": 10.0,
    "verified_certification_points": 10.0,
    "unverified_claim_discount": 0.50
}'::jsonb),
('search_rerank_weights', 'Weights for quality tiebreaker and exploration slot in matching', '{
    "relevance_weight": 0.80,
    "quality_weight": 0.20,
    "quality_components": {
        "learning_score_weight": 0.40,
        "hosting_score_weight": 0.30,
        "experience_rating_weight": 0.30
    },
    "new_industry_visit_threshold": 3,
    "exploration_slot_interval": 10,
    "exploration_slot_position": 5
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Score Change Audit Log Table
CREATE TABLE IF NOT EXISTS site_score_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    previous_learning_score NUMERIC(5,2),
    new_learning_score NUMERIC(5,2),
    previous_hosting_score NUMERIC(5,2),
    new_hosting_score NUMERIC(5,2),
    trigger_reason TEXT NOT NULL CHECK (trigger_reason IN (
        'capability_update',
        'admin_verification',
        'contradicted_claim_penalty',
        'cert_expiry',
        'admin_override'
    )),
    changed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_score_audit_industry ON site_score_audit_log(industry_id, created_at DESC);

-- ====================================================================
-- Deny-By-Default Row Level Security (RLS) Policies
-- ====================================================================

ALTER TABLE industry_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_scoring_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_score_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for industry_certifications
-- 1. Public can view active verified certificates
CREATE POLICY "Public read verified certifications"
    ON industry_certifications FOR SELECT
    USING (admin_verification_status = 'verified');

-- 2. Industry managers can view their own certifications (including pending/rejected)
CREATE POLICY "Industry managers view own certifications"
    ON industry_certifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM industries ind
            WHERE ind.id = industry_certifications.industry_id
              AND ind.profile_id = auth.uid()
        )
    );

-- 3. Industry managers can insert certifications for their own facility
CREATE POLICY "Industry managers insert own certifications"
    ON industry_certifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM industries ind
            WHERE ind.id = industry_certifications.industry_id
              AND ind.profile_id = auth.uid()
        )
    );

-- 4. Platform admins have full access to all certifications
CREATE POLICY "Admins full access to certifications"
    ON industry_certifications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Policies for site_scoring_settings
-- 1. Everyone can read scoring configuration
CREATE POLICY "Public read site scoring settings"
    ON site_scoring_settings FOR SELECT
    USING (true);

-- 2. Only platform admins can modify scoring weights
CREATE POLICY "Admins update site scoring settings"
    ON site_scoring_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Policies for site_score_audit_log
-- 1. Industry managers can read audit history for their own facility
CREATE POLICY "Industry managers read own score audit log"
    ON site_score_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM industries ind
            WHERE ind.id = site_score_audit_log.industry_id
              AND ind.profile_id = auth.uid()
        )
    );

-- 2. Admins can view full audit log across all facilities
CREATE POLICY "Admins read all score audit log"
    ON site_score_audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );
