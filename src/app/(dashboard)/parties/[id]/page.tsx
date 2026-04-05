import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Edit, ArrowLeft } from 'lucide-react'
import { DeletePartyButton } from './delete-button'

async function getParty(id: string) {
  try {
    return await prisma.party.findUnique({
      where: { id },
      include: {
        trips: {
          orderBy: { tripDate: 'desc' },
          include: { vehicle: true, driver: true }
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 10
        }
      }
    })
  } catch { return null }
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  )
}

export default async function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const party = await getParty(id)
  if (!party) notFound()

  const totalBill = party.trips.reduce((s, t) => s + t.finalBill, 0)
  const totalPaid = party.trips.reduce((s, t) => s + t.paidAmount, 0)
  const pending = totalBill - totalPaid

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/parties"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{party.partyName}</h1>
          <p className="text-sm text-muted-foreground">{party.contactPerson} {party.mobile && `• ${party.mobile}`}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/parties/${id}/edit`}><Edit className="h-4 w-4 mr-1" />Edit</Link>
        </Button>
        <DeletePartyButton id={id} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Billing</p>
          <p className="text-xl font-bold">{formatCurrency(totalBill)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Total Paid</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className={`text-xl font-bold ${pending > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(pending)}</p>
        </CardContent></Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Party Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Field label="Party Name" value={party.partyName} />
            <Field label="Contact Person" value={party.contactPerson} />
            <Field label="Mobile" value={party.mobile} />
            <Field label="GST Number" value={party.gstNumber} />
            <Field label="Payment Terms" value={party.paymentTerms} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Field label="Address" value={party.address} />
            <Field label="Billing Address" value={party.billingAddress} />
            {party.notes && <Field label="Notes" value={party.notes} />}
          </CardContent>
        </Card>
      </div>

      {/* Trip History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Trip History ({party.trips.length})</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/trips/new?partyId=${id}`}>New Trip</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Route</th>
                  <th className="text-left px-4 py-2 font-medium">Vehicle</th>
                  <th className="text-right px-4 py-2 font-medium">Bill</th>
                  <th className="text-right px-4 py-2 font-medium">Paid</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {party.trips.map(t => (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-2">{formatDate(t.tripDate)}</td>
                    <td className="px-4 py-2"><Link href={`/trips/${t.id}`} className="hover:underline">{t.place}</Link></td>
                    <td className="px-4 py-2 text-muted-foreground">{t.vehicle.vehicleNumber}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(t.finalBill)}</td>
                    <td className="px-4 py-2 text-right text-green-600">{formatCurrency(t.paidAmount)}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge variant={t.paymentStatus === 'PAID' ? 'default' : t.paymentStatus === 'PARTIAL' ? 'secondary' : 'destructive'} className="text-xs">
                        {t.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {party.trips.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No trips yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {party.payments.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {party.payments.map(p => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-2">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-600">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
