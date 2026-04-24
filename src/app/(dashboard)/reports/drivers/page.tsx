export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, getExpiryStatus } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

async function getReport() {
  try {
    return await prisma.driver.findMany({
      include: {
        trips: { select: { finalBill: true, totalKm: true } },
        assignedVehicle: { select: { vehicleNumber: true } }
      },
      orderBy: { name: 'asc' }
    })
  } catch { return [] }
}

export default async function DriverReportPage() {
  const drivers = await getReport()

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Driver Report</h1>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Driver</th>
                <th className="text-left px-4 py-3 font-medium">Mobile</th>
                <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                <th className="text-right px-4 py-3 font-medium">Trips</th>
                <th className="text-right px-4 py-3 font-medium">Total KM</th>
                <th className="text-right px-4 py-3 font-medium">Revenue Gen.</th>
                <th className="text-right px-4 py-3 font-medium">Salary</th>
                <th className="text-right px-4 py-3 font-medium">Advance</th>
                <th className="text-left px-4 py-3 font-medium">License Expiry</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => {
                const revenue = d.trips.reduce((s, t) => s + t.finalBill, 0)
                const km = d.trips.reduce((s, t) => s + t.totalKm, 0)
                const licStatus = getExpiryStatus(d.licenseExpiry)
                return (
                  <tr key={d.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/drivers/${d.id}`} className="font-medium hover:underline">{d.name}</Link>
                    </td>
                    <td className="px-4 py-3">{d.mobile}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.assignedVehicle?.vehicleNumber || '-'}</td>
                    <td className="px-4 py-3 text-right">{d.trips.length}</td>
                    <td className="px-4 py-3 text-right">{km.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(revenue)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(d.salary)}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(d.advanceBalance)}</td>
                    <td className={`px-4 py-3 text-sm ${licStatus === 'expired' ? 'text-red-600' : licStatus === 'expiring' ? 'text-orange-600' : ''}`}>
                      {d.licenseExpiry ? formatDate(d.licenseExpiry) : '-'}
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
