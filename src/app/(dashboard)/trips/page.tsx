import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Map, Edit, Eye } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

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

export default async function TripsPage() {
  const trips = await getTrips()

  const totalBill = trips.reduce((s, t) => s + t.finalBill, 0)
  const totalPaid = trips.reduce((s, t) => s + t.paidAmount, 0)
  const pending = totalBill - totalPaid

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trips</h1>
          <p className="text-sm text-muted-foreground">{trips.length} trips | Pending: {formatCurrency(pending)}</p>
        </div>
        <Button asChild>
          <Link href="/trips/new"><Plus className="h-4 w-4 mr-1" />New Trip</Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Route</th>
              <th className="text-left px-4 py-3 font-medium">Party</th>
              <th className="text-left px-4 py-3 font-medium">Vehicle</th>
              <th className="text-left px-4 py-3 font-medium">Driver</th>
              <th className="text-right px-4 py-3 font-medium">KM</th>
              <th className="text-right px-4 py-3 font-medium">Bill</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(t.tripDate)}</td>
                <td className="px-4 py-3 font-medium">{t.place}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.party.partyName}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.vehicle.vehicleNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.driver.name}</td>
                <td className="px-4 py-3 text-right">{t.totalKm.toFixed(0)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(t.finalBill)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={t.paymentStatus === 'PAID' ? 'default' : t.paymentStatus === 'PARTIAL' ? 'secondary' : 'destructive'} className="text-xs">
                    {t.paymentStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link href={`/trips/${t.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link href={`/trips/${t.id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {trips.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No trips yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {trips.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-sm">{t.place}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(t.tripDate)} • {t.party.partyName}</p>
                </div>
                <Badge variant={t.paymentStatus === 'PAID' ? 'default' : t.paymentStatus === 'PARTIAL' ? 'secondary' : 'destructive'} className="text-xs shrink-0">
                  {t.paymentStatus}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                <span>{t.vehicle.vehicleNumber}</span>
                <span>{t.totalKm} km</span>
                <span className="font-medium text-foreground">{formatCurrency(t.finalBill)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/trips/${t.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/trips/${t.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {trips.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No trips yet</p>
        )}
      </div>
    </div>
  )
}
