import { Pool, PoolClient } from 'pg';
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
  private pool: Pool;

  constructor() {
    this.pool = this.initializeDatabase();
  }

  // Expose pool for health checks
  public get database(): Pool {
    return this.pool;
  }

  private initializeDatabase(): Pool {
    try {
      // Parse DATABASE_URL or use environment variables
      const databaseUrl = process.env.DATABASE_URL;
      
      let poolConfig;
      if (databaseUrl) {
        poolConfig = {
          connectionString: databaseUrl,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };
      } else {
        poolConfig = {
          user: process.env.POSTGRES_USER || 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          database: process.env.POSTGRES_DB || 'dangol_v2',
          password: process.env.POSTGRES_PASSWORD || 'password',
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };
      }

      const pool = new Pool(poolConfig);
      
      console.log('🗄️  PostgreSQL pool initialized');
      
      // Create tables on initialization
      this.createTables();
      
      console.log('✅ Database initialized successfully');
      return pool;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async createTables() {
    try {
      const schema = this.getPostgreSQLSchema();
      const client = await this.pool.connect();
      
      try {
        await client.query(schema);
        console.log('📋 Database tables created/verified');
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Failed to create tables:', error);
      throw error;
    }
  }

  private getPostgreSQLSchema(): string {
    return `
      -- Dangol V2 Database Schema (PostgreSQL)
      CREATE TABLE IF NOT EXISTS merchants (
        id SERIAL PRIMARY KEY,
        business_name TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT UNIQUE NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS deals (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        max_claims INTEGER DEFAULT 999,
        current_claims INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (merchant_id) REFERENCES merchants (id)
      );
      
      CREATE TABLE IF NOT EXISTS claims (
        id SERIAL PRIMARY KEY,
        deal_id INTEGER NOT NULL,
        device_id TEXT NOT NULL,
        claim_code TEXT UNIQUE NOT NULL,
        claimed_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        redeemed_at TIMESTAMP NULL,
        FOREIGN KEY (deal_id) REFERENCES deals (id)
      );
      
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        device_id TEXT NOT NULL UNIQUE,
        endpoint TEXT NOT NULL,
        p256dh_key TEXT NOT NULL,
        auth_key TEXT NOT NULL,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT NOW(),
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        total_recipients INTEGER DEFAULT 0,
        total_delivered INTEGER DEFAULT 0,
        total_clicked INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sending', 'sent', 'failed')),
        FOREIGN KEY (merchant_id) REFERENCES merchants (id)
      );
      
      CREATE TABLE IF NOT EXISTS notification_deliveries (
        id SERIAL PRIMARY KEY,
        notification_id INTEGER NOT NULL,
        device_id TEXT NOT NULL,
        subscription_endpoint TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT NOW(),
        delivered_at TIMESTAMP,
        clicked_at TIMESTAMP,
        failed_at TIMESTAMP,
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
      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          INSERT INTO merchants (business_name, address, phone, email, latitude, longitude, password_hash)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id
        `, [businessName, address, phone, email, latitude, longitude, passwordHash]);
        
        const merchantId = result.rows[0].id;
        return await this.getMerchant(merchantId);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Create merchant error:', error);
      return null;
    }
  }

  async getMerchant(id: number): Promise<Merchant | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM merchants WHERE id = $1', [id]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get merchant error:', error);
      return null;
    }
  }

  async authenticateMerchant(email: string, password: string): Promise<Merchant | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM merchants WHERE email = $1', [email]);
        const merchant = result.rows[0];
        
        if (!merchant) return null;
        
        const isValid = await bcrypt.compare(password, merchant.password_hash);
        return isValid ? merchant : null;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Authenticate merchant error:', error);
      return null;
    }
  }

  // DEAL OPERATIONS
  async createDeal(merchantId: number, title: string, description: string, hoursValid: number, maxClaims: number = 999): Promise<Deal | null> {
    try {
      const utcNow = new Date();
      const expiresAt = new Date(utcNow.getTime() + hoursValid * 60 * 60 * 1000);
      
      console.log(`🕐 Creating deal with UTC expiration (for consistency):`, {
        utcNow: utcNow.toISOString(),
        hoursValid,
        expiresAt: expiresAt.toISOString()
      });
      
      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          INSERT INTO deals (merchant_id, title, description, expires_at, max_claims)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [merchantId, title, description, expiresAt, maxClaims]);

        const dealId = result.rows[0].id;
        return await this.getDeal(dealId);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Create deal error:', error);
      return null;
    }
  }

  isDealExpired(deal: Deal): boolean {
    const koreanNow = getKoreanTime();
    const TIMEZONE_FIX_CUTOFF_ID = 21;
    
    if (deal.id >= TIMEZONE_FIX_CUTOFF_ID) {
      const expiryDate = new Date(deal.expires_at);
      return expiryDate < koreanNow;
    } else {
      const expiryDate = new Date(deal.expires_at + ' UTC');
      return expiryDate < koreanNow;
    }
  }

  async getDeal(id: number): Promise<Deal | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          SELECT d.*, m.business_name as merchant_name, m.address as merchant_address 
          FROM deals d 
          JOIN merchants m ON d.merchant_id = m.id 
          WHERE d.id = $1
        `, [id]);
        
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get deal error:', error);
      return null;
    }
  }

  async getMerchantDeals(merchantId: number): Promise<Deal[]> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          SELECT d.*, m.business_name as merchant_name, m.address as merchant_address 
          FROM deals d 
          JOIN merchants m ON d.merchant_id = m.id 
          WHERE d.merchant_id = $1
          ORDER BY d.created_at DESC
        `, [merchantId]);
        
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get merchant deals error:', error);
      return [];
    }
  }

  async getActiveDealsNearLocation(lat: number, lng: number, radiusMeters: number = 200): Promise<Deal[]> {
    try {
      const latRange = radiusMeters / 111000;
      const lngRange = radiusMeters / (111000 * Math.cos(lat * Math.PI / 180));

      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          SELECT d.*, m.business_name as merchant_name, m.address as merchant_address, m.latitude, m.longitude
          FROM deals d 
          JOIN merchants m ON d.merchant_id = m.id 
          WHERE d.expires_at > NOW()
          AND d.current_claims < d.max_claims
          AND m.latitude BETWEEN $1 AND $2
          AND m.longitude BETWEEN $3 AND $4
        `, [
          lat - latRange, lat + latRange,
          lng - lngRange, lng + lngRange
        ]);
        
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get active deals near location error:', error);
      return [];
    }
  }

  // CLAIM OPERATIONS
  async claimDeal(dealId: number, deviceId: string): Promise<string | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        await client.query('BEGIN');

        const deal = await this.getDeal(dealId);
        if (!deal || deal.current_claims >= deal.max_claims) {
          await client.query('ROLLBACK');
          return null;
        }

        const expiredCheck = await client.query("SELECT 1 FROM deals WHERE id = $1 AND expires_at <= NOW()", [dealId]);
        if (expiredCheck.rows.length > 0) {
          await client.query('ROLLBACK');
          return null;
        }

        const existingClaim = await client.query('SELECT * FROM claims WHERE deal_id = $1 AND device_id = $2', [dealId, deviceId]);
        if (existingClaim.rows.length > 0) {
          await client.query('ROLLBACK');
          return null;
        }

        const claimCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        const expirationDate = new Date(Date.now() + 30 * 60 * 1000);

        await client.query('INSERT INTO claims (deal_id, device_id, claim_code, expires_at) VALUES ($1, $2, $3, $4)', [dealId, deviceId, claimCode, expirationDate]);
        await client.query('UPDATE deals SET current_claims = current_claims + 1 WHERE id = $1', [dealId]);

        await client.query('COMMIT');
        return claimCode;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Claim deal error:', error);
      return null;
    }
  }

  async redeemClaim(claimCode: string): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      
      try {
        const claimResult = await client.query('SELECT * FROM claims WHERE claim_code = $1 AND redeemed_at IS NULL', [claimCode]);
        const claim = claimResult.rows[0];
        
        if (!claim) {
          return false;
        }

        const expiredCheck = await client.query("SELECT 1 FROM claims WHERE claim_code = $1 AND expires_at <= NOW()", [claimCode]);
        if (expiredCheck.rows.length > 0) {
          return false;
        }

        await client.query("UPDATE claims SET redeemed_at = NOW() WHERE claim_code = $1", [claimCode]);
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Redeem claim error:', error);
      return false;
    }
  }

  async getClaimedDealsByDevice(deviceId: string): Promise<Array<{
    dealId: number;
    claimCode: string;
    expiresAt: string;
    claimedAt: string;
    redeemedAt?: string;
    dealTitle: string;
    dealDescription: string;
    merchantName: string;
  }>> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          SELECT 
            c.deal_id as "dealId",
            c.claim_code as "claimCode",
            c.expires_at as "expiresAt",
            c.claimed_at as "claimedAt",
            c.redeemed_at as "redeemedAt",
            d.title as "dealTitle",
            d.description as "dealDescription",
            m.business_name as "merchantName"
          FROM claims c
          JOIN deals d ON c.deal_id = d.id
          JOIN merchants m ON d.merchant_id = m.id
          WHERE c.device_id = $1
          AND c.expires_at > NOW()
          AND c.redeemed_at IS NULL
          ORDER BY c.claimed_at DESC
        `, [deviceId]);
        
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get claimed deals by device error:', error);
      return [];
    }
  }

  // PUSH SUBSCRIPTION OPERATIONS
  async savePushSubscription(deviceId: string, subscription: any): Promise<PushSubscription | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        await client.query(`
          INSERT INTO push_subscriptions (device_id, endpoint, p256dh_key, auth_key, user_agent, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
          ON CONFLICT (device_id) 
          DO UPDATE SET 
            endpoint = EXCLUDED.endpoint,
            p256dh_key = EXCLUDED.p256dh_key,
            auth_key = EXCLUDED.auth_key,
            user_agent = EXCLUDED.user_agent,
            updated_at = NOW()
        `, [
          deviceId,
          subscription.endpoint,
          subscription.keys?.p256dh || '',
          subscription.keys?.auth || '',
          (typeof navigator !== 'undefined') ? navigator.userAgent : 'server'
        ]);

        return await this.getPushSubscription(deviceId);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Save push subscription error:', error);
      return null;
    }
  }

  async getPushSubscription(deviceId: string): Promise<PushSubscription | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM push_subscriptions WHERE device_id = $1', [deviceId]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get push subscription error:', error);
      return null;
    }
  }

  async getActivePushSubscriptions(): Promise<PushSubscription[]> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM push_subscriptions ORDER BY updated_at DESC');
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get active push subscriptions error:', error);
      return [];
    }
  }

  async deletePushSubscription(deviceId: string): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('DELETE FROM push_subscriptions WHERE device_id = $1', [deviceId]);
        return result.rowCount > 0;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Delete push subscription error:', error);
      return false;
    }
  }

  async getDevicesByLocation(lat: number, lng: number, radiusMeters: number): Promise<string[]> {
    try {
      const latRange = radiusMeters / 111000;
      const lngRange = radiusMeters / (111000 * Math.cos(lat * Math.PI / 180));

      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          SELECT DISTINCT c.device_id
          FROM claims c
          JOIN deals d ON c.deal_id = d.id
          JOIN merchants m ON d.merchant_id = m.id
          WHERE m.latitude BETWEEN $1 AND $2
          AND m.longitude BETWEEN $3 AND $4
        `, [
          lat - latRange, lat + latRange,
          lng - lngRange, lng + lngRange
        ]);

        return result.rows.map(row => row.device_id);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get devices by location error:', error);
      return [];
    }
  }

  async getMerchantCustomerDevices(merchantId: number): Promise<string[]> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          SELECT DISTINCT c.device_id
          FROM claims c
          JOIN deals d ON c.deal_id = d.id
          WHERE d.merchant_id = $1
        `, [merchantId]);

        return result.rows.map(row => row.device_id);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get merchant customer devices error:', error);
      return [];
    }
  }

  // NOTIFICATION OPERATIONS
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'total_recipients' | 'total_delivered' | 'total_clicked' | 'status'>): Promise<Notification | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          INSERT INTO notifications (
            title, body, icon, badge, data, target_type, target_value, merchant_id, 
            radius_lat, radius_lng, radius_meters, created_by, scheduled_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING id
        `, [
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
        ]);

        const notificationId = result.rows[0].id;
        return await this.getNotification(notificationId);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Create notification error:', error);
      return null;
    }
  }

  async getNotification(id: number): Promise<Notification | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM notifications WHERE id = $1', [id]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get notification error:', error);
      return null;
    }
  }

  async getNotifications(limit: number = 50): Promise<Notification[]> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1', [limit]);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  async updateNotificationStatus(id: number, status: Notification['status'], metrics?: { total_recipients?: number, total_delivered?: number, total_clicked?: number }): Promise<void> {
    try {
      const client = await this.pool.connect();
      
      try {
        let query = 'UPDATE notifications SET status = $1';
        const params: any[] = [status];
        let paramIndex = 2;

        if (status === 'sent') {
          query += ', sent_at = NOW()';
        }

        if (metrics) {
          if (metrics.total_recipients !== undefined) {
            query += `, total_recipients = $${paramIndex}`;
            params.push(metrics.total_recipients);
            paramIndex++;
          }
          if (metrics.total_delivered !== undefined) {
            query += `, total_delivered = $${paramIndex}`;
            params.push(metrics.total_delivered);
            paramIndex++;
          }
          if (metrics.total_clicked !== undefined) {
            query += `, total_clicked = $${paramIndex}`;
            params.push(metrics.total_clicked);
            paramIndex++;
          }
        }

        query += ` WHERE id = $${paramIndex}`;
        params.push(id);

        await client.query(query, params);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Update notification status error:', error);
    }
  }

  // NOTIFICATION DELIVERY OPERATIONS
  async createNotificationDelivery(notificationId: number, deviceId: string, subscriptionEndpoint: string): Promise<NotificationDelivery | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query(`
          INSERT INTO notification_deliveries (notification_id, device_id, subscription_endpoint)
          VALUES ($1, $2, $3)
          RETURNING id
        `, [notificationId, deviceId, subscriptionEndpoint]);

        const deliveryId = result.rows[0].id;
        return await this.getNotificationDelivery(deliveryId);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Create notification delivery error:', error);
      return null;
    }
  }

  async getNotificationDelivery(id: number): Promise<NotificationDelivery | null> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM notification_deliveries WHERE id = $1', [id]);
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get notification delivery error:', error);
      return null;
    }
  }

  async updateNotificationDeliveryStatus(id: number, status: NotificationDelivery['status'], errorMessage?: string): Promise<void> {
    try {
      const client = await this.pool.connect();
      
      try {
        let query = 'UPDATE notification_deliveries SET status = $1';
        const params: any[] = [status];
        let paramIndex = 2;

        switch (status) {
          case 'delivered':
            query += ', delivered_at = NOW()';
            break;
          case 'clicked':
            query += ', clicked_at = NOW()';
            break;
          case 'failed':
            query += ', failed_at = NOW()';
            if (errorMessage) {
              query += `, error_message = $${paramIndex}`;
              params.push(errorMessage);
              paramIndex++;
            }
            break;
        }

        query += ` WHERE id = $${paramIndex}`;
        params.push(id);

        await client.query(query, params);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Update notification delivery status error:', error);
    }
  }

  async getNotificationDeliveries(notificationId: number): Promise<NotificationDelivery[]> {
    try {
      const client = await this.pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM notification_deliveries WHERE notification_id = $1 ORDER BY sent_at DESC', [notificationId]);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Get notification deliveries error:', error);
      return [];
    }
  }

  // NOTIFICATION ANALYTICS
  async getNotificationAnalytics() {
    try {
      const client = await this.pool.connect();
      
      try {
        const totalNotifications = await client.query('SELECT COUNT(*) as count FROM notifications');
        const totalDeliveries = await client.query('SELECT COUNT(*) as count FROM notification_deliveries');
        const totalClicked = await client.query('SELECT COUNT(*) as count FROM notification_deliveries WHERE status = $1', ['clicked']);
        const totalFailed = await client.query('SELECT COUNT(*) as count FROM notification_deliveries WHERE status = $1', ['failed']);

        const recentNotifications = await client.query(`
          SELECT 
            id, title, target_type, total_recipients, total_delivered, total_clicked,
            created_at, sent_at, status
          FROM notifications 
          ORDER BY created_at DESC 
          LIMIT 10
        `);

        const totalNotificationsCount = parseInt(totalNotifications.rows[0].count);
        const totalDeliveriesCount = parseInt(totalDeliveries.rows[0].count);
        const totalClickedCount = parseInt(totalClicked.rows[0].count);
        const totalFailedCount = parseInt(totalFailed.rows[0].count);

        return {
          totalNotifications: totalNotificationsCount,
          totalDeliveries: totalDeliveriesCount,
          totalClicked: totalClickedCount,
          totalFailed: totalFailedCount,
          clickRate: totalDeliveriesCount > 0 ? (totalClickedCount / totalDeliveriesCount) * 100 : 0,
          deliveryRate: totalDeliveriesCount > 0 ? ((totalDeliveriesCount - totalFailedCount) / totalDeliveriesCount) * 100 : 0,
          recentNotifications: recentNotifications.rows
        };
      } finally {
        client.release();
      }
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

  // Connection cleanup
  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = new DangolDB();