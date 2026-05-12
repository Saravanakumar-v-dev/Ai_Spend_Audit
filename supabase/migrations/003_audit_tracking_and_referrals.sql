-- Migration: 003_audit_tracking_and_referrals.sql
-- Adds rate limit tracking and referral reward system

-- Rate Limit Tracking Table
CREATE TABLE IF NOT EXISTS audit_rate_limits (
  id BIGSERIAL PRIMARY KEY,
  client_ip VARCHAR(45) NOT NULL,
  request_count INT DEFAULT 1,
  reset_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_ip, reset_time)
);

CREATE INDEX idx_rate_limits_ip_reset ON audit_rate_limits(client_ip, reset_time);

-- Referral Rewards Table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id BIGSERIAL PRIMARY KEY,
  referrer_email VARCHAR(255) NOT NULL,
  referred_email VARCHAR(255) NOT NULL UNIQUE,
  reward_type VARCHAR(50) DEFAULT 'consultation_credit',
  reward_value VARCHAR(100) DEFAULT '$50 credit toward consultation',
  redeemed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_referral_rewards_referrer ON referral_rewards(referrer_email);
CREATE INDEX idx_referral_rewards_referred ON referral_rewards(referred_email);

-- Update Leads Table to add referral tracking
ALTER TABLE leads 
  ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20),
  ADD COLUMN IF NOT EXISTS affiliate_revenue_share DECIMAL(5, 2) DEFAULT 0.00;

CREATE INDEX idx_leads_referral_code ON leads(referral_code);
CREATE INDEX idx_leads_referred_by ON leads(referred_by);

-- Row Level Security Policies
ALTER TABLE audit_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Rate limits are public (no auth needed to check)
CREATE POLICY rate_limits_public ON audit_rate_limits
  FOR SELECT USING (TRUE);

-- Referral rewards visible to referrer and referred
CREATE POLICY referral_rewards_visible ON referral_rewards
  FOR SELECT USING (
    TRUE -- Keep public for now, add auth later
  );
