'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { recordPayment } from '@/app/actions/payments'
import { useRouter } from 'next/navigation'
import { CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Props {
  tripId: string
  partyId: string
  partyName: string
  pending: number
}

export function RecordPaymentButton({ tripId, partyId, partyName, pending }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(pending.toFixed(2))
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    if (!amount || Number(amount) <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    setLoading(true)
    try {
      await recordPayment({ tripId, partyId, amount: Number(amount), paymentDate: date, notes })
      toast.success(`Payment of ${formatCurrency(Number(amount))} recorded`)
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="text-xs">
        <CreditCard className="h-3 w-3 mr-1" />Pay
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <p className="text-sm text-muted-foreground">{partyName} - Pending: {formatCurrency(pending)}</p>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Amount (₹)</Label>
              <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <Label>Payment Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
