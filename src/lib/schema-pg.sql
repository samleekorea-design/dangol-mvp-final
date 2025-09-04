-- PostgreSQL Schema for DANGOL V2

CREATE TABLE IF NOT EXISTS merchants (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  street_address VARCHAR(255),
  dong VARCHAR(100),
  gu VARCHAR(100),
  city VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  merchant_id INTEGER REFERENCES merchants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  expires_at TIMESTAMP NOT NULL,
  max_claims INTEGER DEFAULT 999,
  current_claims INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claims (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER REFERENCES deals(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  claim_code VARCHAR(10) UNIQUE NOT NULL,
  claimed_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  redeemed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  icon VARCHAR(255),
  badge VARCHAR(255),
  data TEXT,
  target_type VARCHAR(50) DEFAULT 'all',
  target_value TEXT,
  merchant_id INTEGER,
  radius_lat DECIMAL(10, 8),
  radius_lng DECIMAL(11, 8),
  radius_meters INTEGER,
  created_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT NOW(),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  total_recipients INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id SERIAL PRIMARY KEY,
  notification_id INTEGER REFERENCES notifications(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  subscription_endpoint TEXT,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  clicked_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  status VARCHAR(20) DEFAULT 'pending'
);

CREATE INDEX idx_deals_merchant ON deals(merchant_id);
CREATE INDEX idx_claims_deal ON claims(deal_id);
CREATE INDEX idx_merchants_location ON merchants(latitude, longitude);
