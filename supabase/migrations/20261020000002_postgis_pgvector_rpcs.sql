-- ====================================================================
-- VisitLink Phase a3: PostGIS Spatial & pgvector Hybrid Search & Concurrency RPCs
-- ====================================================================

-- 1. Atomic Approval with Row Lock (Race-Condition Safe Capacity Engine)
CREATE OR REPLACE FUNCTION approve_visit_request(
    p_request_id UUID,
    p_manager_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_req RECORD;
    v_slot RECORD;
    v_industry RECORD;
    v_current_booked INT;
    v_new_total INT;
    v_turnaround INT;
BEGIN
    -- A. Locate request
    SELECT * INTO v_req FROM visit_requests WHERE id = p_request_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_req.status != 'pending' AND v_req.status != 'reschedule_proposed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Only pending or rescheduled requests can be approved');
    END IF;

    -- B. Verify Manager Ownership
    SELECT * INTO v_industry FROM industries WHERE id = v_req.industry_id;
    IF v_industry.profile_id != p_manager_id THEN
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_manager_id AND role = 'admin') THEN
            RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: You do not manage this facility');
        END IF;
    END IF;

    -- C. Concurrency Guard: Lock the specific slot row to serialize concurrent approvals
    SELECT * INTO v_slot FROM visit_slots WHERE id = v_req.slot_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Slot not found');
    END IF;

    -- D. Calculate total students approved for this date and slot
    SELECT COALESCE(SUM(student_count), 0) INTO v_current_booked
    FROM visit_requests
    WHERE slot_id = v_req.slot_id
      AND requested_date = v_req.requested_date
      AND status = 'approved'
      AND id != p_request_id;

    v_new_total := v_current_booked + v_req.student_count;

    -- E. Reject if capacity is exceeded
    IF v_new_total > v_slot.max_capacity THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', format('Capacity exceeded. Slot maximum is %s, currently approved is %s, requested is %s', 
                            v_slot.max_capacity, v_current_booked, v_req.student_count)
        );
    END IF;

    -- F. Update Request Status
    UPDATE visit_requests
    SET status = 'approved',
        updated_at = NOW()
    WHERE id = p_request_id;

    -- G. Audit Trail
    INSERT INTO visit_request_history (visit_request_id, previous_status, new_status, changed_by, reason_or_notes)
    VALUES (p_request_id, v_req.status, 'approved', p_manager_id, p_notes);

    -- H. Record Analytics Event
    v_turnaround := EXTRACT(EPOCH FROM (NOW() - v_req.created_at)) / 3600;
    UPDATE visit_request_analytics
    SET final_outcome = 'approved',
        turnaround_time_hours = v_turnaround,
        resolved_at = NOW()
    WHERE visit_request_id = p_request_id;

    -- I. Create In-app Notification for Coordinator
    INSERT INTO notifications (user_id, title, message, link_url, notification_type)
    VALUES (
        v_req.coordinator_id,
        'Visit Request Approved!',
        format('Your visit request to %s for %s has been approved.', v_industry.name, v_req.requested_date),
        format('/coordinator/requests/%s', p_request_id),
        'request_approved'
    );

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Request approved successfully', 
        'remaining_capacity', (v_slot.max_capacity - v_new_total)
    );
END;
$$;

-- 2. Hybrid Search: PostGIS Spatial Radius + pgvector Cosine Similarity
CREATE OR REPLACE FUNCTION search_and_match_industries(
    p_user_lat DOUBLE PRECISION,
    p_user_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 25.0,
    p_query_embedding VECTOR(384) DEFAULT NULL,
    p_weight_semantic DOUBLE PRECISION DEFAULT 0.7,
    p_weight_distance DOUBLE PRECISION DEFAULT 0.3,
    p_sector TEXT DEFAULT NULL,
    p_group_size INT DEFAULT NULL,
    p_education_level TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    readable_id TEXT,
    name TEXT,
    sector TEXT,
    description TEXT,
    highlights TEXT,
    curriculum_topics TEXT,
    min_education_level TEXT,
    min_group_size INT,
    max_group_size INT,
    student_to_teacher_ratio INT,
    minors_allowed BOOLEAN,
    ppe_requirements TEXT[],
    address TEXT,
    city TEXT,
    photos TEXT[],
    distance_km DOUBLE PRECISION,
    semantic_similarity DOUBLE PRECISION,
    combined_score DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH filtered AS (
        SELECT 
            i.id,
            i.readable_id,
            i.name,
            i.sector,
            i.description,
            i.highlights,
            i.curriculum_topics,
            i.min_education_level,
            i.min_group_size,
            i.max_group_size,
            i.student_to_teacher_ratio,
            i.minors_allowed,
            i.ppe_requirements,
            i.address,
            i.city,
            i.photos,
            ROUND((ST_Distance(i.location, ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography) / 1000.0)::numeric, 2)::double precision AS dist_km,
            CASE 
                WHEN p_query_embedding IS NOT NULL AND i.embedding IS NOT NULL THEN
                    GREATEST(0.0, 1.0 - (i.embedding <=> p_query_embedding))
                ELSE 0.0
            END AS sim,
            ST_Y(i.location::geometry) AS lat,
            ST_X(i.location::geometry) AS lng
        FROM industries i
        WHERE i.verification_status = 'verified'
          AND i.is_active = TRUE
          -- Hard Spatial Filter via PostGIS GiST index
          AND ST_DWithin(
              i.location, 
              ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography, 
              p_radius_km * 1000.0
          )
          -- Hard Capacity Filter
          AND (p_group_size IS NULL OR i.max_group_size >= p_group_size)
          -- Hard Sector Filter
          AND (p_sector IS NULL OR p_sector = '' OR i.sector = p_sector)
    )
    SELECT 
        f.id,
        f.readable_id,
        f.name,
        f.sector,
        f.description,
        f.highlights,
        f.curriculum_topics,
        f.min_education_level,
        f.min_group_size,
        f.max_group_size,
        f.student_to_teacher_ratio,
        f.minors_allowed,
        f.ppe_requirements,
        f.address,
        f.city,
        f.photos,
        f.dist_km,
        f.sim,
        CASE 
            WHEN p_query_embedding IS NOT NULL THEN
                ROUND((
                    (p_weight_semantic * f.sim) + 
                    (p_weight_distance * GREATEST(0.0, (1.0 - (f.dist_km / p_radius_km))))
                )::numeric, 4)::double precision
            ELSE
                ROUND((1.0 - (f.dist_km / p_radius_km))::numeric, 4)::double precision
        END AS score,
        f.lat,
        f.lng
    FROM filtered f
    ORDER BY score DESC, f.dist_km ASC;
END;
$$;
