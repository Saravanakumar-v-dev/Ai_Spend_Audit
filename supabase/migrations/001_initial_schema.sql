-- ============================================================
-- AI Spend Audit — Supabase Schema Migration
-- ============================================================
-- Run this in the Supabase SQL Editor to create the required tables.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: audits
-- ============================================================
-- Stores each audit submission and its computed results.
-- The UUID primary key doubles as the shareable URL slug.

CREATE TABLE IF NOT EXISTS audits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  company_name    TEXT NOT NULL,
  team_size       INTEGER NOT NULL CHECK (team_size > 0),
  email           TEXT NOT NULL,
  tools_input     JSONB NOT NULL,
  audit_result    JSONB NOT NULL,
  monthly_spend   NUMERIC NOT NULL,
  potential_savings NUMERIC NOT NULL
);

-- Index for fast lookups by email (for follow-up queries)
CREATE INDEX IF NOT EXISTS idx_audits_email ON audits (email);

-- Index for analytics queries by date
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits (created_at DESC);

-- ============================================================
-- Table: pricing_data
-- ============================================================
-- Reference table containing verified AI tool pricing.
-- Updated manually based on PRICING_DATA.md verification checklist.

CREATE TABLE IF NOT EXISTS pricing_data (
  id                    SERIAL PRIMARY KEY,
  tool_slug             TEXT NOT NULL UNIQUE,
  tool_name             TEXT NOT NULL,
  vendor                TEXT NOT NULL,
  category              TEXT NOT NULL CHECK (category IN ('ide', 'chatbot', 'api', 'ui_gen')),
  plan_name             TEXT NOT NULL,
  price_monthly         NUMERIC NOT NULL,
  price_annual_monthly  NUMERIC,
  billing_model         TEXT NOT NULL CHECK (billing_model IN ('flat', 'per_seat', 'credit_based', 'per_token', 'hybrid')),
  token_input_1m        NUMERIC,
  token_output_1m       NUMERIC,
  verified_at           DATE NOT NULL,
  source_url            TEXT NOT NULL,
  notes                 TEXT
);

-- Index for category-based queries (tool selector UI)
CREATE INDEX IF NOT EXISTS idx_pricing_category ON pricing_data (category);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Audits: public read (shareable URLs), service-only write
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read audits" ON audits
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert audits" ON audits
  FOR INSERT
  WITH CHECK (true);  -- Restrict in production to service_role via API

-- Pricing: public read, admin-only write
ALTER TABLE pricing_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pricing" ON pricing_data
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage pricing" ON pricing_data
  FOR ALL
  USING (true);  -- Restrict in production to service_role via admin panel

-- ============================================================
-- Done! Tables are ready for use.
-- ============================================================
