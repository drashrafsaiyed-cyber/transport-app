'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createVehicle, updateVehicle } from '@/app/actions/vehicles'
const VehicleType = {
  TRUCK: 'TRUCK',
  MINI_TRUCK: 'MINI_TRUCK',
  TRAILER: 'TRAILER',
  CONTAINER: 'CONTAINER',
  TANKER: 'TANKER',
  OTHER: 'OTHER',
} as const
type VehicleType = typeof VehicleType[keyof typeof VehicleType]

const schema = z.object({
  vehicleNumber: z.string().min(1, 'Required'),
  vehicleType: z.nativeEnum(VehicleType),
  ownerName: z.string().min(1, 'Required'),
  monthlyTax: z.string(),
  insuranceNumber: z.string().optional(),
  insuranceStartDate: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  permitDetails: z.string().optional(),
  fitnessExpiry: z.string().optional(),
  pollutionExpiry: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
})

type FormData = {
  vehicleNumber: string
  vehicleType: VehicleType
  ownerName: string
  monthlyTax: number
  insuranceNumber?: string
  insuranceStartDate?: string
  insuranceExpiry?: string
  permitDetails?: string
  fitnessExpiry?: string
  pollutionExpiry?: string
  notes?: string
  isActive?: boolean
}

interface VehicleData {
  id?: string
  vehicleNumber?: string
  vehicleType?: VehicleType
  ownerName?: string
  monthlyTax?: number
  insuranceNumber?: string | null
  insuranceStartDate?: Date | string | null
  insuranceExpiry?: Date | string | null
  permitDetails?: string | null
  fitnessExpiry?: Date | string | null
  pollutionExpiry?: Date | string | null
  notes?: string | null
  isActive?: boolean
}

interface Props {
  vehicle?: VehicleData
  mode: 'create' | 'edit'
}

function toDateStr(d: Date | string | null | undefined) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

export function VehicleForm({ vehicle, mode }: Props) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      vehicleNumber: vehicle?.vehicleNumber ?? '',
      vehicleType: vehicle?.vehicleType ?? VehicleType.TRUCK,
      ownerName: vehicle?.ownerName ?? '',
      monthlyTax: vehicle?.monthlyTax ?? 0,
      insuranceNumber: vehicle?.insuranceNumber ?? '',
      insuranceStartDate: toDateStr(vehicle?.insuranceStartDate),
      insuranceExpiry: toDateStr(vehicle?.insuranceExpiry),
      permitDetails: vehicle?.permitDetails ?? '',
      fitnessExpiry: toDateStr(vehicle?.fitnessExpiry),
      pollutionExpiry: toDateStr(vehicle?.pollutionExpiry),
      notes: vehicle?.notes ?? '',
      isActive: vehicle?.isActive ?? true,
    },
  })

  const isActive = watch('isActive')
  const vehicleType = watch('vehicleType')

  async function onSubmit(data: FormData) {
    try {
      if (mode === 'create') {
        await createVehicle(data)
        toast.success('Vehicle created successfully')
      } else {
        await updateVehicle(vehicle!.id!, data)
        toast.success('Vehicle updated successfully')
      }
      router.push('/vehicles')
      router.refresh()
    } catch (err) {
      toast.error('Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Vehicle Number *</Label>
            <Input {...register('vehicleNumber')} placeholder="MH-12-AB-1234" />
            {errors.vehicleNumber && <p className="text-xs text-red-500">{errors.vehicleNumber.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Vehicle Type *</Label>
            <Select value={vehicleType} onValueChange={(v) => v && setValue('vehicleType', v as VehicleType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.values(VehicleType).map(t => (
                  <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Owner Name *</Label>
            <Input {...register('ownerName')} placeholder="Owner's name" />
            {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Monthly Tax (₹)</Label>
            <Input type="number" {...register('monthlyTax')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Permit Details</Label>
            <Input {...register('permitDetails')} placeholder="National/State Permit" />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Switch checked={isActive ?? true} onCheckedChange={(v) => setValue('isActive', v)} id="isActive" />
            <Label htmlFor="isActive">Vehicle Active</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Insurance & Documents</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Insurance Number</Label>
            <Input {...register('insuranceNumber')} placeholder="INS-2024-001" />
          </div>
          <div className="space-y-1">
            <Label>Insurance Start Date</Label>
            <Input type="date" {...register('insuranceStartDate')} />
          </div>
          <div className="space-y-1">
            <Label>Insurance Expiry</Label>
            <Input type="date" {...register('insuranceExpiry')} />
          </div>
          <div className="space-y-1">
            <Label>Fitness Expiry</Label>
            <Input type="date" {...register('fitnessExpiry')} />
          </div>
          <div className="space-y-1">
            <Label>Pollution Expiry</Label>
            <Input type="date" {...register('pollutionExpiry')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea {...register('notes')} placeholder="Additional notes..." rows={3} />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Vehicle' : 'Update Vehicle'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
