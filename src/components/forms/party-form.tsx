'use client'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createParty, updateParty } from '@/app/actions/parties'

const schema = z.object({
  partyName: z.string().min(1, 'Required'),
  contactPerson: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  billingAddress: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  party?: Partial<FormData & { id: string }>
  mode: 'create' | 'edit'
}

export function PartyForm({ party, mode }: Props) {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      partyName: party?.partyName ?? '',
      contactPerson: party?.contactPerson ?? '',
      mobile: party?.mobile ?? '',
      address: party?.address ?? '',
      gstNumber: party?.gstNumber ?? '',
      billingAddress: party?.billingAddress ?? '',
      paymentTerms: party?.paymentTerms ?? '',
      notes: party?.notes ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    try {
      if (mode === 'create') {
        await createParty(data)
        toast.success('Party created successfully')
      } else {
        await updateParty(party!.id!, data)
        toast.success('Party updated successfully')
      }
      router.push('/parties')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Party Details</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Party Name *</Label>
            <Input {...register('partyName')} placeholder="Company/Party name" />
            {errors.partyName && <p className="text-xs text-red-500">{errors.partyName.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Contact Person</Label>
            <Input {...register('contactPerson')} placeholder="Contact person name" />
          </div>
          <div className="space-y-1">
            <Label>Mobile</Label>
            <Input {...register('mobile')} placeholder="9876543210" />
          </div>
          <div className="space-y-1">
            <Label>GST Number</Label>
            <Input {...register('gstNumber')} placeholder="27AABCS1429B1ZB" />
          </div>
          <div className="space-y-1">
            <Label>Payment Terms</Label>
            <Input {...register('paymentTerms')} placeholder="Net 30 days" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-1">
            <Label>Address</Label>
            <Textarea {...register('address')} placeholder="Office address" rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Billing Address</Label>
            <Textarea {...register('billingAddress')} placeholder="Billing address (if different)" rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea {...register('notes')} placeholder="Additional notes..." rows={2} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Party' : 'Update Party'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
