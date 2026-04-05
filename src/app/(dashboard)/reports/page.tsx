import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, Truck, Users, Building2, CreditCard, DollarSign, BarChart2, Shield } from 'lucide-react'

const reports = [
  { href: '/reports/trips', icon: Map, title: 'Trip Report', description: 'Date-wise trip details with totals' },
  { href: '/reports/vehicles', icon: Truck, title: 'Vehicle Report', description: 'Vehicle-wise trip summary' },
  { href: '/reports/drivers', icon: Users, title: 'Driver Report', description: 'Driver-wise trip statistics' },
  { href: '/reports/parties', icon: Building2, title: 'Party Report', description: 'Party-wise billing summary' },
  { href: '/reports/payments', icon: CreditCard, title: 'Payment Report', description: 'Outstanding payment details' },
  { href: '/reports/expenses', icon: DollarSign, title: 'Expense Report', description: 'Breakdown of all expenses' },
  { href: '/reports/monthly', icon: BarChart2, title: 'Monthly Summary', description: 'Month-wise P&L summary' },
  { href: '/reports/insurance', icon: Shield, title: 'Insurance & Expiry', description: 'Document expiry tracking' },
]

export default function ReportsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">View and export detailed reports</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <r.icon className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{r.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
