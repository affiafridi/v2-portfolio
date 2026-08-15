'use client'

import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Position {
  x: number // 0-100, percentage
  y: number // 0-100, percentage
  zoom: number // 100-250, percentage — extra magnification beyond cover's minimum fit
}

interface PortraitPositionPickerProps {
  imageUrl: string
  value: Position
  onChange: (pos: Position) => void
  label: string
  /** width/height of the preview frame — matches the real frontend crop shape */
  aspectRatio: number
  className?: string
}

/* ─────────────────────────────────────────────────────────────────
   PortraitPositionPicker
   Drag (or click) anywhere in the preview to set the image's focal
   point — the same object-position value the frontend applies via
   CSS custom properties (see HeroSection.tsx / globals.css), so what
   you set here is exactly what visitors see.
   ───────────────────────────────────────────────────────────────── */
export default function PortraitPositionPicker({
  imageUrl, value, onChange, label, aspectRatio, className,
}: PortraitPositionPickerProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const updateFromPointer = useCallback((clientX: number, clientY: number) => {
    const frame = frameRef.current
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100))
    onChange({ ...value, x: Math.round(x), y: Math.round(y) })
  }, [onChange, value])

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId)
    setDragging(true)
    updateFromPointer(e.clientX, e.clientY)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    updateFromPointer(e.clientX, e.clientY)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  return (
    <div className={cn('w-[140px] max-w-full overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 shadow-sm', className)}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
        <span className="font-mono text-[9px] text-neutral-400">{value.x}, {value.y}</span>
      </div>
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative w-full cursor-crosshair overflow-hidden rounded-md bg-neutral-100 ring-1 ring-inset ring-neutral-200 touch-none select-none"
        style={{ aspectRatio: String(aspectRatio) }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: `${value.x}% ${value.y}%`,
              filter: 'grayscale(100%)',
              transform: `scale(${value.zoom / 100})`,
              transformOrigin: `${value.x}% ${value.y}%`,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-neutral-400">
            No image
          </div>
        )}
        {/* Crosshair marker at the focal point */}
        {imageUrl && (
          <div
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45),0_1px_4px_rgba(0,0,0,0.3)]"
            style={{ left: `${value.x}%`, top: `${value.y}%`, background: '#ff4d00' }}
          />
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 overflow-hidden">
        <span className="shrink-0 text-[9px] text-neutral-400">Zoom</span>
        <input
          type="range"
          min={100}
          max={250}
          step={5}
          value={value.zoom}
          onChange={(e) => onChange({ ...value, zoom: Number(e.target.value) })}
          className="h-[3px] min-w-0 flex-1 accent-[#ff4d00]"
        />
        <span className="w-7 shrink-0 text-right font-mono text-[9px] text-neutral-400">{value.zoom}%</span>
      </div>
    </div>
  )
}
