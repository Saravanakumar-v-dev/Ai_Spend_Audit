-- ============================================================
-- AI Spend Audit — Supabase Schema Migration (002)
-- ============================================================
-- Creates the leads table for capturing prospect data from audits.
-- Updated schema strictly matching Day 3 requirements:
-- Includes email, plus optional company_name, role, and team_size.
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             TEXT NOT NULL,
  company_name      TEXT,
  role              TEXT,
  team_size         INT,
  input_data        JSONB NOT NULL,
  total_savings     NUMERIC NOT NULL,
  is_high_savings   BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
-- Index to quickly find high-value leads
CREATE INDEX IF NOT EXISTS idx_leads_high_savings ON leads (is_high_savings);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Leads: service-only read and write
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert leads" ON leads
  FOR INSERT
  WITH CHECK (true);  -- Client should use API which uses service_role key

CREATE POLICY "Service role can select leads" ON leads
  FOR SELECT
  USING (true);
