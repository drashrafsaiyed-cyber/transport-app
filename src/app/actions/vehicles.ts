'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { VehicleType } from '@prisma/client'

const vehicleSchema = z.object({
  vehicleNumber: z.string().min(1, 'Vehicle number required'),
  vehicleType: z.nativeEnum(VehicleType),
  ownerName: z.string().min(1, 'Owner name required'),
  monthlyTax: z.coerce.number().min(0),
  insuranceNumber: z.string().optional(),
  insuranceStartDate: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  permitDetails: z.string().optional(),
  fitnessExpiry: z.string().optional(),
  pollutionExpiry: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function createVehicle(data: z.infer<typeof vehicleSchema>) {
  try {
    const parsed = vehicleSchema.parse(data)
    const vehicle = await prisma.vehicle.create({
      data: {
        ...parsed,
        insuranceStartDate: parsed.insuranceStartDate ? new Date(parsed.insuranceStartDate) : null,
        insuranceExpiry: parsed.insuranceExpiry ? new Date(parsed.insuranceExpiry) : null,
        fitnessExpiry: parsed.fitnessExpiry ? new Date(parsed.fitnessExpiry) : null,
        pollutionExpiry: parsed.pollutionExpiry ? new Date(parsed.pollutionExpiry) : null,
        isActive: parsed.isActive ?? true,
      },
    })
    revalidatePath('/vehicles')
    return { success: true, vehicle }
  } catch (error) {
    console.error('createVehicle error:', error)
    throw new Error('Failed to create vehicle. Please try again.')
  }
}

export async function updateVehicle(id: string, data: z.infer<typeof vehicleSchema>) {
  try {
    const parsed = vehicleSchema.parse(data)
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...parsed,
        insuranceStartDate: parsed.insuranceStartDate ? new Date(parsed.insuranceStartDate) : null,
        insuranceExpiry: parsed.insuranceExpiry ? new Date(parsed.insuranceExpiry) : null,
        fitnessExpiry: parsed.fitnessExpiry ? new Date(parsed.fitnessExpiry) : null,
        pollutionExpiry: parsed.pollutionExpiry ? new Date(parsed.pollutionExpiry) : null,
      },
    })
    revalidatePath('/vehicles')
    revalidatePath(`/vehicles/${id}`)
    return { success: true, vehicle }
  } catch (error) {
    console.error('updateVehicle error:', error)
    throw new Error('Failed to update vehicle. Please try again.')
  }
}

export async function deleteVehicle(id: string) {
  try {
    await prisma.vehicle.delete({ where: { id } })
    revalidatePath('/vehicles')
    return { success: true }
  } catch (error) {
    console.error('deleteVehicle error:', error)
    throw new Error('Failed to delete vehicle. Please try again.')
  }
}
