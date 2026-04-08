import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { InvoiceClient } from './invoice-client'

async function getData(id: string) {
  try {
    const [trip, settings] = await Promise.all([
      prisma.trip.findUnique({
        where: { id },
        include: { party: true, vehicle: true, driver: true },
      }),
      prisma.appSetting.findUnique({ where: { id: 'default' } }),
    ])
    return { trip, settings }
  } catch { return { trip: null, settings: null } }
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { trip, settings } = await getData(id)
  if (!trip) notFound()

  const invoicePrefix = settings?.invoicePrefix ?? 'INV'
  const invoiceNumber = `${invoicePrefix}-${String(trip.createdAt.getFullYear()).slice(2)}${String(trip.createdAt.getMonth() + 1).padStart(2, '0')}-${id.slice(-4).toUpperCase()}`

  // Pass only primitive-safe data to the client component (no Date objects)
  const tripData = {
    id: trip.id,
    tripDate: trip.tripDate.toISOString(),
    place: trip.place,
    ratePerKm: trip.ratePerKm,
    startingKm: trip.startingKm,
    endingKm: trip.endingKm,
    totalKm: trip.totalKm,
    dieselAmount: trip.dieselAmount,
    tollTax: trip.tollTax,
    borderTax: trip.borderTax,
    driverWages: trip.driverWages,
    miscExpense: trip.miscExpense,
    tripAmount: trip.tripAmount,
    finalBill: trip.finalBill,
    paymentStatus: trip.paymentStatus,
    paidAmount: trip.paidAmount,
    remarks: trip.remarks,
    party: {
      partyName: trip.party.partyName,
      billingAddress: trip.party.billingAddress,
      gstNumber: trip.party.gstNumber,
      mobile: trip.party.mobile,
    },
    vehicle: {
      vehicleNumber: trip.vehicle.vehicleNumber,
      vehicleType: trip.vehicle.vehicleType,
    },
    driver: {
      name: trip.driver.name,
      mobile: trip.driver.mobile,
    },
  }

  return (
    <InvoiceClient
      trip={tripData}
      companyName={settings?.companyName ?? 'Transport Company'}
      companyAddress={settings?.companyAddress ?? ''}
      companyGst={settings?.companyGstNumber ?? ''}
      invoiceFooter={settings?.invoiceFooter ?? 'Thank you for your business!'}
      currencySymbol={settings?.currencySymbol ?? '₹'}
      enableGst={settings?.enableGst ?? false}
      cgstPct={settings?.cgstPercentage ?? 9}
      sgstPct={settings?.sgstPercentage ?? 9}
      igstPct={settings?.igstPercentage ?? 18}
      defaultGstType={settings?.defaultGstType ?? 'CGST_SGST'}
      invoiceNumber={invoiceNumber}
      hasLogo={true}
    />
  )
}
