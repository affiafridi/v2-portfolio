'use client'

import { forwardRef } from 'react'
import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { usePageTransitionStore } from '@/store/usePageTransitionStore'

/* How long the reveal takes to fully cover the screen — must match
   PageTransitionOverlay's own circleTransition.duration (620ms)
   exactly, not just roughly; router.push() fires right at that mark,
   so the actual page swap happens exactly as the circle finishes
   covering the screen, not noticeably before or after it. */
const COVER_DELAY = 620

type TransitionLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | 'href'>

/* Drop-in replacement for next/link — same API (ref included, since a
   couple of call sites track their <Link> for hover-preview/measurement
   purposes), so existing `<Link>` usage across the site doesn't need to
   change beyond the import. Only intercepts real internal-page
   navigations (a plain path, left-click, no modifier keys); anything
   else — external URLs, mailto:/tel:, hash anchors, cmd/ctrl-click for
   a new tab — falls through to native <a> behavior untouched. */
const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, onClick, children, ...rest }, ref) {
    const router   = useRouter()
    const pathname = usePathname()
    const start    = usePageTransitionStore((s) => s.start)

    const hrefStr = typeof href === 'string' ? href : href.pathname ?? ''
    const isInternal = hrefStr.startsWith('/') && !hrefStr.startsWith('//')

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)
      if (
        e.defaultPrevented ||
        !isInternal ||
        hrefStr === pathname ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
        e.button !== 0
      ) return

      e.preventDefault()
      // The reveal circle grows from exactly where the click landed.
      // Keyboard-activated "clicks" (Tab to focus, then Enter/Space)
      // carry no real pointer position — clientX/clientY both come
      // back as 0 for those, which would make the circle originate
      // from the top-left corner instead of wherever the user was
      // actually interacting. Falling back to the link's own center
      // in that case keeps the reveal anchored to the thing that was
      // activated, not an arbitrary corner.
      const isPointerClick = e.clientX !== 0 || e.clientY !== 0
      const origin = isPointerClick
        ? { x: e.clientX, y: e.clientY }
        : (() => {
            const r = e.currentTarget.getBoundingClientRect()
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
          })()
      start(origin)
      setTimeout(() => router.push(hrefStr), COVER_DELAY)
    }

    return (
      <NextLink ref={ref} href={href} onClick={handleClick} {...rest}>
        {children}
      </NextLink>
    )
  }
)

export default TransitionLink
