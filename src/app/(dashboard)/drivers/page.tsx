import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Users, Edit, Eye } from 'lucide-react'
import { formatDate, formatCurrency, getExpiryStatus } from '@/lib/utils'

async function getDrivers() {
  try {
    return await prisma.driver.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignedVehicle: { select: { vehicleNumber: true } },
        _count: { select: { trips: true } }
      }
    })
  } catch {
    return []
  }
}

export default async function DriversPage() {
  const drivers = await getDrivers()

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drivers</h1>
          <p className="text-sm text-muted-foreground">{drivers.length} drivers registered</p>
        </div>
        <Button asChild>
          <Link href="/drivers/new"><Plus className="h-4 w-4 mr-1" />Add Driver</Link>
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Mobile</th>
              <th className="text-left px-4 py-3 font-medium">Vehicle</th>
              <th className="text-left px-4 py-3 font-medium">Salary</th>
              <th className="text-left px-4 py-3 font-medium">License Expiry</th>
              <th className="text-left px-4 py-3 font-medium">Trips</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => {
              const licenseStatus = getExpiryStatus(d.licenseExpiry)
              return (
                <tr key={d.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3">{d.mobile}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.assignedVehicle?.vehicleNumber || '-'}</td>
                  <td className="px-4 py-3">{formatCurrency(d.salary)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${licenseStatus === 'expired' ? 'text-red-600' : licenseStatus === 'expiring' ? 'text-orange-600' : ''}`}>
                      {d.licenseExpiry ? formatDate(d.licenseExpiry) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{d._count.trips}</td>
                  <td className="px-4 py-3">
                    <Badge variant={d.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">{d.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href={`/drivers/${d.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href={`/drivers/${d.id}/edit`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {drivers.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No drivers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {drivers.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{d.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{d.mobile}</p>
                </div>
                <Badge variant={d.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                  {d.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                <span>Vehicle: {d.assignedVehicle?.vehicleNumber || 'None'}</span>
                <span>Trips: {d._count.trips}</span>
                <span>Salary: {formatCurrency(d.salary)}</span>
                <span>Advance: {formatCurrency(d.advanceBalance)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/drivers/${d.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href={`/drivers/${d.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {drivers.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No drivers yet</p>
        )}
      </div>
    </div>
  )
}
