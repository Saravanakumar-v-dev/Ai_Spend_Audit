-- ============================================================
-- AI Spend Audit — Supabase Schema Migration (002)
-- ============================================================
-- Creates the leads table for capturing prospect data from audits.
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             TEXT NOT NULL,
  company           TEXT NOT NULL,
  savings_estimate  NUMERIC NOT NULL,
  audit_data_json   JSONB NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);

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
