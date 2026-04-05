import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/utils'
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

  const companyName = settings?.companyName ?? 'Transport Company'
  const companyAddress = settings?.companyAddress ?? ''
  const companyGst = settings?.companyGstNumber ?? ''
  const invoiceFooter = settings?.invoiceFooter ?? 'Thank you for your business!'
  const currencySymbol = settings?.currencySymbol ?? '₹'
  const enableGst = settings?.enableGst ?? false
  const cgstPct = settings?.cgstPercentage ?? 9
  const sgstPct = settings?.sgstPercentage ?? 9
  const igstPct = settings?.igstPercentage ?? 18
  const defaultGstType = settings?.defaultGstType ?? 'CGST_SGST'
  const invoicePrefix = settings?.invoicePrefix ?? 'INV'
  const invoiceNumber = `${invoicePrefix}-${String(trip.createdAt.getFullYear()).slice(2)}${String(trip.createdAt.getMonth() + 1).padStart(2, '0')}-${id.slice(-4).toUpperCase()}`

  return (
    <InvoiceClient
      trip={trip}
      companyName={companyName}
      companyAddress={companyAddress}
      companyGst={companyGst}
      invoiceFooter={invoiceFooter}
      currencySymbol={currencySymbol}
      enableGst={enableGst}
      cgstPct={cgstPct}
      sgstPct={sgstPct}
      igstPct={igstPct}
      defaultGstType={defaultGstType}
      invoiceNumber={invoiceNumber}
      formatDate={formatDate}
      formatCurrency={formatCurrency}
    />
  )
}
