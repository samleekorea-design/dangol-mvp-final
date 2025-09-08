import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import pkg from 'pg/package.json'

export async function GET(request: NextRequest) {
  const deploymentVersion = 'v2-ssl-fixed-' + new Date().toISOString();
  const result = {
    envVarExists: false,
    envVarFormat: '',
    poolCreated: false,
    connectionError: null as string | null,
    queryResult: null as string | null,
    sslMode: false
  }

  try {
    // Step 1: Check if DATABASE_URL exists
    result.envVarExists = !!process.env.DATABASE_URL
    
    if (process.env.DATABASE_URL) {
      // Step 2: Format DATABASE_URL (mask password)
      let maskedUrl = process.env.DATABASE_URL
      // Mask password in format postgresql://user:password@host:port/db
      if (maskedUrl.includes('://') && maskedUrl.includes('@')) {
        const [protocol, rest] = maskedUrl.split('://')
        const [credentials, hostAndDb] = rest.split('@')
        if (credentials.includes(':')) {
          const [user, _password] = credentials.split(':')
          maskedUrl = `${protocol}://${user}:***@${hostAndDb}`
        }
      }
      result.envVarFormat = maskedUrl.substring(0, 30) + (maskedUrl.length > 30 ? '...' : '')
      
      // Check SSL mode
      result.sslMode = maskedUrl.includes('sslmode')
    } else {
      result.envVarFormat = 'DATABASE_URL not found'
    }

    // Step 3: Try to create Pool
    let pool: Pool | null = null
    try {
      console.log('EXACT DATABASE_URL:', process.env.DATABASE_URL);
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.CA_CERT_BASE64 ? { rejectUnauthorized: true, ca: process.env.CA_CERT_BASE64 } : process.env.DATABASE_URL?.includes('ondigitalocean.com') ? { rejectUnauthorized: false } : false
      })
      result.poolCreated = true
      
      // Step 4: Try to connect and run query
      try {
        const client = await pool.connect()
        try {
          const queryResult = await client.query('SELECT NOW()')
          result.queryResult = queryResult.rows[0].now
        } finally {
          client.release()
        }
      } catch (connectionError: any) {
        result.connectionError = connectionError.message || connectionError.toString()
      }
    } catch (poolError: any) {
      result.poolCreated = false
      result.connectionError = 'Pool creation failed: ' + (poolError.message || poolError.toString())
    } finally {
      // Clean up pool
      if (pool) {
        try {
          await pool.end()
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  } catch (error: any) {
    result.connectionError = 'Unexpected error: ' + (error.message || error.toString())
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    version: deploymentVersion,
    pgVersion: pkg.version,
    nodeVersion: process.version,
    results: result,
    fullUrl: process.env.DATABASE_URL ? 'exists-length-' + process.env.DATABASE_URL.length : 'missing'
  })
}