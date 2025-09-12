import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  try {
    const { claimCode } = await request.json()
    
    if (!claimCode || typeof claimCode !== 'string' || claimCode.length !== 6) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 코드 형식입니다'
      }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')
      
      const claimQuery = `
        SELECT c.*, d.title, d.merchant_name, d.expires_at
        FROM claims c
        JOIN deals d ON c.deal_id = d.id
        WHERE c.claim_code = $1
      `
      
      const claimResult = await client.query(claimQuery, [claimCode])
      
      if (claimResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          error: '존재하지 않는 코드입니다'
        }, { status: 404 })
      }
      
      const claim = claimResult.rows[0]
      
      if (claim.is_redeemed) {
        await client.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          error: '이미 사용된 코드입니다'
        }, { status: 400 })
      }
      
      const now = new Date()
      if (new Date(claim.expires_at) < now) {
        await client.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          error: '만료된 코드입니다'
        }, { status: 400 })
      }
      
      const updateQuery = `
        UPDATE claims 
        SET is_redeemed = true, redeemed_at = NOW()
        WHERE claim_code = $1
      `
      
      await client.query(updateQuery, [claimCode])
      
      await client.query('COMMIT')
      
      return NextResponse.json({
        success: true,
        message: '혜택이 성공적으로 사용되었습니다',
        deal: {
          title: claim.title,
          merchant: claim.merchant_name
        }
      })
      
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Redemption error:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다'
    }, { status: 500 })
  }
}