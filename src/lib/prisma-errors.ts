import { Prisma } from '@prisma/client'

// Real incident: creating a project/service/post with a title that
// slugified to one already in use threw an unhandled Prisma unique-
// constraint error, which the generic catch block in each route turned
// into a bare 500 with no indication of what actually went wrong —
// readable only as "Internal Server Error" in the browser console.
// Centralized here since projects, services, and posts all hit the same
// failure mode on their slug field.
export function friendlyPrismaError(e: unknown, fallback: string): { message: string; status: number } {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    const target = Array.isArray(e.meta?.target) ? (e.meta.target as string[]).join(', ') : 'value'
    return { message: `That ${target} is already in use — try a different title or slug.`, status: 409 }
  }
  return { message: e instanceof Error ? e.message : fallback, status: 500 }
}
