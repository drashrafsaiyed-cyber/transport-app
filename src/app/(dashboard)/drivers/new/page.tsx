import { prisma } from '@/lib/prisma'
import { DriverForm } from '@/components/forms/driver-form'

async function getVehicles() {
  try {
    return await prisma.vehicle.findMany({ where: { isActive: true }, select: { id: true, vehicleNumber: true } })
  } catch { return [] }
}

export default async function NewDriverPage() {
  const vehicles = await getVehicles()
  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Add Driver</h1>
      <DriverForm mode="create" vehicles={vehicles} />
    </div>
  )
}
