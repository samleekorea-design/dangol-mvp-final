const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure you have your service account key file in the project
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const fcmToken = 'cc906HR5L86u10_MEdj2tq:APA91bEsjtwxHvskUzWkLmN0U-G5reC9eQn7cuLzMqBKzoASywKLKFf7idAudunlV8klrF5imE23kfTMubUN9vj7g_j4-hvhpeYFR2ekrOtrjGgervHTg7c';

const message = {
  notification: {
    title: 'Dangol 테스트',
    body: '테스트 알림 - 50% 할인!'
  },
  token: fcmToken
};

async function sendTestNotification() {
  try {
    console.log('Sending test notification...');
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

sendTestNotification();