import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PartyForm } from '@/components/forms/party-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

async function getParty(id: string) {
  try {
    return await prisma.party.findUnique({ where: { id } })
  } catch { return null }
}

export default async function EditPartyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const party = await getParty(id)
  if (!party) notFound()

  const partyData = {
    id: party.id,
    partyName: party.partyName,
    contactPerson: party.contactPerson ?? undefined,
    mobile: party.mobile ?? undefined,
    address: party.address ?? undefined,
    gstNumber: party.gstNumber ?? undefined,
    billingAddress: party.billingAddress ?? undefined,
    paymentTerms: party.paymentTerms ?? undefined,
    notes: party.notes ?? undefined,
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/parties/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Party</h1>
      </div>
      <PartyForm mode="edit" party={partyData} />
    </div>
  )
}
