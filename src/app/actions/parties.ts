'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const partySchema = z.object({
  partyName: z.string().min(1, 'Party name required'),
  contactPerson: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  billingAddress: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
})

export async function createParty(data: z.infer<typeof partySchema>) {
  const parsed = partySchema.parse(data)
  const party = await prisma.party.create({ data: parsed })
  revalidatePath('/parties')
  return party
}

export async function updateParty(id: string, data: z.infer<typeof partySchema>) {
  const parsed = partySchema.parse(data)
  const party = await prisma.party.update({ where: { id }, data: parsed })
  revalidatePath('/parties')
  revalidatePath(`/parties/${id}`)
  return party
}

export async function deleteParty(id: string) {
  await prisma.party.delete({ where: { id } })
  revalidatePath('/parties')
}
