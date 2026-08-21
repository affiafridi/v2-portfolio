export interface RevealWord {
  w: string
  italic?: boolean
  accent?: boolean
}

/* Turns admin-typed prose with inline markup into the per-word array the
   scroll-reveal sections (About, Footer) already render:
     *word word word*   -> each word italic
     **word**           -> that word accent (orange + image-hover)
   Chosen over a true per-word array editor (a row per word, with italic/
   accent checkboxes) because this heading is a sentence someone is
   writing, not a list — typing "*taught myself*" reads the same as what
   you're actually doing, where ticking checkboxes next to isolated words
   doesn't. Reuses markdown's own emphasis/strong convention (single vs
   double) rather than inventing new symbols, since most people already
   have some intuition for it even without knowing markdown by name.

   A span can run across several words — the opening/closing marker only
   has to appear on the first/last word of the span, every word between
   them inherits it — so this can't be a per-token regex replace; it has
   to track "am I currently inside a span" across the whole scan. */
export function parseWordReveal(text: string): RevealWord[] {
  const tokens = text.trim().split(/\s+/).filter(Boolean)
  const words: RevealWord[] = []
  let mode: 'normal' | 'italic' | 'accent' = 'normal'

  for (let token of tokens) {
    let italic = mode === 'italic'
    let accent = mode === 'accent'

    if (mode === 'normal') {
      if (token.startsWith('**')) {
        accent = true
        token = token.slice(2)
        if (token.length > 2 && token.endsWith('**')) {
          token = token.slice(0, -2) // opens and closes within this one word
        } else {
          mode = 'accent'
        }
      } else if (token.startsWith('*')) {
        italic = true
        token = token.slice(1)
        if (token.length > 1 && token.endsWith('*')) {
          token = token.slice(0, -1)
        } else {
          mode = 'italic'
        }
      }
    } else if (mode === 'italic' && token.endsWith('*')) {
      token = token.slice(0, -1)
      mode = 'normal'
    } else if (mode === 'accent' && token.endsWith('**')) {
      token = token.slice(0, -2)
      mode = 'normal'
    }

    words.push({ w: token, ...(italic ? { italic: true } : {}), ...(accent ? { accent: true } : {}) })
  }

  return words
}

/* Inverse of the above — turns a stored word array back into markup text,
   for re-populating the admin textarea when editing existing content. */
export function serializeWordReveal(words: RevealWord[]): string {
  // Wraps contiguous italic runs in a single pair of asterisks rather
  // than one pair per word, matching how it's meant to be typed.
  const out: string[] = []
  let i = 0
  while (i < words.length) {
    const cur = words[i]
    if (cur.accent) {
      out.push(`**${cur.w}**`)
      i++
      continue
    }
    if (cur.italic) {
      const run: string[] = []
      while (i < words.length && words[i].italic && !words[i].accent) {
        run.push(words[i].w)
        i++
      }
      out.push(`*${run.join(' ')}*`)
      continue
    }
    out.push(cur.w)
    i++
  }
  return out.join(' ')
}
