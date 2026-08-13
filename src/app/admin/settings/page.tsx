import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  const data = (settings?.data as Record<string, unknown>) || {}

  return (
    <>
      <AdminHeader title="Site Settings" />
      <SettingsForm initialData={JSON.parse(JSON.stringify(data))} />
    </>
  )
}
