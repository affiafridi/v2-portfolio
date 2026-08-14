import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACC = '#ff4d00'

interface LoadingIndicatorProps {
  label?: string
  className?: string
}

export default function LoadingIndicator({ label = 'Loading', className }: LoadingIndicatorProps) {
  return (
    <div
      className={cn('flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5', className)}
      style={{ background: `${ACC}12` }}
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: ACC }} />
      <span className="text-[11px] font-semibold tracking-wide" style={{ color: ACC }}>
        {label}
      </span>
    </div>
  )
}
