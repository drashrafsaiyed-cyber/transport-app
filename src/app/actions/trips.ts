'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { PaymentStatus } from '@prisma/client'

const tripSchema = z.object({
  tripDate: z.string().min(1, 'Trip date required'),
  place: z.string().min(1, 'Place required'),
  partyId: z.string().min(1, 'Party required'),
  vehicleId: z.string().min(1, 'Vehicle required'),
  driverId: z.string().min(1, 'Driver required'),
  ratePerKm: z.coerce.number().min(0),
  startingKm: z.coerce.number().min(0),
  endingKm: z.coerce.number().min(0),
  totalKm: z.coerce.number().min(0),
  dieselAmount: z.coerce.number().min(0),
  tollTax: z.coerce.number().min(0),
  borderTax: z.coerce.number().min(0),
  driverWages: z.coerce.number().min(0),
  miscExpense: z.coerce.number().min(0),
  tripAmount: z.coerce.number().min(0),
  finalBill: z.coerce.number().min(0),
  paymentStatus: z.nativeEnum(PaymentStatus),
  paidAmount: z.coerce.number().min(0),
  remarks: z.string().optional(),
})

export async function createTrip(data: z.infer<typeof tripSchema>) {
  const parsed = tripSchema.parse(data)
  const trip = await prisma.trip.create({
    data: {
      ...parsed,
      tripDate: new Date(parsed.tripDate),
    },
  })
  revalidatePath('/trips')
  revalidatePath('/dashboard')
  return trip
}

export async function updateTrip(id: string, data: z.infer<typeof tripSchema>) {
  const parsed = tripSchema.parse(data)
  const trip = await prisma.trip.update({
    where: { id },
    data: {
      ...parsed,
      tripDate: new Date(parsed.tripDate),
    },
  })
  revalidatePath('/trips')
  revalidatePath(`/trips/${id}`)
  revalidatePath('/dashboard')
  return trip
}

export async function deleteTrip(id: string) {
  await prisma.trip.delete({ where: { id } })
  revalidatePath('/trips')
  revalidatePath('/dashboard')
}
