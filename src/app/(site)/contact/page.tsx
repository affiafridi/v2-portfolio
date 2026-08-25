'use client'

import { useEffect } from 'react'
import { useContactStore } from '@/store/useContactStore'

/* ── /contact route
   Opening this URL directly (e.g. shared link, refresh) auto-opens
   the ContactModal. The modal's URL-sync hook will push /contact
   into history and restore the previous path on close. */
export default function ContactPage() {
  const { open } = useContactStore()

  useEffect(() => {
    open()
  }, [open])

  return null
}
