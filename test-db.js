const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://doadmin:AVNS_teBY-IJXluVIjULQatk@dangol-db-do-user-25329351-0.d.db.ondigitalocean.com:25060/defaultdb",
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
  } else {
    console.log('✅ Connected! Server time:', res.rows[0].now);
  }
  pool.end();
});
