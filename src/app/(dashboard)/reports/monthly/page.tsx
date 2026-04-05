import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

async function getReport() {
  try {
    const trips = await prisma.trip.findMany({
      select: {
        tripDate: true, finalBill: true, paidAmount: true,
        dieselAmount: true, tollTax: true, borderTax: true, driverWages: true, miscExpense: true, totalKm: true
      },
      orderBy: { tripDate: 'asc' }
    })

    const monthMap: Record<string, {
      month: string; trips: number; revenue: number; paid: number; pending: number;
      expenses: number; profit: number; km: number
    }> = {}

    trips.forEach(t => {
      const key = format(new Date(t.tripDate), 'yyyy-MM')
      const label = format(new Date(t.tripDate), 'MMMM yyyy')
      const expenses = t.dieselAmount + t.tollTax + t.borderTax + t.driverWages + t.miscExpense

      if (!monthMap[key]) {
        monthMap[key] = { month: label, trips: 0, revenue: 0, paid: 0, pending: 0, expenses: 0, profit: 0, km: 0 }
      }
      monthMap[key].trips += 1
      monthMap[key].revenue += t.finalBill
      monthMap[key].paid += t.paidAmount
      monthMap[key].pending += t.finalBill - t.paidAmount
      monthMap[key].expenses += expenses
      monthMap[key].profit += t.finalBill - expenses
      monthMap[key].km += t.totalKm
    })

    return Object.entries(monthMap).reverse().map(([, v]) => v)
  } catch { return [] }
}

export default async function MonthlyReportPage() {
  const data = await getReport()

  const grandTotal = data.reduce((acc, m) => ({
    trips: acc.trips + m.trips,
    revenue: acc.revenue + m.revenue,
    paid: acc.paid + m.paid,
    pending: acc.pending + m.pending,
    expenses: acc.expenses + m.expenses,
    profit: acc.profit + m.profit,
    km: acc.km + m.km,
  }), { trips: 0, revenue: 0, paid: 0, pending: 0, expenses: 0, profit: 0, km: 0 })

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Monthly Summary</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(grandTotal.revenue), color: 'text-blue-600' },
          { label: 'Total Expenses', value: formatCurrency(grandTotal.expenses), color: 'text-red-600' },
          { label: 'Net Profit', value: formatCurrency(grandTotal.profit), color: 'text-green-600' },
          { label: 'Total KM', value: `${grandTotal.km.toFixed(0)} km`, color: 'text-orange-600' },
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
                <th className="text-left px-4 py-3 font-medium">Month</th>
                <th className="text-right px-4 py-3 font-medium">Trips</th>
                <th className="text-right px-4 py-3 font-medium">KM</th>
                <th className="text-right px-4 py-3 font-medium">Revenue</th>
                <th className="text-right px-4 py-3 font-medium">Expenses</th>
                <th className="text-right px-4 py-3 font-medium">Profit</th>
                <th className="text-right px-4 py-3 font-medium">Paid</th>
                <th className="text-right px-4 py-3 font-medium">Pending</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{m.month}</td>
                  <td className="px-4 py-3 text-right">{m.trips}</td>
                  <td className="px-4 py-3 text-right">{m.km.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(m.revenue)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatCurrency(m.expenses)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${m.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(m.profit)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">{formatCurrency(m.paid)}</td>
                  <td className={`px-4 py-3 text-right ${m.pending > 0 ? 'text-red-600' : ''}`}>{formatCurrency(m.pending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
