'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateSettings } from '@/app/actions/settings'
import { AppSetting } from '@prisma/client'
import { useRouter } from 'next/navigation'

const schema = z.object({
  companyName: z.string().min(1, 'Required'),
  companyAddress: z.string().optional(),
  invoiceFooter: z.string().optional(),
  currencySymbol: z.string().min(1),
  dateFormat: z.string().min(1),
  includeTollInBill: z.boolean(),
  includeBorderInBill: z.boolean(),
  includeDriverWagesInBill: z.boolean(),
  includeDieselInBill: z.boolean(),
  includeMiscInBill: z.boolean(),
})

type FormData = z.infer<typeof schema>

export function SettingsForm({ settings }: { settings: AppSetting | null }) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: settings?.companyName ?? 'Transport Company',
      companyAddress: settings?.companyAddress ?? '',
      invoiceFooter: settings?.invoiceFooter ?? '',
      currencySymbol: settings?.currencySymbol ?? '₹',
      dateFormat: settings?.dateFormat ?? 'dd/MM/yyyy',
      includeTollInBill: settings?.includeTollInBill ?? false,
      includeBorderInBill: settings?.includeBorderInBill ?? false,
      includeDriverWagesInBill: settings?.includeDriverWagesInBill ?? false,
      includeDieselInBill: settings?.includeDieselInBill ?? false,
      includeMiscInBill: settings?.includeMiscInBill ?? false,
    },
  })

  const [toll, border, wages, diesel, misc] = watch([
    'includeTollInBill', 'includeBorderInBill', 'includeDriverWagesInBill', 'includeDieselInBill', 'includeMiscInBill'
  ])

  async function onSubmit(data: FormData) {
    try {
      await updateSettings(data)
      toast.success('Settings saved successfully')
      router.refresh()
    } catch {
      toast.error('Failed to save settings')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Company Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-1">
            <Label>Company Name *</Label>
            <Input {...register('companyName')} placeholder="Shree Ram Transport" />
            {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Company Address</Label>
            <Textarea {...register('companyAddress')} placeholder="Full company address" rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Invoice Footer</Label>
            <Textarea {...register('invoiceFooter')} placeholder="Thank you for your business!" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Currency Symbol</Label>
              <Input {...register('currencySymbol')} placeholder="₹" />
            </div>
            <div className="space-y-1">
              <Label>Date Format</Label>
              <Input {...register('dateFormat')} placeholder="dd/MM/yyyy" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Bill Inclusions</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Choose which expenses to include in the final bill calculation</p>
          <div className="space-y-3">
            {[
              { key: 'includeTollInBill', label: 'Include Toll Tax in Bill', value: toll },
              { key: 'includeBorderInBill', label: 'Include Border Tax in Bill', value: border },
              { key: 'includeDriverWagesInBill', label: 'Include Driver Wages in Bill', value: wages },
              { key: 'includeDieselInBill', label: 'Include Diesel Amount in Bill', value: diesel },
              { key: 'includeMiscInBill', label: 'Include Misc Expenses in Bill', value: misc },
            ].map(item => (
              <div key={item.key} className="flex items-center gap-3">
                <Switch
                  id={item.key}
                  checked={item.value}
                  onCheckedChange={(v) => setValue(item.key as keyof FormData, v)}
                />
                <Label htmlFor={item.key} className="cursor-pointer">{item.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  )
}
