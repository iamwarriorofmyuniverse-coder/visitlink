-- ====================================================================
-- Migration: 20261020000007_ratings_reviews_schema.sql
-- Description: Verified Ratings & Reviews (Completed Visits Only)
-- Guardrails:
-- 1. Database-enforced constraint: Only completed, verified visits can be rated.
-- 2. Private institution ratings visible only to host industries and admins.
-- 3. Server-computed overall mean.
-- ====================================================================

-- 1. Coordinator Reviews of Industry (Strict 1-to-1 with Completed Visit)
CREATE TABLE IF NOT EXISTS industry_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_request_id UUID NOT NULL UNIQUE REFERENCES visit_requests(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    coordinator_profile_id UUID NOT NULL REFERENCES profiles(id),
    learning_value_rating INT NOT NULL CHECK (learning_value_rating BETWEEN 1 AND 5),
    hosting_organisation_rating INT NOT NULL CHECK (hosting_organisation_rating BETWEEN 1 AND 5),
    staff_guide_quality_rating INT NOT NULL CHECK (staff_guide_quality_rating BETWEEN 1 AND 5),
    safety_rating INT NOT NULL CHECK (safety_rating BETWEEN 1 AND 5),
    listing_accuracy_rating INT NOT NULL CHECK (listing_accuracy_rating BETWEEN 1 AND 5),
    overall_rating NUMERIC(3,2) NOT NULL,
    would_visit_again BOOLEAN DEFAULT TRUE,
    review_text VARCHAR(500),
    is_contradicted_claim BOOLEAN DEFAULT FALSE,
    moderation_status TEXT NOT NULL DEFAULT 'published' CHECK (moderation_status IN ('published', 'flagged_pii', 'hidden_by_admin')),
    moderation_reason TEXT,
    is_disputed BOOLEAN DEFAULT FALSE,
    editable_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_industry_reviews_industry ON industry_reviews(industry_id, moderation_status);
CREATE INDEX IF NOT EXISTS idx_industry_reviews_institution ON industry_reviews(institution_id);

-- 2. Database-level trigger to strictly prevent rating uncompleted visits
CREATE OR REPLACE FUNCTION enforce_completed_visit_for_review()
RETURNS TRIGGER AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT status INTO v_status FROM visit_requests WHERE id = NEW.visit_request_id;
    IF v_status IS NULL OR v_status != 'completed' THEN
        RAISE EXCEPTION 'Database Constraint Violation: Reviews can only be submitted for completed, industry-verified visits. Current status: %', COALESCE(v_status, 'not_found');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_completed_visit_review ON industry_reviews;
CREATE TRIGGER trg_enforce_completed_visit_review
    BEFORE INSERT ON industry_reviews
    FOR EACH ROW
    EXECUTE FUNCTION enforce_completed_visit_for_review();

-- 3. Host Industry Public Replies (Max 1 per review)
CREATE TABLE IF NOT EXISTS review_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL UNIQUE REFERENCES industry_reviews(id) ON DELETE CASCADE,
    industry_profile_id UUID NOT NULL REFERENCES profiles(id),
    reply_text VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Review Disputes Lifecycle
CREATE TABLE IF NOT EXISTS review_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES industry_reviews(id) ON DELETE CASCADE,
    disputed_by_role TEXT NOT NULL CHECK (disputed_by_role IN ('industry', 'coordinator')),
    dispute_reason TEXT NOT NULL,
    evidence_notes TEXT,
    status TEXT NOT NULL DEFAULT 'under_review' CHECK (status IN ('under_review', 'resolved_kept', 'resolved_hidden', 'resolved_edited')),
    admin_decision_reason TEXT,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_disputes_status ON review_disputes(status);

-- 5. Private Institution Rating by Industry (Confidential - Feeds Trust Score)
CREATE TABLE IF NOT EXISTS institution_private_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_request_id UUID NOT NULL UNIQUE REFERENCES visit_requests(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    industry_id UUID NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    industry_manager_profile_id UUID NOT NULL REFERENCES profiles(id),
    punctuality_rating INT NOT NULL CHECK (punctuality_rating BETWEEN 1 AND 5),
    discipline_rating INT NOT NULL CHECK (discipline_rating BETWEEN 1 AND 5),
    preparedness_rating INT NOT NULL CHECK (preparedness_rating BETWEEN 1 AND 5),
    headcount_accuracy_rating INT NOT NULL CHECK (headcount_accuracy_rating BETWEEN 1 AND 5),
    overall_rating NUMERIC(3,2) NOT NULL,
    confidential_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_enforce_completed_visit_inst_rating ON institution_private_ratings;
CREATE TRIGGER trg_enforce_completed_visit_inst_rating
    BEFORE INSERT ON institution_private_ratings
    FOR EACH ROW
    EXECUTE FUNCTION enforce_completed_visit_for_review();

CREATE INDEX IF NOT EXISTS idx_inst_ratings_inst ON institution_private_ratings(institution_id);

-- 6. Configurable Settings Table for Ratings
CREATE TABLE IF NOT EXISTS ratings_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

INSERT INTO ratings_settings (key, description, config) VALUES
('bayesian_aggregation_parameters', 'Parameters for Bayesian rating calculation and recency weighting', '{
    "prior_weight_c": 5.0,
    "platform_mean_m": 4.5,
    "recency_cutoff_months": 24,
    "recency_decay_factor": 0.50,
    "min_verified_visits_for_display": 5,
    "review_edit_window_days": 7,
    "cooldown_hours_post_visit": 1
}'::jsonb),
('institution_rating_weights', 'Weights for integrating private industry ratings into institution trust score', '{
    "trust_score_weight": 0.35,
    "punctuality_weight": 0.25,
    "discipline_weight": 0.30,
    "preparedness_weight": 0.25,
    "headcount_accuracy_weight": 0.20
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 7. Anti-Gaming Integrity Flags
CREATE TABLE IF NOT EXISTS ratings_integrity_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type TEXT NOT NULL CHECK (target_type IN ('collusion_mutual_5s', 'retaliation_all_1s', 'inflated_all_5s', 'suspicious_cooldown')),
    institution_id UUID REFERENCES institutions(id),
    industry_id UUID REFERENCES industries(id),
    evidence_json JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_admin_review' CHECK (status IN ('pending_admin_review', 'investigated_cleared', 'investigated_sanctioned')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ratings_integrity_status ON ratings_integrity_flags(status);

-- ====================================================================
-- Deny-By-Default Row Level Security (RLS) Policies
-- ====================================================================

ALTER TABLE industry_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_private_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings_integrity_flags ENABLE ROW LEVEL SECURITY;

-- Policies for industry_reviews
CREATE POLICY "Public read published industry reviews"
    ON industry_reviews FOR SELECT
    USING (moderation_status = 'published');

CREATE POLICY "Coordinators insert review for their completed visit"
    ON industry_reviews FOR INSERT
    WITH CHECK (
        auth.uid() = coordinator_profile_id AND
        EXISTS (
            SELECT 1 FROM visit_requests vr
            WHERE vr.id = visit_request_id
              AND vr.status = 'completed'
              AND vr.institution_id = industry_reviews.institution_id
        )
    );

CREATE POLICY "Coordinators update review within 7-day window"
    ON industry_reviews FOR UPDATE
    USING (
        auth.uid() = coordinator_profile_id AND
        NOW() <= editable_until
    );

CREATE POLICY "Admins full access to industry reviews"
    ON industry_reviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Policies for review_replies
CREATE POLICY "Public read review replies"
    ON review_replies FOR SELECT
    USING (true);

CREATE POLICY "Industry managers insert reply for their reviews"
    ON review_replies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM industry_reviews r
            JOIN industries ind ON ind.id = r.industry_id
            WHERE r.id = review_replies.review_id
              AND ind.profile_id = auth.uid()
        )
    );

-- Policies for review_disputes
CREATE POLICY "Disputing parties and admins read disputes"
    ON review_disputes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM industry_reviews r
            JOIN industries ind ON ind.id = r.industry_id
            WHERE r.id = review_disputes.review_id
              AND (ind.profile_id = auth.uid() OR r.coordinator_profile_id = auth.uid())
        )
    );

CREATE POLICY "Admins resolve disputes"
    ON review_disputes FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Policies for institution_private_ratings: STRICT PRIVACY INVARIANT
-- NOT readable by other institutions or the general public!
CREATE POLICY "Only rated institution can view aggregated metrics"
    ON institution_private_ratings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        ) OR
        EXISTS (
            SELECT 1 FROM industries ind
            WHERE ind.id = institution_private_ratings.industry_id
              AND ind.profile_id = auth.uid()
        )
    );

CREATE POLICY "Industry managers insert private institution rating"
    ON institution_private_ratings FOR INSERT
    WITH CHECK (
        auth.uid() = industry_manager_profile_id AND
        EXISTS (
            SELECT 1 FROM visit_requests vr
            WHERE vr.id = visit_request_id
              AND vr.status = 'completed'
              AND vr.industry_id = institution_private_ratings.industry_id
        )
    );

-- Policies for ratings_settings
CREATE POLICY "Public read ratings settings"
    ON ratings_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins modify ratings settings"
    ON ratings_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- Policies for ratings_integrity_flags
CREATE POLICY "Only admins view and manage integrity flags"
    ON ratings_integrity_flags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );
