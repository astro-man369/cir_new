export const SUPABASE_SQL_SCHEMA = `-- CIR HYDERABAD SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ISSUES TABLE
CREATE TABLE IF NOT EXISTS public.issues (
    id TEXT PRIMARY KEY,
    tracking_code TEXT NOT NULL UNIQUE,
    reporter_id TEXT,
    reporter_name TEXT,
    reporter_email TEXT,
    reporter_phone TEXT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    department_id TEXT NOT NULL,
    current_tier INTEGER NOT NULL DEFAULT 1,
    deadline_at TIMESTAMPTZ NOT NULL,
    ward_id TEXT,
    sla_minutes INTEGER DEFAULT 2,
    notify_email BOOLEAN DEFAULT true,
    notify_whatsapp BOOLEAN DEFAULT true,
    ai_verified BOOLEAN DEFAULT true,
    ai_confidence INTEGER DEFAULT 95,
    ai_verification_note TEXT,
    ai_photo_valid BOOLEAN DEFAULT true,
    ai_photo_validity_reason TEXT,
    points_awarded INTEGER DEFAULT 80,
    physical_verification_status TEXT DEFAULT 'unverified',
    verified_by_volunteer_name TEXT,
    physical_verification_notes TEXT,
    physical_verification_photo TEXT,
    physical_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESOLUTION PROOFS TABLE
CREATE TABLE IF NOT EXISTS public.resolution_proofs (
    id TEXT PRIMARY KEY,
    issue_id TEXT NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
    submitted_by TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    before_photo_url TEXT,
    after_photo_url TEXT,
    submitted_role TEXT NOT NULL,
    ai_match_notes TEXT,
    ai_notes TEXT,
    ai_confidence_score INTEGER,
    verified_by_ai BOOLEAN DEFAULT false,
    verified BOOLEAN DEFAULT false,
    physical_inspection_result TEXT,
    inspector_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REGISTERED NGOS TABLE
CREATE TABLE IF NOT EXISTS public.ngos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    acronym TEXT,
    description TEXT NOT NULL,
    legal_structure TEXT,
    darpan_id TEXT,
    registration_number TEXT,
    tax_exemption_80g BOOLEAN DEFAULT false,
    fcra_registered BOOLEAN DEFAULT false,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    office_address TEXT,
    chief_functionary_name TEXT,
    chief_functionary_role TEXT,
    chief_functionary_id_no TEXT,
    active_volunteers_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    areas_served TEXT[] DEFAULT '{}',
    focus_domains TEXT[] DEFAULT '{}',
    annual_audit_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NGO EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.ngo_events (
    id TEXT PRIMARY KEY,
    ngo_id TEXT NOT NULL REFERENCES public.ngos(id) ON DELETE CASCADE,
    ngo_name TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    volunteers_needed INTEGER NOT NULL DEFAULT 10,
    organizer_name TEXT,
    organizer_phone TEXT,
    organizer_email TEXT,
    assembly_point TEXT,
    gear_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES public.ngo_events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    phone TEXT,
    age INTEGER,
    occupation TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    t_shirt_size TEXT,
    skills TEXT[] DEFAULT '{}',
    previous_experience TEXT,
    health_notes TEXT,
    attended BOOLEAN DEFAULT false,
    certificate_issued BOOLEAN DEFAULT false,
    certificate_id TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENABLE RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- 7. OPEN ACCESS POLICIES
CREATE POLICY "Allow public read issues" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert issues" ON public.issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update issues" ON public.issues FOR UPDATE USING (true);

CREATE POLICY "Allow public read proofs" ON public.resolution_proofs FOR SELECT USING (true);
CREATE POLICY "Allow public insert proofs" ON public.resolution_proofs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read ngos" ON public.ngos FOR SELECT USING (true);
CREATE POLICY "Allow public insert ngos" ON public.ngos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update ngos" ON public.ngos FOR UPDATE USING (true);

CREATE POLICY "Allow public read events" ON public.ngo_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert events" ON public.ngo_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read registrations" ON public.event_registrations FOR SELECT USING (true);
CREATE POLICY "Allow public insert registrations" ON public.event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update registrations" ON public.event_registrations FOR UPDATE USING (true);
`;
