'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { DriverStatus } from '@prisma/client'

const driverSchema = z.object({
  name: z.string().min(1, 'Name required'),
  mobile: z.string().min(1, 'Mobile required'),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  salary: z.coerce.number().min(0),
  advanceBalance: z.coerce.number().min(0),
  joiningDate: z.string().optional(),
  status: z.nativeEnum(DriverStatus),
  vehicleId: z.string().optional(),
  notes: z.string().optional(),
})

export async function createDriver(data: z.infer<typeof driverSchema>) {
  const parsed = driverSchema.parse(data)
  const driver = await prisma.driver.create({
    data: {
      ...parsed,
      licenseExpiry: parsed.licenseExpiry ? new Date(parsed.licenseExpiry) : null,
      joiningDate: parsed.joiningDate ? new Date(parsed.joiningDate) : null,
      vehicleId: parsed.vehicleId || null,
    },
  })
  revalidatePath('/drivers')
  return driver
}

export async function updateDriver(id: string, data: z.infer<typeof driverSchema>) {
  const parsed = driverSchema.parse(data)
  const driver = await prisma.driver.update({
    where: { id },
    data: {
      ...parsed,
      licenseExpiry: parsed.licenseExpiry ? new Date(parsed.licenseExpiry) : null,
      joiningDate: parsed.joiningDate ? new Date(parsed.joiningDate) : null,
      vehicleId: parsed.vehicleId || null,
    },
  })
  revalidatePath('/drivers')
  revalidatePath(`/drivers/${id}`)
  return driver
}

export async function deleteDriver(id: string) {
  await prisma.driver.delete({ where: { id } })
  revalidatePath('/drivers')
}
