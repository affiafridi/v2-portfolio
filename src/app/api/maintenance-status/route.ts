import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/data'

// Polled by middleware, which can't use Prisma directly (Edge runtime) —
// this stays a plain Node.js route handler so it can. force-dynamic
// because otherwise Next may statically optimize a route handler with no
// dynamic API calls, freezing this at its build-time value forever.
export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await getSiteSettings()
  const general = (settings.general as { maintenanceMode?: boolean } | undefined) ?? {}
  return NextResponse.json({ maintenanceMode: !!general.maintenanceMode })
}
