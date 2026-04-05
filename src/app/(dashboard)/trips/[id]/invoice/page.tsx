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

  // Serialize dates to strings so they can be passed to the client component
  const serializedTrip = {
    ...trip,
    tripDate: trip.tripDate.toISOString(),
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
  }

  const invoicePrefix = settings?.invoicePrefix ?? 'INV'
  const invoiceNumber = `${invoicePrefix}-${String(trip.createdAt.getFullYear()).slice(2)}${String(trip.createdAt.getMonth() + 1).padStart(2, '0')}-${id.slice(-4).toUpperCase()}`

  return (
    <InvoiceClient
      trip={serializedTrip}
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
    />
  )
}
