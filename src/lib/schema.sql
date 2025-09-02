-- Dangol V2 Database Schema
CREATE TABLE IF NOT EXISTS merchants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  merchant_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  max_claims INTEGER DEFAULT 999,
  current_claims INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (merchant_id) REFERENCES merchants (id)
);


CREATE TABLE IF NOT EXISTS claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  claim_code TEXT UNIQUE NOT NULL,
  claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  redeemed_at DATETIME NULL,
  FOREIGN KEY (deal_id) REFERENCES deals (id)
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  badge TEXT,
  data TEXT, -- JSON data for custom payload
  target_type TEXT NOT NULL CHECK(target_type IN ('all', 'radius', 'device', 'merchant_customers')),
  target_value TEXT, -- device_id, merchant_id, or radius coordinates
  merchant_id INTEGER,
  radius_lat REAL,
  radius_lng REAL,
  radius_meters INTEGER,
  created_by TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  scheduled_at DATETIME,
  sent_at DATETIME,
  total_recipients INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sending', 'sent', 'failed')),
  FOREIGN KEY (merchant_id) REFERENCES merchants (id)
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  notification_id INTEGER NOT NULL,
  device_id TEXT NOT NULL,
  subscription_endpoint TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  clicked_at DATETIME,
  failed_at DATETIME,
  error_message TEXT,
  status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'delivered', 'clicked', 'failed')),
  FOREIGN KEY (notification_id) REFERENCES notifications (id)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device_id ON push_subscriptions(device_id);
CREATE INDEX IF NOT EXISTS idx_notifications_target_type ON notifications(target_type);
CREATE INDEX IF NOT EXISTS idx_notifications_merchant_id ON notifications(merchant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_device_id ON notification_deliveries(device_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status);