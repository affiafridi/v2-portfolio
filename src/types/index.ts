/* ─── Project ────────────────────────────────────────────────────── */
export interface Project {
  id:          string
  title:       string
  slug:        string
  description: string
  tags:        string[]
  image:       string
  url?:        string
  year:        number
  type?:       string
  /* detail-page fields */
  role?:       string
  client?:     string
  duration?:   string
  challenge?:  string
  features?:   { title: string; desc: string }[]
  gallery?:    string[]
}

/* ─── Cursor ─────────────────────────────────────────────────────── */
export type CursorType = 'default' | 'hover' | 'drag' | 'text' | 'hidden'

/* ─── Navigation ─────────────────────────────────────────────────── */
export interface NavItem {
  label: string
  href:  string
}
