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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createDriver, updateDriver } from '@/app/actions/drivers'
const DriverStatus = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' } as const
type DriverStatus = typeof DriverStatus[keyof typeof DriverStatus]

const schema = z.object({
  name: z.string().min(1, 'Required'),
  mobile: z.string().min(1, 'Required'),
  address: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  salary: z.string(),
  advanceBalance: z.string(),
  joiningDate: z.string().optional(),
  status: z.nativeEnum(DriverStatus),
  vehicleId: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = {
  name: string
  mobile: string
  address?: string
  licenseNumber?: string
  licenseExpiry?: string
  salary: number
  advanceBalance: number
  joiningDate?: string
  status: DriverStatus
  vehicleId?: string
  notes?: string
}

interface Vehicle { id: string; vehicleNumber: string }
interface DriverData {
  id?: string
  name?: string
  mobile?: string
  address?: string
  licenseNumber?: string
  licenseExpiry?: Date | string | null
  salary?: number
  advanceBalance?: number
  joiningDate?: Date | string | null
  status?: 'ACTIVE' | 'INACTIVE'
  vehicleId?: string
  notes?: string
}

interface Props {
  driver?: DriverData
  vehicles: Vehicle[]
  mode: 'create' | 'edit'
}

function toDateStr(d: Date | string | null | undefined) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

export function DriverForm({ driver, vehicles, mode }: Props) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: driver?.name ?? '',
      mobile: driver?.mobile ?? '',
      address: driver?.address ?? '',
      licenseNumber: driver?.licenseNumber ?? '',
      licenseExpiry: toDateStr(driver?.licenseExpiry),
      salary: driver?.salary ?? 0,
      advanceBalance: driver?.advanceBalance ?? 0,
      joiningDate: toDateStr(driver?.joiningDate),
      status: (driver?.status as DriverStatus) ?? DriverStatus.ACTIVE,
      vehicleId: driver?.vehicleId ?? '',
      notes: driver?.notes ?? '',
    },
  })

  const status = watch('status')
  const vehicleId = watch('vehicleId')

  async function onSubmit(data: FormData) {
    try {
      const submitData = {
        ...data,
        salary: Number(data.salary),
        advanceBalance: Number(data.advanceBalance),
      }
      if (mode === 'create') {
        await createDriver(submitData)
        toast.success('Driver created successfully')
      } else {
        await updateDriver(driver!.id!, submitData)
        toast.success('Driver updated successfully')
      }
      router.push('/drivers')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Full Name *</Label>
            <Input {...register('name')} placeholder="Driver's full name" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Mobile *</Label>
            <Input {...register('mobile')} placeholder="9876543210" />
            {errors.mobile && <p className="text-xs text-red-500">{errors.mobile.message}</p>}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Address</Label>
            <Textarea {...register('address')} placeholder="Full address" rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Joining Date</Label>
            <Input type="date" {...register('joiningDate')} />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setValue('status', v as DriverStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">License & Assignment</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>License Number</Label>
            <Input {...register('licenseNumber')} placeholder="MH-DL-2020-0001" />
          </div>
          <div className="space-y-1">
            <Label>License Expiry</Label>
            <Input type="date" {...register('licenseExpiry')} />
          </div>
          <div className="space-y-1">
            <Label>Assigned Vehicle</Label>
            <Select value={vehicleId || 'none'} onValueChange={(v) => setValue('vehicleId', (v === 'none' || !v) ? '' : String(v))}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {vehicles.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.vehicleNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Salary & Advance</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Monthly Salary (₹)</Label>
            <Input type="number" {...register('salary')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Advance Balance (₹)</Label>
            <Input type="number" {...register('advanceBalance')} placeholder="0" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Notes</Label>
            <Textarea {...register('notes')} placeholder="Additional notes..." rows={2} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Driver' : 'Update Driver'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
