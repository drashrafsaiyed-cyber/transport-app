// MYC Travels Setup — Direct SQL via pg
const { Client } = require('pg')

const DB_URL = 'postgresql://neondb_owner:npg_0R9LVxlXivHO@ep-square-bread-a1gg5la8.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })

async function main() {
  await client.connect()
  console.log('Connected to Neon database\n')

  // 1. Update settings
  await client.query(`
    UPDATE "AppSetting" SET
      "companyName"      = 'MYC TRAVELS',
      "companyAddress"   = E'GF-06, A-1, White Peral Appartment,\nNr. Parnami Agarbaati, Padra,\nVadodara, Gujarat - 391440',
      "currencySymbol"   = '\u20B9',
      "invoiceFooter"    = 'Thank you for choosing MYC Travels! \u2014 Juberbhai Garasiya (Proprietor)',
      "invoicePrefix"    = 'MYC',
      "invoiceCounter"   = 1,
      "enableGst"        = true,
      "companyGstNumber" = '24ATFPG1538D1Z8',
      "gstPercentage"    = 18,
      "cgstPercentage"   = 9,
      "sgstPercentage"   = 9,
      "igstPercentage"   = 18,
      "defaultGstType"   = 'CGST_SGST',
      "updatedAt"        = NOW()
    WHERE id = 'default'
  `)
  console.log('Settings updated')

  // 2. Clear all demo data
  const p  = await client.query('DELETE FROM "Payment"')
  console.log('Deleted ' + p.rowCount + ' payment(s)')

  const t  = await client.query('DELETE FROM "Trip"')
  console.log('Deleted ' + t.rowCount + ' trip(s)')

  const d  = await client.query('DELETE FROM "Driver"')
  console.log('Deleted ' + d.rowCount + ' driver(s)')

  const v  = await client.query('DELETE FROM "Vehicle"')
  console.log('Deleted ' + v.rowCount + ' vehicle(s)')

  const pa = await client.query('DELETE FROM "Party"')
  console.log('Deleted ' + pa.rowCount + ' party/parties')

  // 3. Verify
  const res = await client.query('SELECT * FROM "AppSetting" WHERE id = $1', ['default'])
  const s = res.rows[0]
  console.log('\nFinal Settings:')
  console.log('  Company :', s.companyName)
  console.log('  GSTIN   :', s.companyGstNumber)
  console.log('  GST On  :', s.enableGst)
  console.log('  Currency:', s.currencySymbol)
  console.log('\nMYC Travels is ready!')

  await client.end()
}

main().catch(function(e) { console.error('Error:', e.message); process.exit(1) })
