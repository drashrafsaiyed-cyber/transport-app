'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { PaymentStatus } from '@prisma/client'

const paymentSchema = z.object({
  tripId: z.string().min(1),
  partyId: z.string().min(1),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date required'),
  notes: z.string().optional(),
})

export async function recordPayment(data: z.infer<typeof paymentSchema>) {
  try {
    const parsed = paymentSchema.parse(data)

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        tripId: parsed.tripId,
        partyId: parsed.partyId,
        amount: parsed.amount,
        paymentDate: new Date(parsed.paymentDate),
        notes: parsed.notes,
      },
    })

    // Update trip paid amount and status
    const trip = await prisma.trip.findUnique({ where: { id: parsed.tripId } })
    if (trip) {
      const newPaidAmount = trip.paidAmount + parsed.amount
      let status: PaymentStatus = PaymentStatus.PARTIAL
      if (newPaidAmount >= trip.finalBill) {
        status = PaymentStatus.PAID
      } else if (newPaidAmount === 0) {
        status = PaymentStatus.PENDING
      }
      await prisma.trip.update({
        where: { id: parsed.tripId },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: status,
        },
      })
    }

    revalidatePath('/payments')
    revalidatePath('/trips')
    revalidatePath('/dashboard')
    return { success: true, payment }
  } catch (error) {
    console.error('recordPayment error:', error)
    throw new Error('Failed to record payment. Please try again.')
  }
}
