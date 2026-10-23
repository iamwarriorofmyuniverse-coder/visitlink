-- Migration: 20261020000005_student_engagement_schema.sql
-- Description: Student Engagement (No Student Accounts)
-- Features: Industry engagement profile, unguessable tokenised pre-visit briefs,
-- observation sheets, and anonymous post-visit feedback with 5+ response threshold.

-- 1. Extend Industry Profiles with Engagement Metadata
ALTER TABLE industry_profiles
  ADD COLUMN IF NOT EXISTS interactive_elements TEXT[] DEFAULT '{}'
    CHECK (interactive_elements <@ ARRAY['live_demo', 'hands_on_activity', 'q_and_a_engineers', 'product_showcase']::TEXT[]),
  ADD COLUMN IF NOT EXISTS q_and_a_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS estimated_interactive_minutes INTEGER DEFAULT 0
    CHECK (estimated_interactive_minutes BETWEEN 0 AND 240),
  ADD COLUMN IF NOT EXISTS engagement_notes TEXT DEFAULT '';

-- 2. Extend Visit Requests with Optional Scheduled Social Break (Informational)
ALTER TABLE visit_requests
  ADD COLUMN IF NOT EXISTS planned_social_break_minutes INTEGER DEFAULT 0
    CHECK (planned_social_break_minutes BETWEEN 0 AND 30);

-- 3. Tokenised Access Links (Unguessable, Expiring, Revocable)
CREATE TABLE IF NOT EXISTS visit_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_request_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
  token_type TEXT NOT NULL CHECK (token_type IN ('brief', 'student_feedback')),
  token_hash TEXT NOT NULL UNIQUE,       -- SHA-256 of raw 128-bit secret
  token_preview TEXT NOT NULL,           -- First 6 chars for coordinator identification
  expires_at TIMESTAMPTZ NOT NULL,       -- visit_date + 7 days
  revoked_at TIMESTAMPTZ,                -- Coordinator manual revocation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visit_tokens_lookup ON visit_access_tokens(token_hash) WHERE revoked_at IS NULL;

-- 4. Student Observation Sheets (Drafted by LLM, Edited & Approved by Faculty)
CREATE TABLE IF NOT EXISTS student_observation_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_request_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'reviewed', 'printed')),
  questions_json JSONB NOT NULL,
  faculty_edits_json JSONB,
  llm_model TEXT DEFAULT 'gemini-1.5-flash',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Anonymous Student Feedback Responses (NO PII, NO Raw IPs, Server-Enforced Anonymity)
CREATE TABLE IF NOT EXISTS student_feedback_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_request_id UUID NOT NULL REFERENCES visit_requests(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,                 -- SHA-256(IP + daily_salt), zero raw IP stored
  usefulness_rating INTEGER NOT NULL CHECK (usefulness_rating BETWEEN 1 AND 5),
  engagement_rating INTEGER NOT NULL CHECK (engagement_rating BETWEEN 1 AND 5),
  most_interesting TEXT CHECK (length(most_interesting) <= 300),
  suggestion TEXT CHECK (length(suggestion) <= 300),
  moderation_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (moderation_status IN ('approved', 'flagged', 'rejected')),
  moderation_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_feedback_visit ON student_feedback_responses(visit_request_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_feedback_rate_limit ON student_feedback_responses(visit_request_id, ip_hash);

-- 6. Deny-by-Default Row Level Security (RLS)
ALTER TABLE visit_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_observation_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_feedback_responses ENABLE ROW LEVEL SECURITY;

-- Tokens RLS: Coordinators & Host Managers of the visit can view/revoke
CREATE POLICY "Coordinators and Hosts view visit tokens"
  ON visit_access_tokens FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visit_requests vr
      WHERE vr.id = visit_access_tokens.visit_request_id
      AND (vr.institution_id IN (SELECT id FROM institution_profiles WHERE user_id = auth.uid())
        OR vr.industry_id IN (SELECT id FROM industry_profiles WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Coordinators manage visit tokens"
  ON visit_access_tokens FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visit_requests vr
      JOIN institution_profiles ip ON ip.id = vr.institution_id
      WHERE vr.id = visit_access_tokens.visit_request_id AND ip.user_id = auth.uid()
    )
  );

-- Observation Sheets RLS: Coordinator & Industry can view; Coordinator edits
CREATE POLICY "View observation sheets"
  ON student_observation_sheets FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visit_requests vr
      WHERE vr.id = student_observation_sheets.visit_request_id
      AND (vr.institution_id IN (SELECT id FROM institution_profiles WHERE user_id = auth.uid())
        OR vr.industry_id IN (SELECT id FROM industry_profiles WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Coordinators edit observation sheets"
  ON student_observation_sheets FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM visit_requests vr
      JOIN institution_profiles ip ON ip.id = vr.institution_id
      WHERE vr.id = student_observation_sheets.visit_request_id AND ip.user_id = auth.uid()
    )
  );

-- Anonymous Feedback Responses RLS:
-- Direct SELECT denied by default; aggregates exposed via secure RPC ONLY when count >= 5
CREATE POLICY "Deny direct public select of individual student feedback"
  ON student_feedback_responses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
