import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import StackManager from './StackManager'

export default async function StackPage() {
  const categories = await prisma.stackCategory.findMany({
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <>
      <AdminHeader title="Tech Stack" />
      <StackManager initialCategories={JSON.parse(JSON.stringify(categories))} />
    </>
  )
}
