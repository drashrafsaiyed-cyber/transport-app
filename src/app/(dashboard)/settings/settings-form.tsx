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
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AppSetting {
  companyName: string
  companyAddress?: string | null
  invoiceFooter?: string | null
  currencySymbol: string
  dateFormat: string
  includeTollInBill: boolean
  includeBorderInBill: boolean
  includeDriverWagesInBill: boolean
  includeDieselInBill: boolean
  includeMiscInBill: boolean
  companyGstNumber?: string | null
  gstPercentage: number
  cgstPercentage: number
  sgstPercentage: number
  igstPercentage: number
  enableGst: boolean
  defaultGstType: string
  invoicePrefix: string
}

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
  companyGstNumber: z.string().optional(),
  gstPercentage: z.number(),
  cgstPercentage: z.number(),
  sgstPercentage: z.number(),
  igstPercentage: z.number(),
  enableGst: z.boolean(),
  defaultGstType: z.string(),
  invoicePrefix: z.string().min(1),
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
      companyGstNumber: settings?.companyGstNumber ?? '',
      gstPercentage: settings?.gstPercentage ?? 18,
      cgstPercentage: settings?.cgstPercentage ?? 9,
      sgstPercentage: settings?.sgstPercentage ?? 9,
      igstPercentage: settings?.igstPercentage ?? 18,
      enableGst: settings?.enableGst ?? false,
      defaultGstType: settings?.defaultGstType ?? 'CGST_SGST',
      invoicePrefix: settings?.invoicePrefix ?? 'INV',
    },
  })

  const [toll, border, wages, diesel, misc, enableGst, defaultGstType] = watch([
    'includeTollInBill', 'includeBorderInBill', 'includeDriverWagesInBill',
    'includeDieselInBill', 'includeMiscInBill', 'enableGst', 'defaultGstType'
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
      {/* Company Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Company Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Company Name *</Label>
              <Input {...register('companyName')} placeholder="Shree Ram Transport" />
              {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Invoice Prefix</Label>
              <Input {...register('invoicePrefix')} placeholder="INV" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Company Address</Label>
            <Textarea {...register('companyAddress')} placeholder="Full company address" rows={3} />
          </div>
          <div className="space-y-1">
            <Label>Invoice Footer Text</Label>
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

      {/* GST Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">GST / Tax Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b">
            <Switch
              id="enableGst"
              checked={enableGst}
              onCheckedChange={(v) => setValue('enableGst', v)}
            />
            <div>
              <Label htmlFor="enableGst" className="cursor-pointer font-medium">Enable GST on Invoices</Label>
              <p className="text-xs text-muted-foreground">Show GST breakdown on bills — both with-GST and without-GST options available per invoice</p>
            </div>
          </div>

          {enableGst && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Company GST Number</Label>
                  <Input {...register('companyGstNumber')} placeholder="27AABCS1429B1ZB" />
                </div>
                <div className="space-y-1">
                  <Label>Default GST Type</Label>
                  <Select value={defaultGstType} onValueChange={(v) => v && setValue('defaultGstType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CGST_SGST">CGST + SGST (Intrastate)</SelectItem>
                      <SelectItem value="IGST">IGST (Interstate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {defaultGstType === 'CGST_SGST' ? (
                  <>
                    <div className="space-y-1">
                      <Label>CGST % (e.g. 9)</Label>
                      <Input type="number" step="0.01" {...register('cgstPercentage', { valueAsNumber: true })} placeholder="9" />
                    </div>
                    <div className="space-y-1">
                      <Label>SGST % (e.g. 9)</Label>
                      <Input type="number" step="0.01" {...register('sgstPercentage', { valueAsNumber: true })} placeholder="9" />
                    </div>
                    <div className="space-y-1">
                      <Label>Total GST %</Label>
                      <Input
                        readOnly
                        className="bg-muted"
                        value={`${(watch('cgstPercentage') || 0) + (watch('sgstPercentage') || 0)}%`}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <Label>IGST % (e.g. 18)</Label>
                    <Input type="number" step="0.01" {...register('igstPercentage', { valueAsNumber: true })} placeholder="18" />
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                <strong>How it works:</strong> On each invoice you can choose to generate <strong>With GST</strong> or <strong>Without GST</strong>.
                Both are shown separately so you can maintain proper accounting records.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Inclusions */}
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
