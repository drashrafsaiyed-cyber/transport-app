import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { VehicleForm } from '@/components/forms/vehicle-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

async function getVehicle(id: string) {
  try {
    return await prisma.vehicle.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicle(id)
  if (!vehicle) notFound()

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/vehicles/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Vehicle</h1>
      </div>
      <VehicleForm mode="edit" vehicle={vehicle} />
    </div>
  )
}
