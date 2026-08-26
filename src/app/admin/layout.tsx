import { SessionProvider } from '@/components/admin/SessionProvider'
import AdminShell from '@/components/admin/AdminShell'

// Real incident: /admin/projects, /admin/services, /admin/posts, /admin/
// stack, /admin/submissions, and /admin/media all read the DB directly
// with no dynamic API call anywhere in their tree, so Next statically
// prerendered every one of them at build time. They kept showing that
// exact build-time snapshot forever after — new content created through
// the admin itself never appeared until the next full deploy, since
// none of the CRUD routes revalidate these specific admin paths (only
// the public-facing ones they call revalidatePath() for). Setting this
// once here, on the shared layout, forces every route under /admin to
// render fresh on every request — the route segment config on a layout
// applies to its whole subtree. There's no static-generation benefit to
// lose here: middleware already gates this entire tree behind auth on
// every request regardless, so nothing was ever served from a public
// cache anyway.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin | Portfolio',
  // Belt-and-suspenders alongside robots.txt's Disallow: /admin — that only
  // stops crawling, it doesn't guarantee exclusion if a URL gets discovered
  // via an external link. This tag directly tells search engines not to
  // index the page even if they find it.
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  )
}
