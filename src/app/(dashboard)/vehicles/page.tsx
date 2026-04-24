export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Truck, Edit, Eye } from 'lucide-react'
import { formatDate, formatCurrency, getExpiryStatus } from '@/lib/utils'

async function getVehicles() {
  try {
    return await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { trips: true } } }
    })
  } catch {
    return []
  }
}

function ExpiryBadge({ date }: { date: Date | null }) {
  if (!date) return <span className="text-muted-foreground text-xs">-</span>
  const status = getExpiryStatus(date)
  return (
    <span className={`text-xs font-medium ${status === 'expired' ? 'text-red-600' : status === 'expiring' ? 'text-orange-600' : 'text-green-600'}`}>
      {formatDate(date)}
    </span>
  )
}

export default async function VehiclesPage() {
  const vehicles = await getVehicles()

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <p className="text-sm text-muted-foreground">{vehicles.length} vehicles registered</p>
        </div>
        <Button asChild>
          <Link href="/vehicles/new"><Plus className="h-4 w-4 mr-1" />Add Vehicle</Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Vehicle No.</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Owner</th>
              <th className="text-left px-4 py-3 font-medium">Tax/Month</th>
              <th className="text-left px-4 py-3 font-medium">Insurance Expiry</th>
              <th className="text-left px-4 py-3 font-medium">Fitness Expiry</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{v.vehicleNumber}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="text-xs">{v.vehicleType.replace('_', ' ')}</Badge>
                </td>
                <td className="px-4 py-3">{v.ownerName}</td>
                <td className="px-4 py-3">{formatCurrency(v.monthlyTax)}</td>
                <td className="px-4 py-3"><ExpiryBadge date={v.insuranceExpiry} /></td>
                <td className="px-4 py-3"><ExpiryBadge date={v.fitnessExpiry} /></td>
                <td className="px-4 py-3">
                  <Badge variant={v.isActive ? 'default' : 'secondary'} className="text-xs">
                    {v.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link href={`/vehicles/${v.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link href={`/vehicles/${v.id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No vehicles yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {vehicles.map((v) => (
          <Card key={v.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{v.vehicleNumber}</span>
                    <Badge variant="secondary" className="text-xs">{v.vehicleType.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{v.ownerName}</p>
                </div>
                <Badge variant={v.isActive ? 'default' : 'secondary'} className="text-xs shrink-0">
                  {v.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                <span>Tax: {formatCurrency(v.monthlyTax)}/mo</span>
                <span>Trips: {v._count.trips}</span>
                <span>Insurance: <ExpiryBadge date={v.insuranceExpiry} /></span>
                <span>Fitness: <ExpiryBadge date={v.fitnessExpiry} /></span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/vehicles/${v.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/vehicles/${v.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {vehicles.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No vehicles yet</p>
        )}
      </div>
    </div>
  )
}
