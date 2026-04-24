// Update MYC Travels login credentials
// Run: node scripts/update-credentials.js
const { Client } = require('pg')
const bcrypt = require('bcryptjs')

const DB_URL = 'postgresql://neondb_owner:npg_0R9LVxlXivHO@ep-square-bread-a1gg5la8.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const NEW_EMAIL    = 'juberbhai@myctravels.com'
const NEW_NAME     = 'Juberbhai Garasiya'
const NEW_PASSWORD = 'MYC@2026Travels'

async function main() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()

  const hash = await bcrypt.hash(NEW_PASSWORD, 12)

  // Delete old admin user and create fresh one
  await client.query('DELETE FROM "User"')
  await client.query(
    'INSERT INTO "User" (id, email, name, password, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW())',
    [NEW_EMAIL, NEW_NAME, hash]
  )

  console.log('Login credentials updated!')
  console.log('  Email   :', NEW_EMAIL)
  console.log('  Password:', NEW_PASSWORD)
  console.log('  Name    :', NEW_NAME)

  await client.end()
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
