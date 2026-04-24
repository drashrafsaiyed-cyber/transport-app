export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Building2, Edit, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

async function getParties() {
  try {
    const parties = await prisma.party.findMany({
      orderBy: { partyName: 'asc' },
      include: {
        trips: { select: { finalBill: true, paidAmount: true, paymentStatus: true } },
        _count: { select: { trips: true } }
      }
    })
    return parties.map(p => {
      const totalBill = p.trips.reduce((s, t) => s + t.finalBill, 0)
      const totalPaid = p.trips.reduce((s, t) => s + t.paidAmount, 0)
      return { ...p, totalBill, totalPaid, pending: totalBill - totalPaid }
    })
  } catch { return [] }
}

export default async function PartiesPage() {
  const parties = await getParties()

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Parties</h1>
          <p className="text-sm text-muted-foreground">{parties.length} parties</p>
        </div>
        <Button asChild>
          <Link href="/parties/new"><Plus className="h-4 w-4 mr-1" />Add Party</Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Party Name</th>
              <th className="text-left px-4 py-3 font-medium">Contact</th>
              <th className="text-left px-4 py-3 font-medium">Mobile</th>
              <th className="text-right px-4 py-3 font-medium">Total Billing</th>
              <th className="text-right px-4 py-3 font-medium">Total Paid</th>
              <th className="text-right px-4 py-3 font-medium">Pending</th>
              <th className="text-center px-4 py-3 font-medium">Trips</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((p) => (
              <tr key={p.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{p.partyName}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.contactPerson || '-'}</td>
                <td className="px-4 py-3">{p.mobile || '-'}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(p.totalBill)}</td>
                <td className="px-4 py-3 text-right text-green-600">{formatCurrency(p.totalPaid)}</td>
                <td className={`px-4 py-3 text-right font-medium ${p.pending > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(p.pending)}
                </td>
                <td className="px-4 py-3 text-center">{p._count.trips}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link href={`/parties/${p.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link href={`/parties/${p.id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {parties.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No parties yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {parties.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{p.partyName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{p.contactPerson} {p.mobile && `• ${p.mobile}`}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div>
                  <p className="text-muted-foreground">Billing</p>
                  <p className="font-medium">{formatCurrency(p.totalBill)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid</p>
                  <p className="font-medium text-green-600">{formatCurrency(p.totalPaid)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pending</p>
                  <p className={`font-medium ${p.pending > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(p.pending)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/parties/${p.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/parties/${p.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
