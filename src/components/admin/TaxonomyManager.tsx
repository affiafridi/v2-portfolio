'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToastStore } from '@/store/useToastStore'
import { Plus, X } from 'lucide-react'

interface TaxonomyItem {
  id: string
  name: string
}

interface TaxonomyManagerProps {
  label: string
  description?: string
  apiPath: string
  listKey: string
  placeholder?: string
}

export default function TaxonomyManager({ label, description, apiPath, listKey, placeholder }: TaxonomyManagerProps) {
  const toast = useToastStore((s) => s.add)
  const [items, setItems] = useState<TaxonomyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch(apiPath)
    if (res.ok) {
      const data = await res.json()
      setItems(data[listKey] || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    const name = draft.trim()
    if (!name) return
    setSaving(true)
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setSaving(false)
    if (res.ok) {
      const created = await res.json()
      setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      setDraft('')
    } else {
      const data = await res.json().catch(() => ({}))
      toast(data.error || 'Failed to add', 'error')
    }
  }

  const handleRemove = async (id: string) => {
    const prev = items
    setItems((cur) => cur.filter((i) => i.id !== id))
    const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast('Failed to remove', 'error')
      setItems(prev)
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <Label>{label}</Label>
        {description && <p className="text-xs text-neutral-400">{description}</p>}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {!loading && items.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 py-1 pl-3 pr-1.5 text-xs text-neutral-700"
          >
            {item.name}
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="rounded-full p-0.5 text-neutral-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {!loading && items.length === 0 && (
          <span className="text-xs text-neutral-400">None yet.</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
          placeholder={placeholder}
          className="h-8 max-w-xs text-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={saving || !draft.trim()}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
    </div>
  )
}
