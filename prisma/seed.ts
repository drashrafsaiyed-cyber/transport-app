import { PrismaClient, VehicleType, DriverStatus, PaymentStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@transport.com' },
    update: {},
    create: {
      email: 'admin@transport.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  })

  // App settings
  await prisma.appSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'Shree Ram Transport',
      companyAddress: '123 Transport Nagar, Mumbai, Maharashtra 400001',
      invoiceFooter: 'Thank you for your business!',
      currencySymbol: '₹',
      dateFormat: 'dd/MM/yyyy',
    },
  })

  // Vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { vehicleNumber: 'MH-12-AB-1234' },
    update: {},
    create: {
      vehicleNumber: 'MH-12-AB-1234',
      vehicleType: VehicleType.TRUCK,
      ownerName: 'Ramesh Patel',
      monthlyTax: 5000,
      insuranceNumber: 'INS-2024-001',
      insuranceStartDate: new Date('2024-01-01'),
      insuranceExpiry: new Date('2025-12-31'),
      permitDetails: 'National Permit',
      fitnessExpiry: new Date('2025-06-30'),
      pollutionExpiry: new Date('2025-03-31'),
      notes: 'Primary delivery truck',
    },
  })

  const vehicle2 = await prisma.vehicle.upsert({
    where: { vehicleNumber: 'MH-14-CD-5678' },
    update: {},
    create: {
      vehicleNumber: 'MH-14-CD-5678',
      vehicleType: VehicleType.CONTAINER,
      ownerName: 'Suresh Shah',
      monthlyTax: 7500,
      insuranceNumber: 'INS-2024-002',
      insuranceStartDate: new Date('2024-03-01'),
      insuranceExpiry: new Date('2026-05-15'),
      permitDetails: 'National Permit',
      fitnessExpiry: new Date('2025-09-30'),
      pollutionExpiry: new Date('2025-04-30'),
      notes: 'Container vehicle for long routes',
    },
  })

  const vehicle3 = await prisma.vehicle.upsert({
    where: { vehicleNumber: 'GJ-01-EF-9012' },
    update: {},
    create: {
      vehicleNumber: 'GJ-01-EF-9012',
      vehicleType: VehicleType.MINI_TRUCK,
      ownerName: 'Mahesh Desai',
      monthlyTax: 3000,
      insuranceNumber: 'INS-2024-003',
      insuranceStartDate: new Date('2024-06-01'),
      insuranceExpiry: new Date('2025-05-31'),
      permitDetails: 'State Permit',
      fitnessExpiry: new Date('2026-02-28'),
      pollutionExpiry: new Date('2025-06-30'),
      notes: 'Mini truck for short distances',
    },
  })

  // Drivers
  const driver1 = await prisma.driver.upsert({
    where: { id: 'driver-1' },
    update: {},
    create: {
      id: 'driver-1',
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      address: '45 Driver Colony, Mumbai',
      licenseNumber: 'MH-DL-2019-0001',
      licenseExpiry: new Date('2026-08-15'),
      salary: 25000,
      advanceBalance: 5000,
      joiningDate: new Date('2020-01-15'),
      status: DriverStatus.ACTIVE,
      vehicleId: vehicle1.id,
      notes: 'Experienced long-route driver',
    },
  })

  const driver2 = await prisma.driver.upsert({
    where: { id: 'driver-2' },
    update: {},
    create: {
      id: 'driver-2',
      name: 'Sunil Sharma',
      mobile: '9765432109',
      address: '12 New Colony, Pune',
      licenseNumber: 'MH-DL-2020-0002',
      licenseExpiry: new Date('2025-04-20'),
      salary: 22000,
      advanceBalance: 0,
      joiningDate: new Date('2021-03-01'),
      status: DriverStatus.ACTIVE,
      vehicleId: vehicle2.id,
      notes: 'Container specialist',
    },
  })

  const driver3 = await prisma.driver.upsert({
    where: { id: 'driver-3' },
    update: {},
    create: {
      id: 'driver-3',
      name: 'Amit Verma',
      mobile: '9654321098',
      address: '78 Transport Nagar, Ahmedabad',
      licenseNumber: 'GJ-DL-2021-0003',
      licenseExpiry: new Date('2027-11-30'),
      salary: 20000,
      advanceBalance: 2000,
      joiningDate: new Date('2022-06-10'),
      status: DriverStatus.ACTIVE,
      vehicleId: vehicle3.id,
      notes: 'Local city routes',
    },
  })

  // Parties
  const party1 = await prisma.party.upsert({
    where: { id: 'party-1' },
    update: {},
    create: {
      id: 'party-1',
      partyName: 'Sharma Enterprises',
      contactPerson: 'Vikram Sharma',
      mobile: '9812345678',
      address: '100 Industrial Area, Mumbai',
      gstNumber: '27AABCS1429B1ZB',
      billingAddress: '100 Industrial Area, Mumbai 400093',
      paymentTerms: 'Net 30 days',
      notes: 'Regular client for Mumbai-Delhi route',
    },
  })

  const party2 = await prisma.party.upsert({
    where: { id: 'party-2' },
    update: {},
    create: {
      id: 'party-2',
      partyName: 'Gujarat Traders',
      contactPerson: 'Anand Patel',
      mobile: '9723456789',
      address: '55 Commerce Street, Ahmedabad',
      gstNumber: '24AABCG1234B1ZC',
      billingAddress: '55 Commerce Street, Ahmedabad 380001',
      paymentTerms: 'Net 15 days',
      notes: 'Regular client for Gujarat routes',
    },
  })

  const party3 = await prisma.party.upsert({
    where: { id: 'party-3' },
    update: {},
    create: {
      id: 'party-3',
      partyName: 'Pune Steel Works',
      contactPerson: 'Sanjay Mehta',
      mobile: '9634567890',
      address: '200 Industrial Zone, Pune',
      gstNumber: '27AABCP5678B1ZD',
      billingAddress: '200 Industrial Zone, Pune 411001',
      paymentTerms: 'Immediate',
      notes: 'Steel and heavy goods transport',
    },
  })

  // Trips
  const trips = [
    {
      tripDate: new Date('2026-03-01'),
      place: 'Mumbai to Delhi',
      partyId: party1.id,
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      ratePerKm: 45,
      startingKm: 10000,
      endingKm: 11400,
      totalKm: 1400,
      dieselAmount: 18000,
      tollTax: 2500,
      borderTax: 500,
      driverWages: 3500,
      miscExpense: 500,
      tripAmount: 63000,
      finalBill: 63000,
      paymentStatus: PaymentStatus.PAID,
      paidAmount: 63000,
      remarks: 'Delivered on time',
    },
    {
      tripDate: new Date('2026-03-05'),
      place: 'Mumbai to Ahmedabad',
      partyId: party2.id,
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      ratePerKm: 40,
      startingKm: 25000,
      endingKm: 25550,
      totalKm: 550,
      dieselAmount: 7000,
      tollTax: 800,
      borderTax: 0,
      driverWages: 1500,
      miscExpense: 200,
      tripAmount: 22000,
      finalBill: 22000,
      paymentStatus: PaymentStatus.PARTIAL,
      paidAmount: 12000,
      remarks: 'Partial payment received',
    },
    {
      tripDate: new Date('2026-03-10'),
      place: 'Mumbai to Pune',
      partyId: party3.id,
      vehicleId: vehicle3.id,
      driverId: driver3.id,
      ratePerKm: 35,
      startingKm: 5000,
      endingKm: 5150,
      totalKm: 150,
      dieselAmount: 1800,
      tollTax: 300,
      borderTax: 0,
      driverWages: 800,
      miscExpense: 100,
      tripAmount: 5250,
      finalBill: 5250,
      paymentStatus: PaymentStatus.PAID,
      paidAmount: 5250,
      remarks: 'Regular run',
    },
    {
      tripDate: new Date('2026-03-15'),
      place: 'Delhi to Mumbai',
      partyId: party1.id,
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      ratePerKm: 45,
      startingKm: 11400,
      endingKm: 12800,
      totalKm: 1400,
      dieselAmount: 18500,
      tollTax: 2500,
      borderTax: 500,
      driverWages: 3500,
      miscExpense: 600,
      tripAmount: 63000,
      finalBill: 63000,
      paymentStatus: PaymentStatus.PENDING,
      paidAmount: 0,
      remarks: 'Return trip',
    },
    {
      tripDate: new Date('2026-03-18'),
      place: 'Ahmedabad to Mumbai',
      partyId: party2.id,
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      ratePerKm: 40,
      startingKm: 25550,
      endingKm: 26100,
      totalKm: 550,
      dieselAmount: 7200,
      tollTax: 800,
      borderTax: 0,
      driverWages: 1500,
      miscExpense: 300,
      tripAmount: 22000,
      finalBill: 22000,
      paymentStatus: PaymentStatus.PENDING,
      paidAmount: 0,
      remarks: 'Return load',
    },
    {
      tripDate: new Date('2026-03-20'),
      place: 'Mumbai to Surat',
      partyId: party2.id,
      vehicleId: vehicle3.id,
      driverId: driver3.id,
      ratePerKm: 38,
      startingKm: 5150,
      endingKm: 5430,
      totalKm: 280,
      dieselAmount: 3500,
      tollTax: 450,
      borderTax: 0,
      driverWages: 1000,
      miscExpense: 200,
      tripAmount: 10640,
      finalBill: 10640,
      paymentStatus: PaymentStatus.PAID,
      paidAmount: 10640,
      remarks: '',
    },
    {
      tripDate: new Date('2026-03-22'),
      place: 'Pune to Delhi',
      partyId: party3.id,
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      ratePerKm: 45,
      startingKm: 12800,
      endingKm: 14300,
      totalKm: 1500,
      dieselAmount: 19500,
      tollTax: 2800,
      borderTax: 600,
      driverWages: 4000,
      miscExpense: 700,
      tripAmount: 67500,
      finalBill: 67500,
      paymentStatus: PaymentStatus.PARTIAL,
      paidAmount: 40000,
      remarks: 'Steel coils delivery',
    },
    {
      tripDate: new Date('2026-03-25'),
      place: 'Mumbai to Nagpur',
      partyId: party1.id,
      vehicleId: vehicle2.id,
      driverId: driver2.id,
      ratePerKm: 42,
      startingKm: 26100,
      endingKm: 26900,
      totalKm: 800,
      dieselAmount: 10000,
      tollTax: 1200,
      borderTax: 0,
      driverWages: 2000,
      miscExpense: 400,
      tripAmount: 33600,
      finalBill: 33600,
      paymentStatus: PaymentStatus.PENDING,
      paidAmount: 0,
      remarks: '',
    },
    {
      tripDate: new Date('2026-04-01'),
      place: 'Mumbai to Kolhapur',
      partyId: party3.id,
      vehicleId: vehicle3.id,
      driverId: driver3.id,
      ratePerKm: 36,
      startingKm: 5430,
      endingKm: 5640,
      totalKm: 210,
      dieselAmount: 2600,
      tollTax: 350,
      borderTax: 0,
      driverWages: 900,
      miscExpense: 150,
      tripAmount: 7560,
      finalBill: 7560,
      paymentStatus: PaymentStatus.PAID,
      paidAmount: 7560,
      remarks: 'Regular client',
    },
    {
      tripDate: new Date('2026-04-03'),
      place: 'Delhi to Jaipur',
      partyId: party1.id,
      vehicleId: vehicle1.id,
      driverId: driver1.id,
      ratePerKm: 44,
      startingKm: 14300,
      endingKm: 14600,
      totalKm: 300,
      dieselAmount: 3900,
      tollTax: 500,
      borderTax: 100,
      driverWages: 1200,
      miscExpense: 200,
      tripAmount: 13200,
      finalBill: 13200,
      paymentStatus: PaymentStatus.PENDING,
      paidAmount: 0,
      remarks: '',
    },
  ]

  for (const trip of trips) {
    await prisma.trip.create({ data: trip })
  }

  console.log('Seed complete!')
  console.log('Admin credentials: admin@transport.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
