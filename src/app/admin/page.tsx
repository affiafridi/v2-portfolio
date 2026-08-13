import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Briefcase, FileText, MessageSquare } from 'lucide-react'

export default async function AdminDashboard() {
  const [projectCount, serviceCount, postCount, unreadCount] = await Promise.all([
    prisma.project.count(),
    prisma.service.count(),
    prisma.post.count(),
    prisma.contactSubmission.count({ where: { read: false, archived: false } }),
  ])

  const stats = [
    { label: 'Projects', count: projectCount, icon: FolderKanban },
    { label: 'Services', count: serviceCount, icon: Briefcase },
    { label: 'Blog Posts', count: postCount, icon: FileText },
    { label: 'Unread Messages', count: unreadCount, icon: MessageSquare },
  ]

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-neutral-500">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
