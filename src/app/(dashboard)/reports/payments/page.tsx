import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

async function getReport() {
  try {
    return await prisma.trip.findMany({
      where: { paymentStatus: { not: 'PAID' } },
      orderBy: [{ party: { partyName: 'asc' } }, { tripDate: 'asc' }],
      include: {
        party: { select: { partyName: true } },
        vehicle: { select: { vehicleNumber: true } },
      }
    })
  } catch { return [] }
}

export default async function PendingPaymentsReportPage() {
  const trips = await getReport()
  const total = trips.reduce((s, t) => s + (t.finalBill - t.paidAmount), 0)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Pending Payment Report</h1>
          <p className="text-sm font-medium text-red-600">Total Outstanding: {formatCurrency(total)}</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Route</th>
                <th className="text-left px-4 py-3 font-medium">Party</th>
                <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                <th className="text-right px-4 py-3 font-medium">Bill</th>
                <th className="text-right px-4 py-3 font-medium">Paid</th>
                <th className="text-right px-4 py-3 font-medium">Pending</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(t => (
                <tr key={t.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2">{formatDate(t.tripDate)}</td>
                  <td className="px-4 py-2">
                    <Link href={`/trips/${t.id}`} className="hover:underline">{t.place}</Link>
                  </td>
                  <td className="px-4 py-2">{t.party.partyName}</td>
                  <td className="px-4 py-2 text-muted-foreground">{t.vehicle.vehicleNumber}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(t.finalBill)}</td>
                  <td className="px-4 py-2 text-right text-green-600">{formatCurrency(t.paidAmount)}</td>
                  <td className="px-4 py-2 text-right font-bold text-red-600">{formatCurrency(t.finalBill - t.paidAmount)}</td>
                  <td className="px-4 py-2 text-center">
                    <Badge variant={t.paymentStatus === 'PARTIAL' ? 'secondary' : 'destructive'} className="text-xs">
                      {t.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-green-600">All payments cleared!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
