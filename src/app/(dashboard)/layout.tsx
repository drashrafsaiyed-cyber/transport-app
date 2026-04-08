'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Truck,
  Users,
  Building2,
  Map,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/vehicles', icon: Truck, label: 'Vehicles' },
  { href: '/drivers', icon: Users, label: 'Drivers' },
  { href: '/parties', icon: Building2, label: 'Parties' },
  { href: '/trips', icon: Map, label: 'Trips' },
  { href: '/payments', icon: CreditCard, label: 'Payments' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-2 px-4 py-5 border-b bg-gradient-to-b from-orange-50 to-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="MYC Travels"
          className="h-14 w-auto object-contain"
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = 'none'
            const fallback = el.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        {/* Fallback if no logo */}
        <div className="hidden items-center gap-2">
          <div className="p-1.5 bg-orange-100 rounded-lg">
            <Truck className="h-5 w-5 text-orange-600" />
          </div>
          <span className="font-semibold text-sm">MYC Travels</span>
        </div>
        <span className="text-xs text-orange-600 font-semibold tracking-wide uppercase">
          Transport Manager
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                isActive ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500' : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-orange-600' : '')} />
              {item.label}
              {isActive && <ChevronRight className="h-3 w-3 ml-auto text-orange-400" />}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t bg-gray-50">
        <p className="text-xs text-muted-foreground">MYC Travels v1.0</p>
        <p className="text-xs text-orange-500 font-medium">GSTIN: 24ATFPG1538D1Z8</p>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r bg-card shrink-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-4 py-3 border-b bg-white shrink-0 shadow-sm">
          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <button
                  className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              }
            />
            <SheetContent side="left" className="p-0 w-60">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MYC Travels" className="h-8 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span className="font-semibold text-sm text-orange-700">MYC Travels</span>
          </div>

          <div className="flex-1" />

          {/* Company badge in topbar */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-orange-700">MYC TRAVELS</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-2')}>
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs">
                    JG
                  </div>
                  <span className="hidden sm:inline text-sm">Juberbhai</span>
                </button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-semibold">Juberbhai Garasiya</p>
                <p className="text-xs text-muted-foreground">MYC Travels · Owner</p>
              </div>
              <DropdownMenuItem>
                <Link href="/settings" className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
