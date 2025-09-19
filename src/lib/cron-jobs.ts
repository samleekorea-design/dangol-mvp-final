import { db } from './database-pg'

export async function checkExpiredClaims(): Promise<number> {
  try {
    const client = await db.database.connect()

    try {
      const result = await client.query(`
        UPDATE claims
        SET status = 'expired'
        WHERE expires_at < NOW()
        AND status = 'pending'
      `)

      return result.rowCount || 0
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Check expired claims error:', error)
    throw error
  }
}