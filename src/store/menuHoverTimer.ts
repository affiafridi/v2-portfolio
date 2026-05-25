/**
 * Shared timer for hover-based menu open/close.
 * Prevents glitches when cursor briefly leaves one element before entering another.
 */
let timer: ReturnType<typeof setTimeout> | null = null

export function scheduleMenuClose(fn: () => void, delay = 220) {
  cancelMenuClose()
  timer = setTimeout(fn, delay)
}

export function cancelMenuClose() {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}
