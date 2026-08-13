import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import SubmissionsList from './SubmissionsList'

export default async function SubmissionsPage() {
  const submissions = await prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <>
      <AdminHeader title="Contact Submissions" />
      <SubmissionsList initialSubmissions={JSON.parse(JSON.stringify(submissions))} />
    </>
  )
}
