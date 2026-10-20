-- ====================================================================
-- VisitLink Phase l: Visit Logistics Schema Migration (Food, Parking, Traffic, Weather)
-- ====================================================================

-- 1. Extend Industries Table
ALTER TABLE industries
    ADD COLUMN IF NOT EXISTS canteen_available BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS meal_options TEXT[] DEFAULT ARRAY['veg']::TEXT[],
    ADD COLUMN IF NOT EXISTS max_meal_capacity INT DEFAULT 0 CHECK (max_meal_capacity >= 0),
    ADD COLUMN IF NOT EXISTS outside_food_allowed BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS refreshments_provided BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS food_notes TEXT,
    ADD COLUMN IF NOT EXISTS bus_parking_slots INT DEFAULT 0 CHECK (bus_parking_slots >= 0),
    ADD COLUMN IF NOT EXISTS car_parking_slots INT DEFAULT 0 CHECK (car_parking_slots >= 0),
    ADD COLUMN IF NOT EXISTS max_vehicle_height_m NUMERIC(3,1) DEFAULT 4.5 CHECK (max_vehicle_height_m > 0),
    ADD COLUMN IF NOT EXISTS entry_gate_instructions TEXT,
    ADD COLUMN IF NOT EXISTS parking_notes TEXT,
    ADD COLUMN IF NOT EXISTS outdoor_component BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS heat_sensitive BOOLEAN DEFAULT FALSE;

-- 2. Extend Visit Requests Table
ALTER TABLE visit_requests
    ADD COLUMN IF NOT EXISTS meals_needed BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS meal_headcount INT DEFAULT 0 CHECK (meal_headcount >= 0),
    ADD COLUMN IF NOT EXISTS dietary_notes TEXT,
    ADD COLUMN IF NOT EXISTS buses_count INT DEFAULT 0 CHECK (buses_count >= 0),
    ADD COLUMN IF NOT EXISTS cars_count INT DEFAULT 0 CHECK (cars_count >= 0),
    ADD COLUMN IF NOT EXISTS logistics_readiness JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS weather_risk_status TEXT DEFAULT 'ok',
    ADD COLUMN IF NOT EXISTS last_weather_check_at TIMESTAMPTZ;

-- 3. Configurable Settings Table (No Magic Numbers)
CREATE TABLE IF NOT EXISTS logistics_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    config_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Seed Default Settings
INSERT INTO logistics_settings (key, description, config_value) VALUES
('traffic_peak_windows', 'Peak traffic time ranges and active days for estimated travel advisory', '{
    "windows": [
        {"name": "Morning Peak", "start": "08:00", "end": "10:30"},
        {"name": "Evening Peak", "start": "17:00", "end": "20:00"}
    ],
    "active_days": [1, 2, 3, 4, 5, 6],
    "buffer_minutes_before_peak": 15
}'::jsonb),
('weather_risk_rules', 'Weather advisory thresholds for outdoor and temperature-sensitive facilities', '{
    "rain_probability_threshold": 60,
    "heat_temp_celsius_threshold": 38.0,
    "storm_weather_codes": [95, 96, 99],
    "forecast_horizon_days": 16
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Route Calculation Cache (24h TTL)
CREATE TABLE IF NOT EXISTS route_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT UNIQUE NOT NULL,
    origin_lat NUMERIC(8,5) NOT NULL,
    origin_lng NUMERIC(8,5) NOT NULL,
    dest_lat NUMERIC(8,5) NOT NULL,
    dest_lng NUMERIC(8,5) NOT NULL,
    distance_km NUMERIC(6,2) NOT NULL,
    duration_minutes INT NOT NULL,
    provider TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_route_cache_key_exp ON route_cache (cache_key, expires_at);

-- 5. Row Level Security on New Tables (Deny by default)
ALTER TABLE logistics_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_cache ENABLE ROW LEVEL SECURITY;

-- Settings: viewable by authenticated users, modifiable only by admins
CREATE POLICY "Logistics settings viewable by authenticated users"
ON logistics_settings FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Logistics settings editable only by platform admins"
ON logistics_settings FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Route Cache: read-only for authenticated, insert for authenticated
CREATE POLICY "Route cache viewable by authenticated users"
ON route_cache FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Route cache insertable by authenticated users"
ON route_cache FOR INSERT TO authenticated
WITH CHECK (true);
