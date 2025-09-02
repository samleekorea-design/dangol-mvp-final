import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getKoreanTime } from './timezoneUtils';

export interface Merchant {
  id: number;
  business_name: string;
  address: string;
  phone?: string;
  email: string;
  latitude: number;
  longitude: number;
  password_hash: string;
  created_at: string;
}

export interface Deal {
  id: number;
  merchant_id: number;
  title: string;
  description: string;
  expires_at: string;
  max_claims: number;
  current_claims: number;
  created_at: string;
  merchant_name?: string;
  merchant_address?: string;
}

export interface Claim {
  id: number;
  deal_id: number;
  device_id: string;
  claim_code: string;
  claimed_at: string;
  expires_at: string;
  redeemed_at?: string;
}

export interface PushSubscription {
  id: number;
  device_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: string;
  target_type: 'all' | 'radius' | 'device' | 'merchant_customers';
  target_value?: string;
  merchant_id?: number;
  radius_lat?: number;
  radius_lng?: number;
  radius_meters?: number;
  created_by: string;
  created_at: string;
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  total_delivered: number;
  total_clicked: number;
  status: 'pending' | 'sending' | 'sent' | 'failed';
}

export interface NotificationDelivery {
  id: number;
  notification_id: number;
  device_id: string;
  subscription_endpoint: string;
  sent_at: string;
  delivered_at?: string;
  clicked_at?: string;
  failed_at?: string;
  error_message?: string;
  status: 'sent' | 'delivered' | 'clicked' | 'failed';
}

class DangolDB {
  private db: Database.Database;

  constructor() {
    this.db = this.initializeDatabase();
  }

  // Expose database for health checks
  public get database(): Database.Database {
    return this.db;
  }

  private initializeDatabase(): Database.Database {
    try {
      // Determine database path - use /tmp for Vercel serverless
      const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
      const dbPath = isVercel ? '/tmp/dangol-v2.db' : 'dangol-v2.db';
      
      console.log(`🗄️  Initializing database at: ${dbPath}`);
      
      // Ensure directory exists
      if (isVercel) {
        const dbDir = dirname(dbPath);
        if (!existsSync(dbDir)) {
          mkdirSync(dbDir, { recursive: true });
        }
      }
      
      // Create database connection
      const db = new Database(dbPath);
      
      // Create tables with inline schema (fallback if schema.sql not accessible)
      this.createTables(db);
      
      console.log('✅ Database initialized successfully');
      return db;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }
  
  private createTables(db: Database.Database) {
    try {
      // Try to read schema.sql first
      let schema: string;
      try {
        const schemaPath = join(process.cwd(), 'src/lib/schema.sql');
        if (existsSync(schemaPath)) {
          schema = readFileSync(schemaPath, 'utf-8');
          console.log('📄 Using schema.sql file');
        } else {
          throw new Error('schema.sql not found, using inline schema');
        }
      } catch (schemaError) {
        console.log('📝 Using inline schema (schema.sql not accessible)');
        schema = this.getInlineSchema();
      }
      
      // Execute schema
      db.exec(schema);
      console.log('📋 Database tables created/verified');
    } catch (error) {
      console.error('❌ Failed to create tables:', error);
      throw error;
    }
  }
  
  private getInlineSchema(): string {
    return `
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
        data TEXT,
        target_type TEXT NOT NULL CHECK(target_type IN ('all', 'radius', 'device', 'merchant_customers')),
        target_value TEXT,
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
    `;
  }

  // MERCHANT OPERATIONS
  async createMerchant(businessName: string, address: string, phone: string, email: string, latitude: number, longitude: number, password: string): Promise<Merchant | null> {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const result = this.db.prepare(`
        INSERT INTO merchants (business_name, address, phone, email, latitude, longitude, password_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(businessName, address, phone, email, latitude, longitude, passwordHash);
      
      return this.getMerchant(Number(result.lastInsertRowid));
    } catch (error) {
      console.error('Create merchant error:', error);
      return null;
    }
  }

  getMerchant(id: number): Merchant | null {
    return this.db.prepare('SELECT * FROM merchants WHERE id = ?').get(id) as Merchant || null;
  }

  async authenticateMerchant(email: string, password: string): Promise<Merchant | null> {
    const merchant = this.db.prepare('SELECT * FROM merchants WHERE email = ?').get(email) as Merchant;
    if (!merchant) return null;
    
    const isValid = await bcrypt.compare(password, merchant.password_hash);
    return isValid ? merchant : null;
  }

  // DEAL OPERATIONS
  createDeal(merchantId: number, title: string, description: string, hoursValid: number, maxClaims: number = 999): Deal | null {
    try {
      // Calculate expiration time: start with current UTC time, add hours, then store as UTC string
      // This maintains consistency with the old approach but accounts for Korean timezone in the comparison logic
      const utcNow = new Date();
      const expiresAt = new Date(utcNow.getTime() + hoursValid * 60 * 60 * 1000);
      const expiresAtString = expiresAt.toISOString().replace('T', ' ').slice(0, -5);
      
      console.log(`🕐 Creating deal with UTC expiration (for consistency):`, {
        utcNow: utcNow.toISOString(),
        hoursValid,
        expiresAt: expiresAt.toISOString(),
        expiresAtString
      });
      
      const result = this.db.prepare(`
        INSERT INTO deals (merchant_id, title, description, expires_at, max_claims)
        VALUES (?, ?, ?, ?, ?)
      `).run(merchantId, title, description, expiresAtString, maxClaims);

      return this.getDeal(Number(result.lastInsertRowid));
    } catch (error) {
      console.error('Create deal error:', error);
      return null;
    }
  }

  // Helper method to check if deal is expired with backward compatibility
  isDealExpired(deal: Deal): boolean {
    const koreanNow = getKoreanTime();
    
    // Deals created after the timezone fix (approximately after deal ID 20)
    // are stored in Korean timezone, while older deals are stored in UTC
    const TIMEZONE_FIX_CUTOFF_ID = 21;
    
    if (deal.id >= TIMEZONE_FIX_CUTOFF_ID) {
      // New deals: stored as Korean time, compare directly
      const expiryDate = new Date(deal.expires_at);
      return expiryDate < koreanNow;
    } else {
      // Old deals: stored as UTC, parse as UTC and compare with Korean time
      const expiryDate = new Date(deal.expires_at + ' UTC');
      return expiryDate < koreanNow;
    }
  }

  getDeal(id: number): Deal | null {
    return this.db.prepare(`
      SELECT d.*, m.business_name as merchant_name, m.address as merchant_address 
      FROM deals d 
      JOIN merchants m ON d.merchant_id = m.id 
      WHERE d.id = ?
    `).get(id) as Deal || null;
  }

  getMerchantDeals(merchantId: number): Deal[] {
    return this.db.prepare(`
      SELECT d.*, m.business_name as merchant_name, m.address as merchant_address 
      FROM deals d 
      JOIN merchants m ON d.merchant_id = m.id 
      WHERE d.merchant_id = ?
      ORDER BY d.created_at DESC
    `).all(merchantId) as Deal[];
  }

  getActiveDealsNearLocation(lat: number, lng: number, radiusMeters: number = 200): Deal[] {
    const latRange = radiusMeters / 111000;
    const lngRange = radiusMeters / (111000 * Math.cos(lat * Math.PI / 180));

    return this.db.prepare(`
      SELECT d.*, m.business_name as merchant_name, m.address as merchant_address, m.latitude, m.longitude
      FROM deals d 
      JOIN merchants m ON d.merchant_id = m.id 
      WHERE d.expires_at > datetime('now', '+9 hours')
      AND d.current_claims < d.max_claims
      AND m.latitude BETWEEN ? AND ?
      AND m.longitude BETWEEN ? AND ?
    `).all(
      lat - latRange, lat + latRange,
      lng - lngRange, lng + lngRange
    ) as Deal[];
  }

  // CLAIM OPERATIONS
  claimDeal(dealId: number, deviceId: string): string | null {
    const deal = this.getDeal(dealId);
    if (!deal || deal.current_claims >= deal.max_claims) {
      return null;
    }

    // Fix: Use single quotes for SQLite datetime function
    const isExpired = this.db.prepare("SELECT 1 FROM deals WHERE id = ? AND expires_at <= datetime('now')").get(dealId);
    if (isExpired) {
      return null;
    }


    // Check if device already claimed this deal
    const existingClaim = this.db.prepare('SELECT * FROM claims WHERE deal_id = ? AND device_id = ?').get(dealId, deviceId);
    if (existingClaim) return null;

    const claimCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Calculate expiration time in JavaScript and format for SQLite
    const expirationDate = new Date(Date.now() + 30 * 60 * 1000);
    const expiresAt = expirationDate.toISOString().replace('T', ' ').slice(0, -5);

    try {
      this.db.prepare('INSERT INTO claims (deal_id, device_id, claim_code, expires_at) VALUES (?, ?, ?, ?)').run(dealId, deviceId, claimCode, expiresAt);
      this.db.prepare('UPDATE deals SET current_claims = current_claims + 1 WHERE id = ?').run(dealId);
      return claimCode;
    } catch (error) {
      console.error('Claim deal error:', error);
      return null;
    }
  }

  redeemClaim(claimCode: string): boolean {
    const claim = this.db.prepare('SELECT * FROM claims WHERE claim_code = ? AND redeemed_at IS NULL').get(claimCode) as Claim;
    if (!claim) {
      return false;
    }

    // Fix: Use SQLite datetime comparison instead of JavaScript Date
    const isExpired = this.db.prepare("SELECT 1 FROM claims WHERE claim_code = ? AND expires_at <= datetime('now')").get(claimCode);
    if (isExpired) {
      return false;
    }

    this.db.prepare("UPDATE claims SET redeemed_at = datetime('now') WHERE claim_code = ?").run(claimCode);
    return true;
  }

  getClaimedDealsByDevice(deviceId: string): Array<{
    dealId: number;
    claimCode: string;
    expiresAt: string;
    claimedAt: string;
    redeemedAt?: string;
    dealTitle: string;
    dealDescription: string;
    merchantName: string;
  }> {
    return this.db.prepare(`
      SELECT 
        c.deal_id as dealId,
        c.claim_code as claimCode,
        c.expires_at as expiresAt,
        c.claimed_at as claimedAt,
        c.redeemed_at as redeemedAt,
        d.title as dealTitle,
        d.description as dealDescription,
        m.business_name as merchantName
      FROM claims c
      JOIN deals d ON c.deal_id = d.id
      JOIN merchants m ON d.merchant_id = m.id
      WHERE c.device_id = ?
      AND c.expires_at > datetime('now')
      AND c.redeemed_at IS NULL
      ORDER BY c.claimed_at DESC
    `).all(deviceId) as Array<{
      dealId: number;
      claimCode: string;
      expiresAt: string;
      claimedAt: string;
      redeemedAt?: string;
      dealTitle: string;
      dealDescription: string;
      merchantName: string;
    }>;
  }

  // PUSH SUBSCRIPTION OPERATIONS
  savePushSubscription(deviceId: string, subscription: any): PushSubscription | null {
    try {
      const result = this.db.prepare(`
        INSERT OR REPLACE INTO push_subscriptions (device_id, endpoint, p256dh_key, auth_key, user_agent, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).run(
        deviceId,
        subscription.endpoint,
        subscription.keys?.p256dh || '',
        subscription.keys?.auth || '',
        (typeof navigator !== 'undefined') ? navigator.userAgent : 'server'
      );

      return this.getPushSubscription(deviceId);
    } catch (error) {
      console.error('Save push subscription error:', error);
      return null;
    }
  }

  getPushSubscription(deviceId: string): PushSubscription | null {
    return this.db.prepare('SELECT * FROM push_subscriptions WHERE device_id = ?').get(deviceId) as PushSubscription || null;
  }

  getActivePushSubscriptions(): PushSubscription[] {
    return this.db.prepare('SELECT * FROM push_subscriptions ORDER BY updated_at DESC').all() as PushSubscription[];
  }

  deletePushSubscription(deviceId: string): boolean {
    try {
      const result = this.db.prepare('DELETE FROM push_subscriptions WHERE device_id = ?').run(deviceId);
      return result.changes > 0;
    } catch (error) {
      console.error('Delete push subscription error:', error);
      return false;
    }
  }

  getDevicesByLocation(lat: number, lng: number, radiusMeters: number): string[] {
    // Get devices that have claimed deals from merchants within the radius
    const latRange = radiusMeters / 111000;
    const lngRange = radiusMeters / (111000 * Math.cos(lat * Math.PI / 180));

    const deviceIds = this.db.prepare(`
      SELECT DISTINCT c.device_id
      FROM claims c
      JOIN deals d ON c.deal_id = d.id
      JOIN merchants m ON d.merchant_id = m.id
      WHERE m.latitude BETWEEN ? AND ?
      AND m.longitude BETWEEN ? AND ?
    `).all(
      lat - latRange, lat + latRange,
      lng - lngRange, lng + lngRange
    ) as Array<{ device_id: string }>;

    return deviceIds.map(row => row.device_id);
  }

  getMerchantCustomerDevices(merchantId: number): string[] {
    const deviceIds = this.db.prepare(`
      SELECT DISTINCT c.device_id
      FROM claims c
      JOIN deals d ON c.deal_id = d.id
      WHERE d.merchant_id = ?
    `).all(merchantId) as Array<{ device_id: string }>;

    return deviceIds.map(row => row.device_id);
  }

  // NOTIFICATION OPERATIONS
  createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'total_recipients' | 'total_delivered' | 'total_clicked' | 'status'>): Notification | null {
    try {
      const result = this.db.prepare(`
        INSERT INTO notifications (
          title, body, icon, badge, data, target_type, target_value, merchant_id, 
          radius_lat, radius_lng, radius_meters, created_by, scheduled_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        notification.title,
        notification.body,
        notification.icon,
        notification.badge,
        notification.data,
        notification.target_type,
        notification.target_value,
        notification.merchant_id,
        notification.radius_lat,
        notification.radius_lng,
        notification.radius_meters,
        notification.created_by,
        notification.scheduled_at
      );

      return this.getNotification(Number(result.lastInsertRowid));
    } catch (error) {
      console.error('Create notification error:', error);
      return null;
    }
  }

  getNotification(id: number): Notification | null {
    return this.db.prepare('SELECT * FROM notifications WHERE id = ?').get(id) as Notification || null;
  }

  getNotifications(limit: number = 50): Notification[] {
    return this.db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?').all(limit) as Notification[];
  }

  updateNotificationStatus(id: number, status: Notification['status'], metrics?: { total_recipients?: number, total_delivered?: number, total_clicked?: number }): void {
    try {
      let query = 'UPDATE notifications SET status = ?';
      const params: any[] = [status];

      if (status === 'sent') {
        query += ', sent_at = datetime(\'now\')';
      }

      if (metrics) {
        if (metrics.total_recipients !== undefined) {
          query += ', total_recipients = ?';
          params.push(metrics.total_recipients);
        }
        if (metrics.total_delivered !== undefined) {
          query += ', total_delivered = ?';
          params.push(metrics.total_delivered);
        }
        if (metrics.total_clicked !== undefined) {
          query += ', total_clicked = ?';
          params.push(metrics.total_clicked);
        }
      }

      query += ' WHERE id = ?';
      params.push(id);

      this.db.prepare(query).run(...params);
    } catch (error) {
      console.error('Update notification status error:', error);
    }
  }

  // NOTIFICATION DELIVERY OPERATIONS
  createNotificationDelivery(notificationId: number, deviceId: string, subscriptionEndpoint: string): NotificationDelivery | null {
    try {
      const result = this.db.prepare(`
        INSERT INTO notification_deliveries (notification_id, device_id, subscription_endpoint)
        VALUES (?, ?, ?)
      `).run(notificationId, deviceId, subscriptionEndpoint);

      return this.getNotificationDelivery(Number(result.lastInsertRowid));
    } catch (error) {
      console.error('Create notification delivery error:', error);
      return null;
    }
  }

  getNotificationDelivery(id: number): NotificationDelivery | null {
    return this.db.prepare('SELECT * FROM notification_deliveries WHERE id = ?').get(id) as NotificationDelivery || null;
  }

  updateNotificationDeliveryStatus(id: number, status: NotificationDelivery['status'], errorMessage?: string): void {
    try {
      let query = 'UPDATE notification_deliveries SET status = ?';
      const params: any[] = [status];

      switch (status) {
        case 'delivered':
          query += ', delivered_at = datetime(\'now\')';
          break;
        case 'clicked':
          query += ', clicked_at = datetime(\'now\')';
          break;
        case 'failed':
          query += ', failed_at = datetime(\'now\')';
          if (errorMessage) {
            query += ', error_message = ?';
            params.push(errorMessage);
          }
          break;
      }

      query += ' WHERE id = ?';
      params.push(id);

      this.db.prepare(query).run(...params);
    } catch (error) {
      console.error('Update notification delivery status error:', error);
    }
  }

  getNotificationDeliveries(notificationId: number): NotificationDelivery[] {
    return this.db.prepare('SELECT * FROM notification_deliveries WHERE notification_id = ? ORDER BY sent_at DESC').all(notificationId) as NotificationDelivery[];
  }

  // NOTIFICATION ANALYTICS
  getNotificationAnalytics() {
    try {
      const totalNotifications = this.db.prepare('SELECT COUNT(*) as count FROM notifications').get() as { count: number };
      const totalDeliveries = this.db.prepare('SELECT COUNT(*) as count FROM notification_deliveries').get() as { count: number };
      const totalClicked = this.db.prepare('SELECT COUNT(*) as count FROM notification_deliveries WHERE status = "clicked"').get() as { count: number };
      const totalFailed = this.db.prepare('SELECT COUNT(*) as count FROM notification_deliveries WHERE status = "failed"').get() as { count: number };

      const recentNotifications = this.db.prepare(`
        SELECT 
          id, title, target_type, total_recipients, total_delivered, total_clicked,
          created_at, sent_at, status
        FROM notifications 
        ORDER BY created_at DESC 
        LIMIT 10
      `).all();

      return {
        totalNotifications: totalNotifications.count,
        totalDeliveries: totalDeliveries.count,
        totalClicked: totalClicked.count,
        totalFailed: totalFailed.count,
        clickRate: totalDeliveries.count > 0 ? (totalClicked.count / totalDeliveries.count) * 100 : 0,
        deliveryRate: totalDeliveries.count > 0 ? ((totalDeliveries.count - totalFailed.count) / totalDeliveries.count) * 100 : 0,
        recentNotifications
      };
    } catch (error) {
      console.error('Get notification analytics error:', error);
      return {
        totalNotifications: 0,
        totalDeliveries: 0,
        totalClicked: 0,
        totalFailed: 0,
        clickRate: 0,
        deliveryRate: 0,
        recentNotifications: []
      };
    }
  }
}

export const db = new DangolDB();