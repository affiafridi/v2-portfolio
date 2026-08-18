'use client'

import { forwardRef } from 'react'
import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { usePageTransitionStore } from '@/store/usePageTransitionStore'

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
      /* Fire the navigation immediately instead of waiting out the
         cover animation first (the previous COVER_DELAY-timed call).
         That delay assumed navigation itself was ~instant, so router.
         push() was scheduled to land right as the circle finished
         covering the screen. When a route actually has to do work
         first — a dynamic project page's own DB query, or a route
         that hasn't been prefetched — the fetch didn't even START
         until the cover animation was already done, so the "loading"
         dots kept spinning with no visible cause: from the user's
         side, the animation had finished and the page just sat there
         before eventually redirecting.
         Starting the fetch now gives it the full cover-animation
         window as real head-start time instead of dead time. This is
         safe against the opposite problem (revealing before the
         cover animation has visually finished, on a fast/cached
         route that resolves in a few ms) because PageTransitionOverlay's
         reveal is gated on the cover duration having elapsed as well
         as the route having changed — see its onPathnameChange
         effect. */
      router.push(hrefStr)
    }

    return (
      <NextLink ref={ref} href={href} onClick={handleClick} {...rest}>
        {children}
      </NextLink>
    )
  }
)

export default TransitionLink
