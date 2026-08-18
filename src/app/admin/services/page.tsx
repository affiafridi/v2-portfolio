import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminDataTable, { type AdminTableColumn, type AdminTableRow } from '@/components/admin/AdminDataTable'
import FeaturedToggle from '@/components/admin/FeaturedToggle'
import { Plus } from 'lucide-react'
import ServiceActions from './ServiceActions'

const columns: AdminTableColumn[] = [
  { header: 'Num' },
  { header: 'Title' },
  { header: 'Tag' },
  { header: 'Featured' },
  { header: 'Status' },
  { header: 'Actions', headClassName: 'w-[130px]' },
]

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } })

  const rows: AdminTableRow[] = services.map((s) => ({
    id: s.id,
    searchText: `${s.title} ${s.tag} ${s.num}`,
    cells: [
      s.num,
      <span key="title" className="font-medium">{s.title}</span>,
      s.tag,
      <FeaturedToggle key="featured" id={s.id} initialFeatured={s.featured} endpoint="/api/admin/services" />,
      <Badge key="status" variant={s.published ? 'success' : 'secondary'}>
        {s.published ? 'Published' : 'Draft'}
      </Badge>,
      <ServiceActions key="actions" id={s.id} title={s.title} slug={s.slug} />,
    ],
  }))

  return (
    <>
      <AdminHeader title="Services" />
      <div className="p-6">
        <AdminDataTable
          columns={columns}
          rows={rows}
          searchPlaceholder="Search services…"
          emptyMessage="No services yet."
          reorderEndpoint="/api/admin/services/reorder"
          headerAction={
            <Link href="/admin/services/new">
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Service</Button>
            </Link>
          }
        />
      </div>
    </>
  )
}
