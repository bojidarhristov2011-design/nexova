require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(
  "UPDATE \"User\" SET \"isAdmin\" = true WHERE email = 'bojidarhristov2011@gmail.com'",
  (err, res) => {
    if (err) { console.error('Error:', err.message); process.exit(1); }
    console.log('Updated rows:', res.rowCount);
    pool.end();
  }
);
