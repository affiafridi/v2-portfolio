'use client'

import type { CSSProperties } from 'react'

/* Drop-in replacement for the decorative animated GIFs used around the
   site (nav thumbnails, contact/footer flourishes, 404, maintenance).

   GIF has no interframe compression — every frame stores a full 256-colour
   image — so these were shipping 18.9MB for eight short loops. Re-encoded
   as H.264 they total 1.5MB at visually identical quality, a ~13x cut that
   dominates every other performance lever on this site.

   autoPlay + muted + playsInline is the exact combination browsers require
   to allow silent autoplay without a user gesture; playsInline specifically
   stops iOS Safari from promoting the video to a fullscreen player. The
   video is decorative, so it's hidden from assistive tech and taken out of
   the tab order rather than announced as media.

   Note on `preload`: with autoPlay set, browsers fetch the file regardless
   of this hint, so it is NOT a way to defer loading. Anything that should
   genuinely not load yet has to be conditionally rendered by the caller
   (see MenuOverlay, which holds its thumbnails back until the menu is
   first opened). */
export default function LoopingVideo({
  src,
  className,
  style,
  fill = false,
  preload = 'auto',
}: {
  src:        string
  className?: string
  style?:     CSSProperties
  /* Mirrors next/image's `fill`: absolutely covers the nearest
     positioned ancestor, so existing wrappers keep working unchanged. */
  fill?:      boolean
  preload?:   'none' | 'metadata' | 'auto'
}) {
  const fillStyle: CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
    : {}

  return (
    <video
      src={src}
      className={className}
      style={{ ...fillStyle, ...style }}
      autoPlay
      loop
      muted
      playsInline
      preload={preload}
      aria-hidden
      tabIndex={-1}
      disablePictureInPicture
    />
  )
}
