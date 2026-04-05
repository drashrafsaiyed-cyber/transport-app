import { prisma } from '@/lib/prisma'
import { SettingsForm } from './settings-form'

async function getSettings() {
  try {
    return await prisma.appSetting.findUnique({ where: { id: 'default' } })
  } catch { return null }
}

export default async function SettingsPage() {
  const settings = await getSettings()
  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  )
}
