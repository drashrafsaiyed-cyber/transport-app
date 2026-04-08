import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency, formatDate, isExpiringSoon, isExpired } from '@/lib/utils'
import {
  Truck, Users, Building2, Map, CreditCard, AlertTriangle, TrendingUp, DollarSign, Plus, CalendarDays
} from 'lucide-react'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { DashboardCharts } from './charts'

async function getDashboardData() {
  try {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const [
      totalVehicles, totalDrivers, totalParties,
      totalTrips, monthlyTrips, recentTrips, vehicles, allTrips, settings
    ] = await Promise.all([
      prisma.vehicle.count({ where: { isActive: true } }),
      prisma.driver.count({ where: { status: 'ACTIVE' } }),
      prisma.party.count(),
      prisma.trip.count(),
      prisma.trip.findMany({
        where: { tripDate: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.trip.findMany({
        take: 10,
        orderBy: { tripDate: 'desc' },
        include: { party: true, vehicle: true, driver: true },
      }),
      prisma.vehicle.findMany({
        select: { insuranceExpiry: true, fitnessExpiry: true, pollutionExpiry: true, vehicleNumber: true }
      }),
      prisma.trip.findMany({
        orderBy: { tripDate: 'asc' },
        select: { tripDate: true, finalBill: true, dieselAmount: true, tollTax: true, borderTax: true, driverWages: true, miscExpense: true }
      }),
      prisma.appSetting.findUnique({ where: { id: 'default' } }),
    ])

    const monthlyBilling = monthlyTrips.reduce((sum, t) => sum + t.finalBill, 0)
    const pendingPayments = monthlyTrips.filter(t => t.paymentStatus !== 'PAID').reduce((sum, t) => sum + (t.finalBill - t.paidAmount), 0)
    const monthlyExpenses = monthlyTrips.reduce((sum, t) => sum + t.dieselAmount + t.tollTax + t.borderTax + t.driverWages + t.miscExpense, 0)

    // Expiry alerts
    const alerts: Array<{ type: string; message: string; severity: 'warning' | 'error' }> = []
    vehicles.forEach(v => {
      if (v.insuranceExpiry) {
        if (isExpired(v.insuranceExpiry)) alerts.push({ type: 'insurance', message: `${v.vehicleNumber}: Insurance EXPIRED`, severity: 'error' })
        else if (isExpiringSoon(v.insuranceExpiry)) alerts.push({ type: 'insurance', message: `${v.vehicleNumber}: Insurance expiring soon`, severity: 'warning' })
      }
      if (v.fitnessExpiry) {
        if (isExpired(v.fitnessExpiry)) alerts.push({ type: 'fitness', message: `${v.vehicleNumber}: Fitness EXPIRED`, severity: 'error' })
        else if (isExpiringSoon(v.fitnessExpiry)) alerts.push({ type: 'fitness', message: `${v.vehicleNumber}: Fitness expiring soon`, severity: 'warning' })
      }
    })

    // Monthly chart data
    const monthlyData: Record<string, { revenue: number; expenses: number }> = {}
    allTrips.forEach(t => {
      const month = formatDate(t.tripDate, 'MMM yyyy')
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, expenses: 0 }
      monthlyData[month].revenue += t.finalBill
      monthlyData[month].expenses += t.dieselAmount + t.tollTax + t.borderTax + t.driverWages + t.miscExpense
    })

    const chartData = Object.entries(monthlyData).slice(-6).map(([month, data]) => ({ month, ...data }))

    return {
      totalVehicles, totalDrivers, totalParties, totalTrips,
      monthlyBilling, pendingPayments, monthlyExpenses,
      profit: monthlyBilling - monthlyExpenses,
      recentTrips, alerts, chartData,
      companyName: settings?.companyName ?? 'MYC TRAVELS',
      companyGstin: settings?.companyGstNumber ?? '',
    }
  } catch {
    return {
      totalVehicles: 0, totalDrivers: 0, totalParties: 0, totalTrips: 0,
      monthlyBilling: 0, pendingPayments: 0, monthlyExpenses: 0, profit: 0,
      recentTrips: [], alerts: [], chartData: [],
      companyName: 'MYC TRAVELS',
      companyGstin: '',
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const kpis = [
    { title: 'Total Vehicles', value: data.totalVehicles, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Drivers', value: data.totalDrivers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Parties', value: data.totalParties, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Total Trips', value: data.totalTrips, icon: Map, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Monthly Billing', value: formatCurrency(data.monthlyBilling), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Payments', value: formatCurrency(data.pendingPayments), icon: CreditCard, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Monthly Expenses', value: formatCurrency(data.monthlyExpenses), icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { title: 'Est. Profit', value: formatCurrency(data.profit), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
  ]

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening'
  const currentMonth = format(now, 'MMMM yyyy')

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ── Branded Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 shadow-xl">
        {/* Watermark logo — top-right, very subtle */}
        <div className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-40 w-auto object-contain opacity-[0.07]"
          />
        </div>
        {/* Soft glow circles */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 p-5 md:p-7">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">{greeting}, Juberbhai 👋</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {data.companyName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2">
                {data.companyGstin && (
                  <span className="text-slate-300 text-xs font-medium bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full">
                    GSTIN: {data.companyGstin}
                  </span>
                )}
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {currentMonth}
                </span>
              </div>
            </div>
            <Button asChild size="sm" className="bg-white text-slate-800 hover:bg-slate-100 shadow-md font-semibold shrink-0">
              <Link href="/trips/new"><Plus className="h-4 w-4 mr-1" />New Trip</Link>
            </Button>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/8 border border-white/10 rounded-xl p-3 text-white backdrop-blur-sm">
              <p className="text-xs text-slate-400 mb-0.5">This Month Billing</p>
              <p className="text-base md:text-lg font-bold">{formatCurrency(data.monthlyBilling)}</p>
            </div>
            <div className="bg-white/8 border border-white/10 rounded-xl p-3 text-white backdrop-blur-sm">
              <p className="text-xs text-slate-400 mb-0.5">Est. Profit</p>
              <p className={`text-base md:text-lg font-bold ${data.profit < 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                {formatCurrency(data.profit)}
              </p>
            </div>
            <div className="bg-white/8 border border-white/10 rounded-xl p-3 text-white backdrop-blur-sm">
              <p className="text-xs text-slate-400 mb-0.5">Pending</p>
              <p className="text-base md:text-lg font-bold text-amber-300">{formatCurrency(data.pendingPayments)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.bg} shrink-0`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{kpi.title}</p>
                  <p className="text-lg font-bold truncate">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              Document Expiry Alerts ({data.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-1.5">
              {data.alerts.map((alert, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded ${alert.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  {alert.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      <DashboardCharts data={data.chartData} />

      {/* Recent Trips */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Trips</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/trips">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                  <th className="text-left px-4 py-2 font-medium">Route</th>
                  <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Party</th>
                  <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Vehicle</th>
                  <th className="text-right px-4 py-2 font-medium">Amount</th>
                  <th className="text-center px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTrips.map((trip) => (
                  <tr key={trip.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(trip.tripDate)}</td>
                    <td className="px-4 py-2">
                      <Link href={`/trips/${trip.id}`} className="hover:underline font-medium">{trip.place}</Link>
                    </td>
                    <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">{trip.party.partyName}</td>
                    <td className="px-4 py-2 hidden md:table-cell text-muted-foreground">{trip.vehicle.vehicleNumber}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(trip.finalBill)}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge
                        variant={trip.paymentStatus === 'PAID' ? 'default' : trip.paymentStatus === 'PARTIAL' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {trip.paymentStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {data.recentTrips.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No trips yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/vehicles/new', label: 'Add Vehicle', icon: Truck },
          { href: '/drivers/new', label: 'Add Driver', icon: Users },
          { href: '/parties/new', label: 'Add Party', icon: Building2 },
          { href: '/trips/new', label: 'New Trip', icon: Map },
        ].map((action) => (
          <Button key={action.href} variant="outline" asChild className="h-auto py-3">
            <Link href={action.href} className="flex flex-col items-center gap-1.5">
              <action.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
