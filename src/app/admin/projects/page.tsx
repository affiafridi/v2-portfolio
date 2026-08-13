import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Plus } from 'lucide-react'
import ProjectActions from './ProjectActions'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <>
      <AdminHeader title="Projects" />
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-neutral-500">{projects.length} projects</p>
          <Link href="/admin/projects/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Project
            </Button>
          </Link>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.type}</TableCell>
                  <TableCell>{project.year}</TableCell>
                  <TableCell>
                    {project.featured && <Badge variant="success">Featured</Badge>}
                  </TableCell>
                  <TableCell>
                    <ProjectActions id={project.id} title={project.title} />
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
