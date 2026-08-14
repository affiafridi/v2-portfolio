let lastX = 0
let lastY = 0

if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    lastX = e.clientX
    lastY = e.clientY
  })
}

// Chromium can leave the system cursor icon stuck/invisible after a Radix
// popup (Select, Dialog, ...) closes and removes the element the pointer
// was interacting with — it doesn't repaint the cursor until the next real
// mouse move. Re-dispatching a move at the same coordinates forces that
// repaint without the user having to click elsewhere first.
export function refreshCursor() {
  setTimeout(() => {
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: lastX, clientY: lastY, bubbles: true }))
  }, 200)
}
