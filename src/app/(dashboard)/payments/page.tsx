export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { RecordPaymentButton } from './record-payment-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getData() {
  try {
    const [trips, parties] = await Promise.all([
      prisma.trip.findMany({
        where: { paymentStatus: { not: 'PAID' } },
        orderBy: { tripDate: 'desc' },
        include: { party: true, vehicle: true, driver: true }
      }),
      prisma.party.findMany({ select: { id: true, partyName: true } }),
    ])

    // Party-wise summary
    const partyMap: Record<string, { partyName: string; partyId: string; totalBill: number; totalPaid: number; pendingTrips: number }> = {}
    trips.forEach(t => {
      if (!partyMap[t.partyId]) {
        partyMap[t.partyId] = { partyName: t.party.partyName, partyId: t.partyId, totalBill: 0, totalPaid: 0, pendingTrips: 0 }
      }
      partyMap[t.partyId].totalBill += t.finalBill
      partyMap[t.partyId].totalPaid += t.paidAmount
      partyMap[t.partyId].pendingTrips += 1
    })

    return { trips, parties, partySummary: Object.values(partyMap) }
  } catch { return { trips: [], parties: [], partySummary: [] } }
}

export default async function PaymentsPage() {
  const { trips, parties, partySummary } = await getData()
  const totalPending = trips.reduce((s, t) => s + (t.finalBill - t.paidAmount), 0)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-muted-foreground">Total Pending: {formatCurrency(totalPending)}</p>
        </div>
      </div>

      {/* Party Summary */}
      <Card>
        <CardHeader><CardTitle className="text-base">Party-wise Pending Summary</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Party</th>
                  <th className="text-right px-4 py-3 font-medium">Total Bill</th>
                  <th className="text-right px-4 py-3 font-medium">Paid</th>
                  <th className="text-right px-4 py-3 font-medium">Pending</th>
                  <th className="text-center px-4 py-3 font-medium">Trips</th>
                </tr>
              </thead>
              <tbody>
                {partySummary.map((p) => (
                  <tr key={p.partyId} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/parties/${p.partyId}`} className="hover:underline">{p.partyName}</Link>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(p.totalBill)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(p.totalPaid)}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(p.totalBill - p.totalPaid)}</td>
                    <td className="px-4 py-3 text-center">{p.pendingTrips}</td>
                  </tr>
                ))}
                {partySummary.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-green-600 font-medium">All payments are cleared!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Trips */}
      <Card>
        <CardHeader><CardTitle className="text-base">Pending / Partial Trips</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Route</th>
                  <th className="text-left px-4 py-3 font-medium">Party</th>
                  <th className="text-right px-4 py-3 font-medium">Bill</th>
                  <th className="text-right px-4 py-3 font-medium">Paid</th>
                  <th className="text-right px-4 py-3 font-medium">Pending</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-center px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">{formatDate(t.tripDate)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/trips/${t.id}`} className="hover:underline font-medium">{t.place}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.party.partyName}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(t.finalBill)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(t.paidAmount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(t.finalBill - t.paidAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={t.paymentStatus === 'PARTIAL' ? 'secondary' : 'destructive'} className="text-xs">
                        {t.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <RecordPaymentButton
                        tripId={t.id}
                        partyId={t.partyId}
                        partyName={t.party.partyName}
                        pending={t.finalBill - t.paidAmount}
                      />
                    </td>
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-green-600 font-medium">All payments cleared!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
