import { db } from './database';
import { parseKoreanAddress } from './addressParser';
import { isKoreanBusinessHours } from './timezoneUtils';
import { sendFCMV1Message, createFCMV1Message } from './fcmV1Service';

export interface AutoNotificationPayload {
  title: string;
  body: string;
  icon: string;
  badge: string;
  data: {
    dealId: number;
    merchantId: number;
    type: 'auto_deal_notification';
    timestamp: string;
    actionButton?: string;
  };
}

/**
 * Automatically sends notifications when merchants create deals
 * Only sends to subscribed customers (not merchants) during Korean business hours (9am-8pm KST)
 */
export class AutoNotificationService {
  private static instance: AutoNotificationService;

  private constructor() {}

  static getInstance(): AutoNotificationService {
    if (!AutoNotificationService.instance) {
      AutoNotificationService.instance = new AutoNotificationService();
    }
    return AutoNotificationService.instance;
  }

  /**
   * Triggers automatic notification when a deal is created
   * @param dealId - The ID of the newly created deal
   * @returns Promise<boolean> - Success status
   */
  async notifyNewDeal(dealId: number): Promise<boolean> {
    try {
      // Check if we're in Korean business hours (9am-8pm KST)
      if (!isKoreanBusinessHours()) {
        console.log(`🕐 Skipping automatic notification - outside business hours (9am-8pm KST)`);
        return false;
      }

      // Get deal and merchant information
      const deal = await db.getDeal(dealId);
      if (!deal) {
        console.error(`❌ Deal not found: ${dealId}`);
        return false;
      }

      const merchant = await db.getMerchant(deal.merchant_id);
      if (!merchant) {
        console.error(`❌ Merchant not found: ${deal.merchant_id}`);
        return false;
      }

      // Parse merchant address to get street and district
      const parsedAddress = parseKoreanAddress(merchant.address);
      
      // Create notification payload
      const title = `${merchant.business_name}에서 새로운 딜을 등록했습니다.`;
      const body = `${deal.title} - ${parsedAddress.streetAndDistrict}`;

      console.log(`📤 Auto-notification: ${title}`);
      console.log(`📍 Location: ${parsedAddress.streetAndDistrict}`);

      // Get all subscribed customers (excluding merchants)
      const allSubscriptions = await db.getActivePushSubscriptions();
      
      // Filter out merchant devices - we only want to notify customers
      const customerSubscriptions = allSubscriptions.filter(subscription => {
        // In a more sophisticated system, we might have a user_type field
        // For now, we assume all subscriptions are from customers
        // You could enhance this by adding a merchants_subscriptions table
        return true;
      });

      if (customerSubscriptions.length === 0) {
        console.log(`ℹ️ No customer subscriptions found for auto-notification`);
        return true;
      }

      // Create notification record in database
      const notification = await db.createNotification({
        title,
        body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: JSON.stringify({
          dealId,
          merchantId: merchant.id,
          type: 'auto_deal_notification',
          timestamp: new Date().toISOString(),
          actionButton: '더 보기'
        }),
        target_type: 'all',
        created_by: 'system_auto',
        merchant_id: merchant.id
      });

      if (!notification) {
        console.error(`❌ Failed to create notification record`);
        return false;
      }

      // Update notification with recipient count
      await db.updateNotificationStatus(notification.id, 'sending', {
        total_recipients: customerSubscriptions.length
      });

      // Send notifications
      const deliveryResults = await this.sendPushNotifications(
        notification.id,
        customerSubscriptions.map(sub => sub.device_id),
        {
          title,
          body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: {
            dealId,
            merchantId: merchant.id,
            type: 'auto_deal_notification',
            timestamp: new Date().toISOString(),
            actionButton: '더 보기'
          }
        }
      );

      // Update notification status
      const deliveredCount = deliveryResults.filter(r => r.success).length;
      await db.updateNotificationStatus(notification.id, 'sent', {
        total_delivered: deliveredCount,
        total_recipients: customerSubscriptions.length
      });

      console.log(`✅ Auto-notification sent: ${deliveredCount}/${customerSubscriptions.length} delivered`);
      return true;

    } catch (error) {
      console.error(`❌ Auto-notification error:`, error);
      return false;
    }
  }

  /**
   * Sends push notifications to devices using FCM V1 API
   * @private
   */
  private async sendPushNotifications(
    notificationId: number,
    deviceIds: string[],
    payload: AutoNotificationPayload
  ): Promise<Array<{ deviceId: string, success: boolean, error?: string }>> {
    const results: Array<{ deviceId: string, success: boolean, error?: string }> = [];

    for (const deviceId of deviceIds) {
      try {
        // Get push subscription for device
        const subscription = await db.getPushSubscription(deviceId);
        
        if (!subscription) {
          results.push({
            deviceId,
            success: false,
            error: 'No subscription found for device'
          });
          continue;
        }

        // Create notification delivery record
        const delivery = await db.createNotificationDelivery(
          notificationId,
          deviceId,
          subscription.endpoint
        );

        // Extract FCM registration token from endpoint
        // FCM endpoints have format: https://fcm.googleapis.com/fcm/send/{token}
        const tokenMatch = subscription.endpoint.match(/\/fcm\/send\/(.+)$/);
        if (!tokenMatch) {
          results.push({
            deviceId,
            success: false,
            error: 'Invalid FCM endpoint format'
          });
          continue;
        }
        
        const registrationToken = tokenMatch[1];

        // Create FCM V1 message
        const fcmMessage = createFCMV1Message(registrationToken, {
          title: payload.title,
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          data: payload.data
        });

        // Send using FCM V1 API
        const result = await sendFCMV1Message(fcmMessage);

        if (result.success) {
          // Update delivery status to delivered
          if (delivery) {
            await db.updateNotificationDeliveryStatus(delivery.id, 'delivered');
          }

          results.push({
            deviceId,
            success: true
          });
        } else {
          // Update delivery status to failed
          if (delivery) {
            await db.updateNotificationDeliveryStatus(delivery.id, 'failed', result.error);
          }

          results.push({
            deviceId,
            success: false,
            error: result.error
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to send FCM V1 to device ${deviceId}:`, errorMessage);

        // Update delivery status to failed
        const delivery = await db.createNotificationDelivery(
          notificationId,
          deviceId,
          'unknown'
        );
        if (delivery) {
          await db.updateNotificationDeliveryStatus(delivery.id, 'failed', errorMessage);
        }

        results.push({
          deviceId,
          success: false,
          error: errorMessage
        });
      }
    }

    return results;
  }

  /**
   * Test function for development
   */
  async testAutoNotification(dealId: number): Promise<void> {
    console.log(`🧪 Testing auto-notification for deal ${dealId}`);
    const result = await this.notifyNewDeal(dealId);
    console.log(`Test result: ${result ? 'Success' : 'Failed'}`);
  }
}

// Export singleton instance
export const autoNotificationService = AutoNotificationService.getInstance();