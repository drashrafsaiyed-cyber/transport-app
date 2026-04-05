import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { DriverForm } from '@/components/forms/driver-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

async function getData(id: string) {
  try {
    const [driver, vehicles] = await Promise.all([
      prisma.driver.findUnique({ where: { id } }),
      prisma.vehicle.findMany({ where: { isActive: true }, select: { id: true, vehicleNumber: true } }),
    ])
    return { driver, vehicles }
  } catch { return { driver: null, vehicles: [] } }
}

export default async function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { driver, vehicles } = await getData(id)
  if (!driver) notFound()

  const driverData = {
    id: driver.id,
    name: driver.name,
    mobile: driver.mobile,
    address: driver.address ?? undefined,
    licenseNumber: driver.licenseNumber ?? undefined,
    licenseExpiry: driver.licenseExpiry,
    salary: driver.salary,
    advanceBalance: driver.advanceBalance,
    joiningDate: driver.joiningDate,
    status: driver.status,
    vehicleId: driver.vehicleId ?? undefined,
    notes: driver.notes ?? undefined,
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/drivers/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Driver</h1>
      </div>
      <DriverForm mode="edit" driver={driverData} vehicles={vehicles} />
    </div>
  )
}
