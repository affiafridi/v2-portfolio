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
          className="absolute inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-sm"
        >
          <LoadingIndicator />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
