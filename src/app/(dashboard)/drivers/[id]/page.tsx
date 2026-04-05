import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency, getExpiryStatus } from '@/lib/utils'
import { Edit, ArrowLeft } from 'lucide-react'
import { DeleteDriverButton } from './delete-button'

async function getDriver(id: string) {
  try {
    return await prisma.driver.findUnique({
      where: { id },
      include: {
        assignedVehicle: { select: { vehicleNumber: true, id: true } },
        trips: {
          take: 5,
          orderBy: { tripDate: 'desc' },
          include: { party: true, vehicle: true }
        },
        _count: { select: { trips: true } }
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

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const driver = await getDriver(id)
  if (!driver) notFound()

  const licenseStatus = getExpiryStatus(driver.licenseExpiry)

  return (
    <div className="p-4 md:p-6 max-w-4xl space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/drivers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{driver.name}</h1>
          <p className="text-sm text-muted-foreground">{driver.mobile}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/drivers/${id}/edit`}><Edit className="h-4 w-4 mr-1" />Edit</Link>
        </Button>
        <DeleteDriverButton id={id} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Info</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Field label="Name" value={driver.name} />
            <Field label="Mobile" value={driver.mobile} />
            <Field label="Address" value={driver.address} />
            <Field label="Joining Date" value={driver.joiningDate ? formatDate(driver.joiningDate) : '-'} />
            <Field label="Status" value={<Badge variant={driver.status === 'ACTIVE' ? 'default' : 'secondary'}>{driver.status}</Badge>} />
            <Field label="Total Trips" value={driver._count.trips} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">License & Salary</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Field label="License Number" value={driver.licenseNumber} />
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">License Expiry</p>
              <p className={`text-sm font-medium ${licenseStatus === 'expired' ? 'text-red-600' : licenseStatus === 'expiring' ? 'text-orange-600' : ''}`}>
                {driver.licenseExpiry ? formatDate(driver.licenseExpiry) : '-'}
              </p>
            </div>
            <Field label="Monthly Salary" value={formatCurrency(driver.salary)} />
            <Field label="Advance Balance" value={formatCurrency(driver.advanceBalance)} />
            <Field label="Assigned Vehicle" value={driver.assignedVehicle ? (
              <Link href={`/vehicles/${driver.assignedVehicle.id}`} className="text-blue-600 hover:underline">
                {driver.assignedVehicle.vehicleNumber}
              </Link>
            ) : '-'} />
          </CardContent>
        </Card>
      </div>

      {driver.notes && (
        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{driver.notes}</p></CardContent>
        </Card>
      )}

      {driver.trips.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent Trips</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/trips?driverId=${id}`}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Route</th>
                  <th className="text-left px-4 py-2 font-medium">Vehicle</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {driver.trips.map(t => (
                  <tr key={t.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-2">{formatDate(t.tripDate)}</td>
                    <td className="px-4 py-2"><Link href={`/trips/${t.id}`} className="hover:underline">{t.place}</Link></td>
                    <td className="px-4 py-2 text-muted-foreground">{t.vehicle.vehicleNumber}</td>
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
