const { Client } = require('pg');
const fs = require('fs');

async function createTables() {
  const client = new Client({
    host: 'dangol-db-do-user-25329351-0.d.db.ondigitalocean.com',
    port: 25060,
    database: 'defaultdb',
    user: 'doadmin',
    password: 'AVNS_teBY-IJXluVIjULQatk',
    ssl: {
      rejectUnauthorized: false,
      require: true
    }
  });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    const schema = fs.readFileSync('src/lib/schema-pg.sql', 'utf8');
    await client.query(schema);
    console.log('Tables created successfully');
    
    const result = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    console.log('Tables created:', result.rows.map(r => r.tablename));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

createTables();
