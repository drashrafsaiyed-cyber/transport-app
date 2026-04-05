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
  try {
    const parsed = partySchema.parse(data)
    const party = await prisma.party.create({ data: parsed })
    revalidatePath('/parties')
    return { success: true, party }
  } catch (error) {
    console.error('createParty error:', error)
    throw new Error('Failed to create party. Please try again.')
  }
}

export async function updateParty(id: string, data: z.infer<typeof partySchema>) {
  try {
    const parsed = partySchema.parse(data)
    const party = await prisma.party.update({ where: { id }, data: parsed })
    revalidatePath('/parties')
    revalidatePath(`/parties/${id}`)
    return { success: true, party }
  } catch (error) {
    console.error('updateParty error:', error)
    throw new Error('Failed to update party. Please try again.')
  }
}

export async function deleteParty(id: string) {
  try {
    await prisma.party.delete({ where: { id } })
    revalidatePath('/parties')
    return { success: true }
  } catch (error) {
    console.error('deleteParty error:', error)
    throw new Error('Failed to delete party. Please try again.')
  }
}
