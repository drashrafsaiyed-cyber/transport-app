export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ArrowLeft, Download } from 'lucide-react'

async function getTrips() {
  try {
    return await prisma.trip.findMany({
      orderBy: { tripDate: 'desc' },
      include: {
        party: { select: { partyName: true } },
        vehicle: { select: { vehicleNumber: true } },
        driver: { select: { name: true } },
      }
    })
  } catch { return [] }
}

export default async function TripReportPage() {
  const trips = await getTrips()
  const totalBill = trips.reduce((s, t) => s + t.finalBill, 0)
  const totalPaid = trips.reduce((s, t) => s + t.paidAmount, 0)
  const totalExpenses = trips.reduce((s, t) => s + t.dieselAmount + t.tollTax + t.borderTax + t.driverWages + t.miscExpense, 0)
  const totalKm = trips.reduce((s, t) => s + t.totalKm, 0)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Trip Report</h1>
          <p className="text-sm text-muted-foreground">{trips.length} trips</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/export/trips" target="_blank">
            <Download className="h-4 w-4 mr-1" />Export Excel
          </a>
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Billing', value: formatCurrency(totalBill), color: 'text-blue-600' },
          { label: 'Total Paid', value: formatCurrency(totalPaid), color: 'text-green-600' },
          { label: 'Total Pending', value: formatCurrency(totalBill - totalPaid), color: 'text-red-600' },
          { label: 'Total KM', value: `${totalKm.toFixed(0)} km`, color: 'text-orange-600' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-3 font-medium">Date</th>
                <th className="text-left px-3 py-3 font-medium">Route</th>
                <th className="text-left px-3 py-3 font-medium">Party</th>
                <th className="text-left px-3 py-3 font-medium">Vehicle</th>
                <th className="text-left px-3 py-3 font-medium">Driver</th>
                <th className="text-right px-3 py-3 font-medium">KM</th>
                <th className="text-right px-3 py-3 font-medium">Bill</th>
                <th className="text-right px-3 py-3 font-medium">Expenses</th>
                <th className="text-center px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => {
                const expenses = t.dieselAmount + t.tollTax + t.borderTax + t.driverWages + t.miscExpense
                return (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2">{formatDate(t.tripDate)}</td>
                    <td className="px-3 py-2">
                      <Link href={`/trips/${t.id}`} className="hover:underline">{t.place}</Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{t.party.partyName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.vehicle.vehicleNumber}</td>
                    <td className="px-3 py-2 text-muted-foreground">{t.driver.name}</td>
                    <td className="px-3 py-2 text-right">{t.totalKm.toFixed(0)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(t.finalBill)}</td>
                    <td className="px-3 py-2 text-right text-red-600">{formatCurrency(expenses)}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={t.paymentStatus === 'PAID' ? 'default' : t.paymentStatus === 'PARTIAL' ? 'secondary' : 'destructive'} className="text-xs">
                        {t.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {trips.length > 0 && (
              <tfoot className="bg-muted/50 font-semibold">
                <tr>
                  <td colSpan={5} className="px-3 py-2">Total ({trips.length} trips)</td>
                  <td className="px-3 py-2 text-right">{totalKm.toFixed(0)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totalBill)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totalExpenses)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
