import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export const getProjects = cache(async () => {
  return prisma.project.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } })
})

export const getFeaturedProjects = cache(async () => {
  return prisma.project.findMany({
    where: { featured: true, published: true },
    orderBy: { sortOrder: 'asc' },
    take: 4,
  })
})

export const getProjectBySlug = cache(async (slug: string) => {
  return prisma.project.findFirst({ where: { slug, published: true } })
})

export const getServices = cache(async () => {
  return prisma.service.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } })
})

export const getServiceBySlug = cache(async (slug: string) => {
  return prisma.service.findFirst({ where: { slug, published: true } })
})

export const getPublishedPosts = cache(async () => {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })
})

export const getPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({ where: { slug, published: true } })
})

export const getStackCategories = cache(async () => {
  return prisma.stackCategory.findMany({
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
})

export const getSiteSettings = cache(async () => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  return (settings?.data as Record<string, unknown>) || {}
})
