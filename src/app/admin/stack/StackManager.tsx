'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { useToastStore } from '@/store/useToastStore'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

interface StackItem {
  id: string
  name: string
  slug: string
  color: string
  sortOrder: number
}

interface StackCategory {
  id: string
  num: string
  label: string
  desc: string
  sortOrder: number
  items: StackItem[]
}

export default function StackManager({ initialCategories }: { initialCategories: StackCategory[] }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [categories, setCategories] = useState(initialCategories)
  const [selectedId, setSelectedId] = useState<string | null>(initialCategories[0]?.id || null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [editCat, setEditCat] = useState<StackCategory | null>(null)
  const [catForm, setCatForm] = useState({ num: '', label: '', desc: '', sortOrder: 0 })
  const [showItemForm, setShowItemForm] = useState(false)
  const [editItem, setEditItem] = useState<StackItem | null>(null)
  const [itemForm, setItemForm] = useState({ name: '', slug: '', color: '', sortOrder: 0 })
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'item'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const selected = categories.find((c) => c.id === selectedId)

  const openNewCat = () => {
    setEditCat(null)
    setCatForm({ num: '', label: '', desc: '', sortOrder: 0 })
    setShowCatForm(true)
  }

  const openEditCat = (cat: StackCategory) => {
    setEditCat(cat)
    setCatForm({ num: cat.num, label: cat.label, desc: cat.desc, sortOrder: cat.sortOrder })
    setShowCatForm(true)
  }

  const saveCat = async () => {
    const res = editCat
      ? await fetch(`/api/admin/stack/${editCat.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) })
      : await fetch('/api/admin/stack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) })

    if (!res.ok) {
      toast('Failed to save category', 'error')
      return
    }

    toast(editCat ? 'Category updated' : 'Category created')
    setShowCatForm(false)
    router.refresh()
    const listRes = await fetch('/api/admin/stack')
    const data = await listRes.json()
    setCategories(data)
    if (!editCat && data.length) setSelectedId(data[data.length - 1].id)
  }

  const openNewItem = () => {
    setEditItem(null)
    setItemForm({ name: '', slug: '', color: '', sortOrder: 0 })
    setShowItemForm(true)
  }

  const openEditItem = (item: StackItem) => {
    setEditItem(item)
    setItemForm({ name: item.name, slug: item.slug, color: item.color, sortOrder: item.sortOrder })
    setShowItemForm(true)
  }

  const saveItem = async () => {
    const res = editItem
      ? await fetch(`/api/admin/stack/items/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemForm) })
      : await fetch(`/api/admin/stack/${selectedId}/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemForm) })

    if (!res.ok) {
      toast('Failed to save item', 'error')
      return
    }

    toast(editItem ? 'Item updated' : 'Item created')
    setShowItemForm(false)
    router.refresh()
    const listRes = await fetch('/api/admin/stack')
    const data = await listRes.json()
    setCategories(data)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const res = deleteTarget.type === 'category'
      ? await fetch(`/api/admin/stack/${deleteTarget.id}`, { method: 'DELETE' })
      : await fetch(`/api/admin/stack/items/${deleteTarget.id}`, { method: 'DELETE' })

    setDeleting(false)
    setDeleteTarget(null)

    if (!res.ok) {
      toast(`Failed to delete ${deleteTarget.type}`, 'error')
      return
    }

    if (deleteTarget.type === 'category' && selectedId === deleteTarget.id) setSelectedId(null)
    toast(deleteTarget.type === 'category' ? 'Category deleted' : 'Item deleted')
    router.refresh()
    const listRes = await fetch('/api/admin/stack')
    const data = await listRes.json()
    setCategories(data)
  }

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {/* Categories panel */}
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Categories</CardTitle>
          <Button size="sm" variant="outline" onClick={openNewCat}><Plus className="mr-1 h-3 w-3" /> Add</Button>
        </CardHeader>
        <CardContent className="space-y-1 p-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${selectedId === cat.id ? 'bg-neutral-100 font-medium' : 'hover:bg-neutral-50'}`}
              onClick={() => setSelectedId(cat.id)}
            >
              <span>{cat.num}. {cat.label}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); openEditCat(cat) }}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'category', id: cat.id, name: cat.label }) }}><Trash2 className="h-3 w-3 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Items panel */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">{selected ? `${selected.label} Items` : 'Select a category'}</CardTitle>
          {selected && <Button size="sm" variant="outline" onClick={openNewItem}><Plus className="mr-1 h-3 w-3" /> Add Item</Button>}
        </CardHeader>
        <CardContent>
          {selected && selected.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selected.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="font-mono text-xs">{item.slug}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded" style={{ backgroundColor: `#${item.color}` }} />
                        <span className="font-mono text-xs">#{item.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.sortOrder}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditItem(item)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : selected ? (
            <p className="py-8 text-center text-sm text-neutral-400">No items yet. Add one above.</p>
          ) : (
            <p className="py-8 text-center text-sm text-neutral-400">Select a category to manage its items.</p>
          )}
        </CardContent>
      </Card>

      {/* Category form dialog */}
      {showCatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editCat ? 'Edit Category' : 'New Category'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCatForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Number</Label>
                <Input value={catForm.num} onChange={(e) => setCatForm({ ...catForm, num: e.target.value })} placeholder="01" />
              </div>
              <div className="space-y-1">
                <Label>Label</Label>
                <Input value={catForm.label} onChange={(e) => setCatForm({ ...catForm, label: e.target.value })} placeholder="Frontend" />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Input value={catForm.desc} onChange={(e) => setCatForm({ ...catForm, desc: e.target.value })} placeholder="UI & Styling" />
              </div>
              <div className="space-y-1">
                <Label>Sort Order</Label>
                <Input type="number" value={catForm.sortOrder} onChange={(e) => setCatForm({ ...catForm, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
              <Button className="w-full" onClick={saveCat}><Check className="mr-2 h-4 w-4" /> Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Item form dialog */}
      {showItemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editItem ? 'Edit Item' : 'New Item'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowItemForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="React" />
              </div>
              <div className="space-y-1">
                <Label>Slug (SimpleIcons)</Label>
                <Input value={itemForm.slug} onChange={(e) => setItemForm({ ...itemForm, slug: e.target.value })} placeholder="react" />
              </div>
              <div className="space-y-1">
                <Label>Color (hex without #)</Label>
                <Input value={itemForm.color} onChange={(e) => setItemForm({ ...itemForm, color: e.target.value })} placeholder="61DAFB" />
              </div>
              <div className="space-y-1">
                <Label>Sort Order</Label>
                <Input type="number" value={itemForm.sortOrder} onChange={(e) => setItemForm({ ...itemForm, sortOrder: parseInt(e.target.value) || 0 })} />
              </div>
              <Button className="w-full" onClick={saveItem}><Check className="mr-2 h-4 w-4" /> Save</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title={`Delete "${deleteTarget?.name}"?`}
        description={deleteTarget?.type === 'category' ? 'This will delete the category and all its items.' : 'This action cannot be undone.'}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
