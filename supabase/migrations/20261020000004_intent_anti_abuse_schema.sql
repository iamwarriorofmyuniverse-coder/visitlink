-- ====================================================================
-- VisitLink Phase m: Educational Intent & Anti-Abuse Schema Migration
-- ====================================================================

-- 1. Extend Industries Table (Minimum Trust Tier Requirement)
ALTER TABLE industries
    ADD COLUMN IF NOT EXISTS min_trust_tier TEXT DEFAULT 'new'
    CHECK (min_trust_tier IN ('new', 'verified', 'trusted'));

-- 2. Extend Institutions Table (Trust Score, Tiers, Domain Verification)
ALTER TABLE institutions
    ADD COLUMN IF NOT EXISTS trust_tier TEXT DEFAULT 'new'
    CHECK (trust_tier IN ('new', 'verified', 'trusted', 'restricted')),
    ADD COLUMN IF NOT EXISTS trust_score NUMERIC(5,2) DEFAULT 50.00
    CHECK (trust_score >= 0.00 AND trust_score <= 100.00),
    ADD COLUMN IF NOT EXISTS active_strikes_count INT DEFAULT 0
    CHECK (active_strikes_count >= 0),
    ADD COLUMN IF NOT EXISTS restriction_reason TEXT,
    ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS allow_freemail_domain BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS freemail_override_reason TEXT;

-- 3. Extend Visit Requests Table (Intent fields + Post-Visit Verification)
ALTER TABLE visit_requests
    ADD COLUMN IF NOT EXISTS learning_objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS syllabus_topic TEXT,
    ADD COLUMN IF NOT EXISTS semester_class TEXT,
    ADD COLUMN IF NOT EXISTS faculty_name TEXT,
    ADD COLUMN IF NOT EXISTS faculty_email TEXT,
    ADD COLUMN IF NOT EXISTS faculty_phone TEXT,
    ADD COLUMN IF NOT EXISTS faculty_email_verified BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS faculty_verification_token TEXT,
    ADD COLUMN IF NOT EXISTS faculty_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS pre_visit_agenda TEXT,
    ADD COLUMN IF NOT EXISTS expected_deliverable TEXT DEFAULT 'report'
    CHECK (expected_deliverable IN ('report', 'quiz', 'project', 'case_study')),
    ADD COLUMN IF NOT EXISTS intent_score NUMERIC(3,2),
    ADD COLUMN IF NOT EXISTS intent_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS post_visit_confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS post_visit_attendance BOOLEAN,
    ADD COLUMN IF NOT EXISTS actual_headcount INT CHECK (actual_headcount IS NULL OR actual_headcount >= 0),
    ADD COLUMN IF NOT EXISTS industry_engagement_rating INT CHECK (industry_engagement_rating IS NULL OR (industry_engagement_rating BETWEEN 1 AND 5)),
    ADD COLUMN IF NOT EXISTS purpose_observed TEXT
    CHECK (purpose_observed IS NULL OR purpose_observed IN ('educational', 'mixed', 'not_educational')),
    ADD COLUMN IF NOT EXISTS industry_post_visit_notes TEXT,
    ADD COLUMN IF NOT EXISTS report_uploaded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS report_file_path TEXT,
    ADD COLUMN IF NOT EXISTS report_reminder_sent_count INT DEFAULT 0;

-- 4. Strike & Abuse Audit Table
CREATE TABLE IF NOT EXISTS institution_strikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    visit_request_id UUID REFERENCES visit_requests(id) ON DELETE SET NULL,
    strike_type TEXT NOT NULL CHECK (strike_type IN ('not_educational', 'no_show', 'fraudulent_intent')),
    reported_by UUID NOT NULL REFERENCES profiles(id),
    evidence_notes TEXT NOT NULL,
    status TEXT DEFAULT 'pending_admin_review'
    CHECK (status IN ('pending_admin_review', 'approved', 'rejected', 'appealed', 'appeal_granted', 'appeal_rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    admin_review_notes TEXT,
    appeal_reason TEXT,
    appealed_at TIMESTAMPTZ,
    appeal_reviewed_by UUID REFERENCES profiles(id),
    appeal_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Anti-Abuse & Trust Settings Table (Configurable, Zero Magic Numbers)
CREATE TABLE IF NOT EXISTS anti_abuse_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    config_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Default anti-abuse configuration seed
INSERT INTO anti_abuse_settings (key, description, config_value) VALUES
('strike_policy', 'Thresholds for institution strikes, expiration windows, and tier transitions', '{
    "strikes_for_restriction": 3,
    "strike_validity_months": 12,
    "new_institution_max_pending_requests": 2,
    "post_visit_report_deadline_days": 7,
    "report_reminder_days": [3, 6],
    "industry_confirmation_deadline_days": 10
}'::jsonb),
('trust_scoring_weights', 'Weights and formula parameters for institution trust score computation', '{
    "min_completed_visits_for_score": 3,
    "default_new_institution_score": 50.0,
    "weights": {
        "report_submission_rate": 0.30,
        "engagement_rating_avg": 0.30,
        "not_educational_penalty": 0.20,
        "no_show_penalty": 0.15,
        "cancellation_penalty": 0.05
    },
    "tier_thresholds": {
        "trusted_min_score": 85.0,
        "trusted_min_visits": 8,
        "trusted_max_strikes": 0,
        "verified_min_score": 60.0,
        "verified_min_visits": 3,
        "verified_max_strikes": 1,
        "restricted_min_strikes": 3,
        "restricted_max_score": 30.0
    }
}'::jsonb),
('freemail_domain_blacklist', 'Common consumer email providers rejected for official institutional faculty sign-off', '{
    "domains": ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "rediffmail.com", "zoho.com", "yandex.com"]
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 6. Row-Level Security (Deny by default)
ALTER TABLE institution_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE anti_abuse_settings ENABLE ROW LEVEL SECURITY;

-- Strikes RLS
CREATE POLICY "Admins full access to strikes"
ON institution_strikes FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Institutions view own approved or appealed strikes"
ON institution_strikes FOR SELECT TO authenticated
USING (
    institution_id IN (SELECT id FROM institutions WHERE profile_id = auth.uid())
    AND status IN ('approved', 'appealed', 'appeal_rejected', 'appeal_granted')
);

CREATE POLICY "Institutions can file appeal on approved strikes"
ON institution_strikes FOR UPDATE TO authenticated
USING (
    institution_id IN (SELECT id FROM institutions WHERE profile_id = auth.uid())
    AND status = 'approved'
)
WITH CHECK (
    status = 'appealed' AND appeal_reason IS NOT NULL
);

-- Settings RLS
CREATE POLICY "Authenticated users view anti_abuse_settings"
ON anti_abuse_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins modify anti_abuse_settings"
ON anti_abuse_settings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
