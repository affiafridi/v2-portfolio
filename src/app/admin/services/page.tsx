import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import ServiceActions from './ServiceActions'

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <>
      <AdminHeader title="Services" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-neutral-500">{services.length} services</p>
          <Link href="/admin/services/new">
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Service</Button>
          </Link>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Num</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.num}</TableCell>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell>{s.tag}</TableCell>
                  <TableCell>
                    <ServiceActions id={s.id} title={s.title} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
}
