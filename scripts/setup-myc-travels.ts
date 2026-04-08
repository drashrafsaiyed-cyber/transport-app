/**
 * MYC Travels — Initial Setup Script
 * Run: npx tsx scripts/setup-myc-travels.ts
 *
 * This script:
 * 1. Updates AppSetting with MYC Travels GST details
 * 2. Clears all demo/test data (trips, parties, vehicles, drivers, payments)
 */

import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Setting up MYC Travels...\n')

  // ── 1. Update Company Settings ──────────────────────────────────────────
  console.log('📋 Updating company settings...')
  await prisma.appSetting.upsert({
    where: { id: 'default' },
    update: {
      companyName: 'MYC TRAVELS',
      companyAddress: 'GF-06, A-1, White Peral Appartment,\nNr. Parnami Agarbaati, Padra,\nVadodara, Gujarat - 391440',
      companyPhone: '',
      companyEmail: '',
      currencySymbol: '₹',
      invoiceFooter: 'Thank you for choosing MYC Travels! — JUBERBHAI GARASIYA (Proprietor)',
      invoicePrefix: 'MYC',
      invoiceCounter: 1,
      // GST Settings
      enableGst: true,
      companyGstNumber: '24ATFPG1538D1Z8',
      gstPercentage: 18,
      cgstPercentage: 9,
      sgstPercentage: 9,
      igstPercentage: 18,
      defaultGstType: 'CGST_SGST', // Gujarat = intrastate default
    },
    create: {
      id: 'default',
      companyName: 'MYC TRAVELS',
      companyAddress: 'GF-06, A-1, White Peral Appartment,\nNr. Parnami Agarbaati, Padra,\nVadodara, Gujarat - 391440',
      companyPhone: '',
      companyEmail: '',
      currencySymbol: '₹',
      invoiceFooter: 'Thank you for choosing MYC Travels! — JUBERBHAI GARASIYA (Proprietor)',
      invoicePrefix: 'MYC',
      invoiceCounter: 1,
      enableGst: true,
      companyGstNumber: '24ATFPG1538D1Z8',
      gstPercentage: 18,
      cgstPercentage: 9,
      sgstPercentage: 9,
      igstPercentage: 18,
      defaultGstType: 'CGST_SGST',
    },
  })
  console.log('   ✅ Company settings updated\n')

  // ── 2. Clear all demo data ───────────────────────────────────────────────
  console.log('🗑️  Clearing all demo/test data...')

  const payments = await prisma.payment.deleteMany({})
  console.log(`   Deleted ${payments.count} payment(s)`)

  const trips = await prisma.trip.deleteMany({})
  console.log(`   Deleted ${trips.count} trip(s)`)

  const drivers = await prisma.driver.deleteMany({})
  console.log(`   Deleted ${drivers.count} driver(s)`)

  const vehicles = await prisma.vehicle.deleteMany({})
  console.log(`   Deleted ${vehicles.count} vehicle(s)`)

  const parties = await prisma.party.deleteMany({})
  console.log(`   Deleted ${parties.count} party/parties\n`)

  // ── 3. Verify ─────────────────────────────────────────────────────────────
  const settings = await prisma.appSetting.findUnique({ where: { id: 'default' } })
  console.log('✅ Setup complete! Current settings:')
  console.log(`   Company   : ${settings?.companyName}`)
  console.log(`   GSTIN     : ${settings?.companyGstNumber}`)
  console.log(`   GST Enabled: ${settings?.enableGst}`)
  console.log(`   Address   : ${settings?.companyAddress?.replace(/\n/g, ', ')}`)
  console.log(`   Invoice   : ${settings?.invoicePrefix}-YYMM-XXXX`)
  console.log('\n🎉 MYC Travels is ready to use!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
