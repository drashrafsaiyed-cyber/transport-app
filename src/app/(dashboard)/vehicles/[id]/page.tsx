import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency, getExpiryStatus } from '@/lib/utils'
import { Edit, ArrowLeft } from 'lucide-react'
import { DeleteVehicleButton } from './delete-button'

async function getVehicle(id: string) {
  try {
    return await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: {
          take: 5,
          orderBy: { tripDate: 'desc' },
          include: { party: true }
        },
        drivers: true,
        _count: { select: { trips: true } }
      }
    })
  } catch {
    return null
  }
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  )
}

function ExpiryField({ label, date }: { label: string; date: Date | null }) {
  const status = getExpiryStatus(date)
  const color = status === 'expired' ? 'text-red-600' : status === 'expiring' ? 'text-orange-600' : 'text-foreground'
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${color}`}>{date ? formatDate(date) : '-'}</p>
    </div>
  )
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicle(id)
  if (!vehicle) notFound()

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vehicles"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{vehicle.vehicleNumber}</h1>
          <p className="text-sm text-muted-foreground">{vehicle.ownerName}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/vehicles/${id}/edit`}><Edit className="h-4 w-4 mr-1" />Edit</Link>
        </Button>
        <DeleteVehicleButton id={id} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Field label="Vehicle Number" value={vehicle.vehicleNumber} />
            <Field label="Type" value={<Badge variant="secondary">{vehicle.vehicleType.replace('_', ' ')}</Badge>} />
            <Field label="Owner Name" value={vehicle.ownerName} />
            <Field label="Monthly Tax" value={formatCurrency(vehicle.monthlyTax)} />
            <Field label="Permit Details" value={vehicle.permitDetails} />
            <Field label="Status" value={<Badge variant={vehicle.isActive ? 'default' : 'secondary'}>{vehicle.isActive ? 'Active' : 'Inactive'}</Badge>} />
            <Field label="Total Trips" value={vehicle._count.trips} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Field label="Insurance Number" value={vehicle.insuranceNumber} />
            <Field label="Insurance Start" value={vehicle.insuranceStartDate ? formatDate(vehicle.insuranceStartDate) : '-'} />
            <ExpiryField label="Insurance Expiry" date={vehicle.insuranceExpiry} />
            <ExpiryField label="Fitness Expiry" date={vehicle.fitnessExpiry} />
            <ExpiryField label="Pollution Expiry" date={vehicle.pollutionExpiry} />
          </CardContent>
        </Card>
      </div>

      {vehicle.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{vehicle.notes}</p></CardContent>
        </Card>
      )}

      {vehicle.drivers.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Assigned Drivers</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {vehicle.drivers.map(d => (
                <Link key={d.id} href={`/drivers/${d.id}`}>
                  <Badge variant="outline">{d.name} - {d.mobile}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {vehicle.trips.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Trips</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/trips?vehicleId=${id}`}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Route</th>
                  <th className="text-left px-4 py-2 font-medium">Party</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {vehicle.trips.map(t => (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-2">{formatDate(t.tripDate)}</td>
                    <td className="px-4 py-2"><Link href={`/trips/${t.id}`} className="hover:underline">{t.place}</Link></td>
                    <td className="px-4 py-2 text-muted-foreground">{t.party.partyName}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(t.finalBill)}</td>
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
