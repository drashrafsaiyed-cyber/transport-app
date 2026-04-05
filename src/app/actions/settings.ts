'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const settingsSchema = z.object({
  companyName: z.string().min(1, 'Company name required'),
  companyAddress: z.string().optional(),
  invoiceFooter: z.string().optional(),
  currencySymbol: z.string().default('₹'),
  dateFormat: z.string().default('dd/MM/yyyy'),
  includeTollInBill: z.boolean().default(false),
  includeBorderInBill: z.boolean().default(false),
  includeDriverWagesInBill: z.boolean().default(false),
  includeDieselInBill: z.boolean().default(false),
  includeMiscInBill: z.boolean().default(false),
})

export async function updateSettings(data: z.infer<typeof settingsSchema>) {
  const parsed = settingsSchema.parse(data)
  const settings = await prisma.appSetting.upsert({
    where: { id: 'default' },
    update: parsed,
    create: { id: 'default', ...parsed },
  })
  revalidatePath('/settings')
  return settings
}

export async function getSettings() {
  try {
    const settings = await prisma.appSetting.findUnique({ where: { id: 'default' } })
    return settings
  } catch {
    return null
  }
}
