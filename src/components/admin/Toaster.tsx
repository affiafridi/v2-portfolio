'use client'

import { useToastStore } from '@/store/useToastStore'

export default function Toaster() {
  const { toasts, remove } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2 ${
            t.type === 'success'
              ? 'bg-neutral-900 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <span>{t.type === 'success' ? '✓' : '!'}</span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => remove(t.id)}
            className="text-white/60 hover:text-white ml-2"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
