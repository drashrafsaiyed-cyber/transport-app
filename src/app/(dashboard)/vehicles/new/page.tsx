import { VehicleForm } from '@/components/forms/vehicle-form'

export default function NewVehiclePage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Add Vehicle</h1>
      <VehicleForm mode="create" />
    </div>
  )
}
