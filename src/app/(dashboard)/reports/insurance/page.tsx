import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, getExpiryStatus } from '@/lib/utils'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

async function getReport() {
  try {
    const [vehicles, drivers] = await Promise.all([
      prisma.vehicle.findMany({ orderBy: { vehicleNumber: 'asc' } }),
      prisma.driver.findMany({ orderBy: { name: 'asc' } }),
    ])
    return { vehicles, drivers }
  } catch { return { vehicles: [], drivers: [] } }
}

function statusBadge(date: Date | null) {
  const status = getExpiryStatus(date)
  if (status === 'none') return <Badge variant="secondary">N/A</Badge>
  if (status === 'expired') return <Badge variant="destructive">EXPIRED</Badge>
  if (status === 'expiring') return <Badge className="bg-orange-500">Expiring Soon</Badge>
  return <Badge variant="default">Valid</Badge>
}

export default async function InsuranceReportPage() {
  const { vehicles, drivers } = await getReport()

  const alerts = [
    ...vehicles.flatMap(v => [
      v.insuranceExpiry && (getExpiryStatus(v.insuranceExpiry) !== 'valid' && getExpiryStatus(v.insuranceExpiry) !== 'none')
        ? { type: 'Insurance', entity: v.vehicleNumber, date: v.insuranceExpiry, status: getExpiryStatus(v.insuranceExpiry) }
        : null,
      v.fitnessExpiry && (getExpiryStatus(v.fitnessExpiry) !== 'valid' && getExpiryStatus(v.fitnessExpiry) !== 'none')
        ? { type: 'Fitness', entity: v.vehicleNumber, date: v.fitnessExpiry, status: getExpiryStatus(v.fitnessExpiry) }
        : null,
      v.pollutionExpiry && (getExpiryStatus(v.pollutionExpiry) !== 'valid' && getExpiryStatus(v.pollutionExpiry) !== 'none')
        ? { type: 'Pollution', entity: v.vehicleNumber, date: v.pollutionExpiry, status: getExpiryStatus(v.pollutionExpiry) }
        : null,
    ].filter(Boolean)),
    ...drivers.map(d => d.licenseExpiry && (getExpiryStatus(d.licenseExpiry) !== 'valid' && getExpiryStatus(d.licenseExpiry) !== 'none')
      ? { type: 'License', entity: d.name, date: d.licenseExpiry, status: getExpiryStatus(d.licenseExpiry) }
      : null
    ).filter(Boolean)
  ]

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/reports"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Insurance & Document Expiry</h1>
      </div>

      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {alerts.length} Alert(s) Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {alerts.map((a, i) => a && (
                <div key={i} className={`text-xs p-2 rounded flex items-center gap-2 ${a.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {a.status === 'expired' ? 'EXPIRED' : 'Expiring Soon'}: {a.type} - {a.entity} ({a.date ? formatDate(a.date) : ''})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Vehicle Documents</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Vehicle</th>
                  <th className="text-left px-4 py-3 font-medium">Owner</th>
                  <th className="text-left px-4 py-3 font-medium">Insurance Expiry</th>
                  <th className="text-left px-4 py-3 font-medium">Fitness Expiry</th>
                  <th className="text-left px-4 py-3 font-medium">Pollution Expiry</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/vehicles/${v.id}`} className="font-medium hover:underline">{v.vehicleNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{v.ownerName}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {statusBadge(v.insuranceExpiry)}
                        {v.insuranceExpiry && <p className="text-xs text-muted-foreground">{formatDate(v.insuranceExpiry)}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {statusBadge(v.fitnessExpiry)}
                        {v.fitnessExpiry && <p className="text-xs text-muted-foreground">{formatDate(v.fitnessExpiry)}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {statusBadge(v.pollutionExpiry)}
                        {v.pollutionExpiry && <p className="text-xs text-muted-foreground">{formatDate(v.pollutionExpiry)}</p>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Driver Licenses</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Driver</th>
                <th className="text-left px-4 py-3 font-medium">License No.</th>
                <th className="text-left px-4 py-3 font-medium">Expiry Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/drivers/${d.id}`} className="font-medium hover:underline">{d.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.licenseNumber || '-'}</td>
                  <td className="px-4 py-3">{d.licenseExpiry ? formatDate(d.licenseExpiry) : '-'}</td>
                  <td className="px-4 py-3">{statusBadge(d.licenseExpiry)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
