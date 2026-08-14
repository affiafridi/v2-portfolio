import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminDataTable, { type AdminTableColumn, type AdminTableRow } from '@/components/admin/AdminDataTable'
import FeaturedToggle from '@/components/admin/FeaturedToggle'
import { Plus } from 'lucide-react'
import ProjectActions from './ProjectActions'

const columns: AdminTableColumn[] = [
  { header: 'Title' },
  { header: 'Type' },
  { header: 'Year' },
  { header: 'Featured' },
  { header: 'Status' },
  { header: 'Actions', headClassName: 'w-[130px]' },
]

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { sortOrder: 'asc' } })

  const rows: AdminTableRow[] = projects.map((p) => ({
    id: p.id,
    searchText: `${p.title} ${p.type ?? ''}`,
    cells: [
      <span key="title" className="font-medium">{p.title}</span>,
      p.type,
      p.year,
      <FeaturedToggle key="featured" id={p.id} initialFeatured={p.featured} />,
      <Badge key="status" variant={p.published ? 'success' : 'secondary'}>
        {p.published ? 'Published' : 'Draft'}
      </Badge>,
      <ProjectActions key="actions" id={p.id} title={p.title} slug={p.slug} />,
    ],
  }))

  return (
    <>
      <AdminHeader title="Projects" />
      <div className="p-6">
        <AdminDataTable
          columns={columns}
          rows={rows}
          searchPlaceholder="Search projects…"
          emptyMessage="No projects yet."
          reorderEndpoint="/api/admin/projects/reorder"
          headerAction={
            <Link href="/admin/projects/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Project
              </Button>
            </Link>
          }
        />
      </div>
    </>
  )
}
