import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

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

export default async function ExpenseReportPage() {
  const trips = await getTrips()

  const totals = trips.reduce((acc, t) => ({
    diesel: acc.diesel + t.dieselAmount,
    toll: acc.toll + t.tollTax,
    border: acc.border + t.borderTax,
    wages: acc.wages + t.driverWages,
    misc: acc.misc + t.miscExpense,
    total: acc.total + t.dieselAmount + t.tollTax + t.borderTax + t.driverWages + t.miscExpense,
  }), { diesel: 0, toll: 0, border: 0, wages: 0, misc: 0, total: 0 })

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Expense Report</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Diesel', value: totals.diesel, color: 'text-blue-600' },
          { label: 'Toll Tax', value: totals.toll, color: 'text-purple-600' },
          { label: 'Border Tax', value: totals.border, color: 'text-orange-600' },
          { label: 'Driver Wages', value: totals.wages, color: 'text-teal-600' },
          { label: 'Misc', value: totals.misc, color: 'text-gray-600' },
          { label: 'Total', value: totals.total, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
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
                <th className="text-left px-3 py-3 font-medium">Vehicle</th>
                <th className="text-right px-3 py-3 font-medium">Diesel</th>
                <th className="text-right px-3 py-3 font-medium">Toll</th>
                <th className="text-right px-3 py-3 font-medium">Border</th>
                <th className="text-right px-3 py-3 font-medium">Wages</th>
                <th className="text-right px-3 py-3 font-medium">Misc</th>
                <th className="text-right px-3 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(t => {
                const exp = t.dieselAmount + t.tollTax + t.borderTax + t.driverWages + t.miscExpense
                return (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2">{formatDate(t.tripDate)}</td>
                    <td className="px-3 py-2">
                      <Link href={`/trips/${t.id}`} className="hover:underline">{t.place}</Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{t.vehicle.vehicleNumber}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(t.dieselAmount)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(t.tollTax)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(t.borderTax)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(t.driverWages)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(t.miscExpense)}</td>
                    <td className="px-3 py-2 text-right font-medium text-red-600">{formatCurrency(exp)}</td>
                  </tr>
                )
              })}
            </tbody>
            {trips.length > 0 && (
              <tfoot className="bg-muted/50 font-semibold">
                <tr>
                  <td colSpan={3} className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals.diesel)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals.toll)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals.border)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals.wages)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals.misc)}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(totals.total)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
