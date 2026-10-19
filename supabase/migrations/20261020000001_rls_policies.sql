-- ====================================================================
-- VisitLink Phase a1: Row Level Security (RLS) Policies (Deny-by-Default)
-- ====================================================================

-- 1. Enable RLS on All Tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_triage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_request_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper Function to check if current user is industry manager of a given industry
CREATE OR REPLACE FUNCTION public.manages_industry(p_industry_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM industries 
        WHERE id = p_industry_id AND profile_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ====================================================================
-- 2. Profiles Policies
-- ====================================================================
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ====================================================================
-- 3. Institutions Policies
-- ====================================================================
CREATE POLICY "Verified institutions are readable by all authenticated users"
ON institutions FOR SELECT TO authenticated
USING (verification_status = 'verified' OR profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "Coordinators can create an institution"
ON institutions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Coordinators can update their own institution"
ON institutions FOR UPDATE TO authenticated
USING (auth.uid() = profile_id OR public.is_admin())
WITH CHECK (auth.uid() = profile_id OR public.is_admin());

-- ====================================================================
-- 4. Industries Policies
-- ====================================================================
CREATE POLICY "Verified active industries are readable by all authenticated users"
ON industries FOR SELECT TO authenticated
USING ((verification_status = 'verified' AND is_active = true) OR profile_id = auth.uid() OR public.is_admin());

CREATE POLICY "Managers can register an industry"
ON industries FOR INSERT TO authenticated
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Managers can update their own industry"
ON industries FOR UPDATE TO authenticated
USING (auth.uid() = profile_id OR public.is_admin())
WITH CHECK (auth.uid() = profile_id OR public.is_admin());

-- ====================================================================
-- 5. Visit Slots Policies
-- ====================================================================
CREATE POLICY "Active slots of verified industries are viewable by all authenticated users"
ON visit_slots FOR SELECT TO authenticated
USING (
    is_active = true AND 
    EXISTS (
        SELECT 1 FROM industries 
        WHERE industries.id = visit_slots.industry_id 
          AND (industries.verification_status = 'verified' OR industries.profile_id = auth.uid() OR public.is_admin())
    )
);

CREATE POLICY "Industry managers can manage slots for their facility"
ON visit_slots FOR ALL TO authenticated
USING (public.manages_industry(industry_id) OR public.is_admin())
WITH CHECK (public.manages_industry(industry_id) OR public.is_admin());

-- ====================================================================
-- 6. Visit Requests Policies
-- ====================================================================
CREATE POLICY "Visit requests visible only to requester, host manager, or admin"
ON visit_requests FOR SELECT TO authenticated
USING (
    coordinator_id = auth.uid() OR 
    public.manages_industry(industry_id) OR 
    public.is_admin()
);

CREATE POLICY "Coordinators can submit visit requests"
ON visit_requests FOR INSERT TO authenticated
WITH CHECK (coordinator_id = auth.uid());

CREATE POLICY "Coordinators or managers can update their request"
ON visit_requests FOR UPDATE TO authenticated
USING (
    coordinator_id = auth.uid() OR 
    public.manages_industry(industry_id) OR 
    public.is_admin()
)
WITH CHECK (
    coordinator_id = auth.uid() OR 
    public.manages_industry(industry_id) OR 
    public.is_admin()
);

-- ====================================================================
-- 7. AI Triage Logs Policies
-- ====================================================================
CREATE POLICY "Triage logs visible to host manager or admin"
ON ai_triage_logs FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM visit_requests req
        WHERE req.id = ai_triage_logs.visit_request_id
          AND (public.manages_industry(req.industry_id) OR public.is_admin())
    )
);

-- ====================================================================
-- 8. Analytics & History Policies
-- ====================================================================
CREATE POLICY "Analytics visible only to admin"
ON visit_request_analytics FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Audit history visible to involved parties"
ON visit_request_history FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM visit_requests req
        WHERE req.id = visit_request_history.visit_request_id
          AND (req.coordinator_id = auth.uid() OR public.manages_industry(req.industry_id) OR public.is_admin())
    )
);

-- ====================================================================
-- 9. Feedbacks Policies
-- ====================================================================
CREATE POLICY "Feedbacks are viewable by authenticated users"
ON visit_feedbacks FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Involved parties can submit feedback after completion"
ON visit_feedbacks FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() = author_profile_id AND
    EXISTS (
        SELECT 1 FROM visit_requests req
        WHERE req.id = visit_feedbacks.visit_request_id
          AND req.status = 'completed'
          AND (req.coordinator_id = auth.uid() OR public.manages_industry(req.industry_id))
    )
);

-- ====================================================================
-- 10. Notifications Policies
-- ====================================================================
CREATE POLICY "Users can view and update their own notifications"
ON notifications FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- 11. Storage Bucket: compliance-documents (Private)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'compliance-documents', 
    'compliance-documents', 
    false, 
    5242880, -- 5MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET 
    public = false, 
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

CREATE POLICY "Allow authenticated users to upload compliance documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'compliance-documents');

CREATE POLICY "Allow requester or manager to read compliance documents"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'compliance-documents' AND (
        auth.uid()::text = (storage.foldername(name))[1] OR
        public.is_admin()
    )
);
