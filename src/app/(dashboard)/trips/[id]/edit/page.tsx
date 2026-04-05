import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { TripForm } from '@/components/forms/trip-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

async function getData(id: string) {
  try {
    const [trip, parties, vehicles, drivers] = await Promise.all([
      prisma.trip.findUnique({ where: { id } }),
      prisma.party.findMany({ orderBy: { partyName: 'asc' }, select: { id: true, partyName: true } }),
      prisma.vehicle.findMany({ where: { isActive: true }, select: { id: true, vehicleNumber: true } }),
      prisma.driver.findMany({ where: { status: 'ACTIVE' }, select: { id: true, name: true } }),
    ])
    return { trip, parties, vehicles, drivers }
  } catch { return { trip: null, parties: [], vehicles: [], drivers: [] } }
}

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { trip, parties, vehicles, drivers } = await getData(id)
  if (!trip) notFound()

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/trips/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Trip</h1>
      </div>
      <TripForm mode="edit" trip={trip} parties={parties} vehicles={vehicles} drivers={drivers} />
    </div>
  )
}
