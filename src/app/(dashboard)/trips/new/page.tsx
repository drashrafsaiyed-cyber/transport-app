import { prisma } from '@/lib/prisma'
import { TripForm } from '@/components/forms/trip-form'

async function getData() {
  try {
    const [parties, vehicles, drivers] = await Promise.all([
      prisma.party.findMany({ orderBy: { partyName: 'asc' }, select: { id: true, partyName: true } }),
      prisma.vehicle.findMany({ where: { isActive: true }, select: { id: true, vehicleNumber: true } }),
      prisma.driver.findMany({ where: { status: 'ACTIVE' }, select: { id: true, name: true } }),
    ])
    return { parties, vehicles, drivers }
  } catch { return { parties: [], vehicles: [], drivers: [] } }
}

export default async function NewTripPage({ searchParams }: { searchParams: Promise<{ partyId?: string }> }) {
  const { partyId } = await searchParams
  const { parties, vehicles, drivers } = await getData()

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">New Trip</h1>
      <TripForm mode="create" parties={parties} vehicles={vehicles} drivers={drivers} defaultPartyId={partyId} />
    </div>
  )
}
