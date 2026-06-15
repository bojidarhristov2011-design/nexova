require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT id, email, name, plan, "isAdmin", "trialEndsAt", "planStarted", "createdAt" FROM "User" ORDER BY "createdAt" DESC', (err, res) => {
  if (err) { console.error(err.message); process.exit(1); }
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
});
