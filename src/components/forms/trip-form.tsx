'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createTrip, updateTrip } from '@/app/actions/trips'
const PaymentStatus = { PENDING: 'PENDING', PARTIAL: 'PARTIAL', PAID: 'PAID' } as const
type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus]
import { Separator } from '@/components/ui/separator'

const schema = z.object({
  tripDate: z.string().min(1, 'Required'),
  place: z.string().min(1, 'Required'),
  partyId: z.string().min(1, 'Required'),
  vehicleId: z.string().min(1, 'Required'),
  driverId: z.string().min(1, 'Required'),
  ratePerKm: z.string(),
  startingKm: z.string(),
  endingKm: z.string(),
  totalKm: z.string(),
  dieselAmount: z.string(),
  tollTax: z.string(),
  borderTax: z.string(),
  driverWages: z.string(),
  miscExpense: z.string(),
  tripAmount: z.string(),
  finalBill: z.string(),
  paymentStatus: z.nativeEnum(PaymentStatus),
  paidAmount: z.string(),
  remarks: z.string().optional(),
})

type FormData = {
  tripDate: string
  place: string
  partyId: string
  vehicleId: string
  driverId: string
  ratePerKm: number
  startingKm: number
  endingKm: number
  totalKm: number
  dieselAmount: number
  tollTax: number
  borderTax: number
  driverWages: number
  miscExpense: number
  tripAmount: number
  finalBill: number
  paymentStatus: PaymentStatus
  paidAmount: number
  remarks?: string
}

interface Party { id: string; partyName: string }
interface Vehicle { id: string; vehicleNumber: string }
interface Driver { id: string; name: string }

interface TripData {
  id?: string
  tripDate?: Date | string | null
  place?: string
  partyId?: string
  vehicleId?: string
  driverId?: string
  ratePerKm?: number
  startingKm?: number
  endingKm?: number
  totalKm?: number
  dieselAmount?: number
  tollTax?: number
  borderTax?: number
  driverWages?: number
  miscExpense?: number
  tripAmount?: number
  finalBill?: number
  paymentStatus?: PaymentStatus
  paidAmount?: number
  remarks?: string | null
}

interface Props {
  trip?: TripData
  parties: Party[]
  vehicles: Vehicle[]
  drivers: Driver[]
  defaultPartyId?: string
  mode: 'create' | 'edit'
}

function toDateStr(d: Date | string | null | undefined) {
  if (!d) return new Date().toISOString().split('T')[0]
  return new Date(d).toISOString().split('T')[0]
}

export function TripForm({ trip, parties, vehicles, drivers, defaultPartyId, mode }: Props) {
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      tripDate: toDateStr(trip?.tripDate),
      place: trip?.place ?? '',
      partyId: trip?.partyId ?? defaultPartyId ?? '',
      vehicleId: trip?.vehicleId ?? '',
      driverId: trip?.driverId ?? '',
      ratePerKm: trip?.ratePerKm ?? 0,
      startingKm: trip?.startingKm ?? 0,
      endingKm: trip?.endingKm ?? 0,
      totalKm: trip?.totalKm ?? 0,
      dieselAmount: trip?.dieselAmount ?? 0,
      tollTax: trip?.tollTax ?? 0,
      borderTax: trip?.borderTax ?? 0,
      driverWages: trip?.driverWages ?? 0,
      miscExpense: trip?.miscExpense ?? 0,
      tripAmount: trip?.tripAmount ?? 0,
      finalBill: trip?.finalBill ?? 0,
      paymentStatus: trip?.paymentStatus ?? PaymentStatus.PENDING,
      paidAmount: trip?.paidAmount ?? 0,
      remarks: trip?.remarks ?? '',
    },
  })

  const [startKm, endKm, rateKm, paymentStatus, partyId, vehicleId, driverId] = watch([
    'startingKm', 'endingKm', 'ratePerKm', 'paymentStatus', 'partyId', 'vehicleId', 'driverId'
  ])

  // Auto-calculate totalKm and tripAmount
  useEffect(() => {
    const total = Math.max(0, (Number(endKm) || 0) - (Number(startKm) || 0))
    setValue('totalKm', total)
    setValue('tripAmount', total * (Number(rateKm) || 0))
    setValue('finalBill', total * (Number(rateKm) || 0))
  }, [startKm, endKm, rateKm, setValue])

  async function onSubmit(data: FormData) {
    try {
      if (mode === 'create') {
        await createTrip(data)
        toast.success('Trip created successfully')
      } else {
        await updateTrip(trip!.id!, data)
        toast.success('Trip updated successfully')
      }
      router.push('/trips')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Trip Details</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Trip Date *</Label>
            <Input type="date" {...register('tripDate')} />
            {errors.tripDate && <p className="text-xs text-red-500">{errors.tripDate.message}</p>}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Route / Place *</Label>
            <Input {...register('place')} placeholder="Mumbai to Delhi" />
            {errors.place && <p className="text-xs text-red-500">{errors.place.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Party *</Label>
            <Select value={partyId} onValueChange={(v) => setValue('partyId', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
              <SelectContent>
                {parties.map(p => <SelectItem key={p.id} value={p.id}>{p.partyName}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.partyId && <p className="text-xs text-red-500">{errors.partyId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Vehicle *</Label>
            <Select value={vehicleId} onValueChange={(v) => setValue('vehicleId', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>
                {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.vehicleNumber}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.vehicleId && <p className="text-xs text-red-500">{errors.vehicleId.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Driver *</Label>
            <Select value={driverId} onValueChange={(v) => setValue('driverId', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
              <SelectContent>
                {drivers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.driverId && <p className="text-xs text-red-500">{errors.driverId.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">KM & Billing</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Starting KM</Label>
            <Input type="number" {...register('startingKm')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Ending KM</Label>
            <Input type="number" {...register('endingKm')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Total KM (auto)</Label>
            <Input type="number" {...register('totalKm')} readOnly className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label>Rate per KM (₹)</Label>
            <Input type="number" step="0.01" {...register('ratePerKm')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Trip Amount (auto)</Label>
            <Input type="number" step="0.01" {...register('tripAmount')} readOnly className="bg-muted" />
          </div>
          <div className="space-y-1">
            <Label>Final Bill (₹)</Label>
            <Input type="number" step="0.01" {...register('finalBill')} placeholder="0" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Expenses</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Diesel Amount (₹)</Label>
            <Input type="number" step="0.01" {...register('dieselAmount')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Toll Tax (₹)</Label>
            <Input type="number" step="0.01" {...register('tollTax')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Border Tax (₹)</Label>
            <Input type="number" step="0.01" {...register('borderTax')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Driver Wages (₹)</Label>
            <Input type="number" step="0.01" {...register('driverWages')} placeholder="0" />
          </div>
          <div className="space-y-1">
            <Label>Misc Expense (₹)</Label>
            <Input type="number" step="0.01" {...register('miscExpense')} placeholder="0" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>Payment Status</Label>
            <Select value={paymentStatus} onValueChange={(v) => v && setValue('paymentStatus', v as PaymentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Paid Amount (₹)</Label>
            <Input type="number" step="0.01" {...register('paidAmount')} placeholder="0" />
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label>Remarks</Label>
            <Textarea {...register('remarks')} placeholder="Additional remarks..." rows={2} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Trip' : 'Update Trip'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
