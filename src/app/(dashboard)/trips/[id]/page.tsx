import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Edit, ArrowLeft, Printer } from 'lucide-react'
import { DeleteTripButton } from './delete-button'

async function getTrip(id: string) {
  try {
    return await prisma.trip.findUnique({
      where: { id },
      include: {
        party: true,
        vehicle: true,
        driver: true,
        payments: { orderBy: { paymentDate: 'desc' } }
      }
    })
  } catch { return null }
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 ${highlight ? 'font-semibold text-base border-t border-b bg-muted/30 px-1 rounded' : ''}`}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={`text-sm ${highlight ? 'font-bold' : ''}`}>{value}</span>
    </div>
  )
}

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = await getTrip(id)
  if (!trip) notFound()

  const totalExpenses = trip.dieselAmount + trip.tollTax + trip.borderTax + trip.driverWages + trip.miscExpense
  const profit = trip.finalBill - totalExpenses

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trips"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{trip.place}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(trip.tripDate)}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex">
          <Printer className="h-4 w-4 mr-1" />Print
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/trips/${id}/edit`}><Edit className="h-4 w-4 mr-1" />Edit</Link>
        </Button>
        <DeleteTripButton id={id} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Trip Info</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <Row label="Date" value={formatDate(trip.tripDate)} />
            <Row label="Route" value={trip.place} />
            <Row label="Party" value={trip.party.partyName} />
            <Row label="Vehicle" value={trip.vehicle.vehicleNumber} />
            <Row label="Driver" value={trip.driver.name} />
            {trip.remarks && <Row label="Remarks" value={trip.remarks} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">KM Details</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <Row label="Starting KM" value={trip.startingKm.toFixed(0)} />
            <Row label="Ending KM" value={trip.endingKm.toFixed(0)} />
            <Row label="Total KM" value={trip.totalKm.toFixed(0)} />
            <Row label="Rate per KM" value={formatCurrency(trip.ratePerKm)} />
            <Row label="Trip Amount" value={formatCurrency(trip.tripAmount)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Expenses</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <Row label="Diesel" value={formatCurrency(trip.dieselAmount)} />
            <Row label="Toll Tax" value={formatCurrency(trip.tollTax)} />
            <Row label="Border Tax" value={formatCurrency(trip.borderTax)} />
            <Row label="Driver Wages" value={formatCurrency(trip.driverWages)} />
            <Row label="Misc Expense" value={formatCurrency(trip.miscExpense)} />
            <Separator />
            <Row label="Total Expenses" value={formatCurrency(totalExpenses)} highlight />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment Summary</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            <Row label="Final Bill" value={formatCurrency(trip.finalBill)} />
            <Row label="Paid Amount" value={formatCurrency(trip.paidAmount)} />
            <Row label="Pending" value={formatCurrency(trip.finalBill - trip.paidAmount)} />
            <Separator />
            <Row label="Est. Profit" value={formatCurrency(profit)} highlight />
            <div className="pt-2 flex justify-center">
              <Badge variant={trip.paymentStatus === 'PAID' ? 'default' : trip.paymentStatus === 'PARTIAL' ? 'secondary' : 'destructive'} className="text-sm px-4 py-1">
                {trip.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {trip.payments.length > 0 && (
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
                {trip.payments.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-2 text-right text-green-600 font-medium">{formatCurrency(p.amount)}</td>
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
