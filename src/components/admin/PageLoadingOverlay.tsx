'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useAdminNavStore } from '@/store/useAdminNavStore'
import LoadingIndicator from '@/components/admin/LoadingIndicator'

export default function PageLoadingOverlay() {
  const loading = useAdminNavStore((s) => s.loading)

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="page-loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          // Fixed to the viewport (not absolute inside the scrollable <main>)
          // so it stays put and covers the whole panel regardless of scroll
          // position — an absolutely-positioned overlay inside an
          // overflow-y-auto container scrolls away with the content instead
          // of staying pinned over it. left-60 matches the sidebar's width.
          className="fixed inset-y-0 left-60 right-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-sm"
        >
          <LoadingIndicator />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
