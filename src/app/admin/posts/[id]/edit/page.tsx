import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminHeader from '@/components/admin/AdminHeader'
import PostForm from '../../PostForm'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } })
  if (!post) notFound()

  return (
    <>
      <AdminHeader title={`Edit: ${post.title}`} />
      <PostForm initial={{ ...post, content: post.content || '', image: post.image || '' }} />
    </>
  )
}
