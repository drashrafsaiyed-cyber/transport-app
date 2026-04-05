import { PartyForm } from '@/components/forms/party-form'

export default function NewPartyPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Add Party</h1>
      <PartyForm mode="create" />
    </div>
  )
}
