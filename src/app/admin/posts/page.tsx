import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AdminDataTable, { type AdminTableColumn, type AdminTableRow } from '@/components/admin/AdminDataTable'
import { Plus } from 'lucide-react'
import PostActions from './PostActions'

const columns: AdminTableColumn[] = [
  { header: 'Num' },
  { header: 'Title' },
  { header: 'Category' },
  { header: 'Status' },
  { header: 'Date' },
  { header: 'Actions', headClassName: 'w-[100px]' },
]

export default async function PostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })

  const rows: AdminTableRow[] = posts.map((p) => ({
    id: p.id,
    searchText: `${p.title} ${p.category} ${p.num}`,
    cells: [
      p.num,
      <span key="title" className="font-medium">{p.title}</span>,
      p.category,
      <Badge key="status" variant={p.published ? 'success' : 'secondary'}>
        {p.published ? 'Published' : 'Draft'}
      </Badge>,
      p.date,
      <PostActions key="actions" id={p.id} title={p.title} slug={p.slug} />,
    ],
  }))

  return (
    <>
      <AdminHeader title="Blog Posts" />
      <div className="p-6">
        <AdminDataTable
          columns={columns}
          rows={rows}
          searchPlaceholder="Search posts…"
          emptyMessage="No posts yet."
          headerAction={
            <Link href="/admin/posts/new">
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Post</Button>
            </Link>
          }
        />
      </div>
    </>
  )
}
