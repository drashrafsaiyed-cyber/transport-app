import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, getExpiryStatus } from '@/lib/utils'
import { ArrowLeft, Download } from 'lucide-react'

async function getReport() {
  try {
    return await prisma.vehicle.findMany({
      include: {
        trips: { select: { finalBill: true, totalKm: true, dieselAmount: true, tollTax: true, borderTax: true, driverWages: true, miscExpense: true } }
      },
      orderBy: { vehicleNumber: 'asc' }
    })
  } catch { return [] }
}

export default async function VehicleReportPage() {
  const vehicles = await getReport()

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Vehicle Report</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/export/vehicles" target="_blank">
            <Download className="h-4 w-4 mr-1" />Export
          </a>
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Owner</th>
                <th className="text-right px-4 py-3 font-medium">Trips</th>
                <th className="text-right px-4 py-3 font-medium">Total KM</th>
                <th className="text-right px-4 py-3 font-medium">Revenue</th>
                <th className="text-right px-4 py-3 font-medium">Expenses</th>
                <th className="text-right px-4 py-3 font-medium">Profit</th>
                <th className="text-left px-4 py-3 font-medium">Ins. Expiry</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => {
                const revenue = v.trips.reduce((s, t) => s + t.finalBill, 0)
                const expenses = v.trips.reduce((s, t) => s + t.dieselAmount + t.tollTax + t.borderTax + t.driverWages + t.miscExpense, 0)
                const km = v.trips.reduce((s, t) => s + t.totalKm, 0)
                const insStatus = getExpiryStatus(v.insuranceExpiry)
                return (
                  <tr key={v.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/vehicles/${v.id}`} className="font-medium hover:underline">{v.vehicleNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{v.vehicleType.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-muted-foreground">{v.ownerName}</td>
                    <td className="px-4 py-3 text-right">{v.trips.length}</td>
                    <td className="px-4 py-3 text-right">{km.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(revenue)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatCurrency(expenses)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${revenue - expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(revenue - expenses)}
                    </td>
                    <td className={`px-4 py-3 text-sm ${insStatus === 'expired' ? 'text-red-600' : insStatus === 'expiring' ? 'text-orange-600' : ''}`}>
                      {v.insuranceExpiry ? formatDate(v.insuranceExpiry) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
