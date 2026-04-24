export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Download } from 'lucide-react'

async function getReport() {
  try {
    return await prisma.party.findMany({
      include: {
        trips: { select: { finalBill: true, paidAmount: true, totalKm: true } },
      },
      orderBy: { partyName: 'asc' }
    })
  } catch { return [] }
}

export default async function PartyReportPage() {
  const parties = await getReport()

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1"><h1 className="text-2xl font-bold">Party Report</h1></div>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/export/parties" target="_blank">
            <Download className="h-4 w-4 mr-1" />Export
          </a>
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Party</th>
                <th className="text-left px-4 py-3 font-medium">Contact</th>
                <th className="text-right px-4 py-3 font-medium">Trips</th>
                <th className="text-right px-4 py-3 font-medium">Total KM</th>
                <th className="text-right px-4 py-3 font-medium">Total Bill</th>
                <th className="text-right px-4 py-3 font-medium">Paid</th>
                <th className="text-right px-4 py-3 font-medium">Pending</th>
              </tr>
            </thead>
            <tbody>
              {parties.map(p => {
                const totalBill = p.trips.reduce((s, t) => s + t.finalBill, 0)
                const totalPaid = p.trips.reduce((s, t) => s + t.paidAmount, 0)
                const km = p.trips.reduce((s, t) => s + t.totalKm, 0)
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/parties/${p.id}`} className="font-medium hover:underline">{p.partyName}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.contactPerson || '-'}</td>
                    <td className="px-4 py-3 text-right">{p.trips.length}</td>
                    <td className="px-4 py-3 text-right">{km.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(totalBill)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(totalPaid)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${totalBill - totalPaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(totalBill - totalPaid)}
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
