'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import ColorPickerInput from '@/components/admin/ColorPickerInput'
import { useToastStore } from '@/store/useToastStore'
import { Plus, Pencil, Trash2, GripVertical, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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

function SortableCategory({
  cat,
  index,
  active,
  onSelect,
  onEdit,
  onDelete,
}: {
  cat: StackCategory
  index: number
  active: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      onClick={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-1 rounded-md px-2 py-2 text-sm transition-colors',
        active ? 'bg-neutral-100 font-medium' : 'hover:bg-neutral-50'
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500 active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      {/* Derived from list position, not the stored num — stays correct
          the instant you drag, without waiting on the reorder round-trip. */}
      <span className="flex-1 truncate">{String(index + 1).padStart(2, '0')}. {cat.label}</span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onEdit() }}><Pencil className="h-3 w-3" /></Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onDelete() }}><Trash2 className="h-3 w-3 text-red-500" /></Button>
      </div>
    </div>
  )
}

function SortableItemRow({ item, onEdit, onDelete }: { item: StackItem; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <TableRow ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}>
      <TableCell className="w-8 px-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <img
            src={`https://cdn.simpleicons.org/${item.slug}/${item.color}`}
            alt=""
            className="h-4 w-4"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
          />
          <span className="font-medium">{item.name}</span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-xs">{item.slug}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded" style={{ backgroundColor: `#${item.color}` }} />
          <span className="font-mono text-xs">#{item.color}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}><Trash2 className="h-3 w-3 text-red-500" /></Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default function StackManager({ initialCategories }: { initialCategories: StackCategory[] }) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [categories, setCategories] = useState(initialCategories)
  const [selectedId, setSelectedId] = useState<string | null>(initialCategories[0]?.id || null)
  const [showCatForm, setShowCatForm] = useState(false)
  const [editCat, setEditCat] = useState<StackCategory | null>(null)
  const [catForm, setCatForm] = useState({ label: '', desc: '' })
  const [showItemForm, setShowItemForm] = useState(false)
  const [editItem, setEditItem] = useState<StackItem | null>(null)
  const [itemForm, setItemForm] = useState({ name: '', slug: '', color: '' })
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'item'; id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { setCategories(initialCategories) }, [initialCategories])

  const selected = categories.find((c) => c.id === selectedId)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const refreshList = async () => {
    const listRes = await fetch('/api/admin/stack')
    const data = await listRes.json()
    setCategories(data)
    return data as StackCategory[]
  }

  const openNewCat = () => {
    setEditCat(null)
    setCatForm({ label: '', desc: '' })
    setShowCatForm(true)
  }

  const openEditCat = (cat: StackCategory) => {
    setEditCat(cat)
    setCatForm({ label: cat.label, desc: cat.desc })
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
    const data = await refreshList()
    if (!editCat && data.length) setSelectedId(data[data.length - 1].id)
  }

  const openNewItem = () => {
    setEditItem(null)
    setItemForm({ name: '', slug: '', color: '' })
    setShowItemForm(true)
  }

  const openEditItem = (item: StackItem) => {
    setEditItem(item)
    setItemForm({ name: item.name, slug: item.slug, color: item.color })
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
    await refreshList()
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
    await refreshList()
  }

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const previous = categories
    const next = arrayMove(categories, oldIndex, newIndex)
    setCategories(next)

    const res = await fetch('/api/admin/stack/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((c) => c.id) }),
    })

    if (!res.ok) {
      setCategories(previous)
      toast('Failed to save new order', 'error')
    } else {
      router.refresh()
    }
  }

  const handleItemDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !selected) return

    const oldIndex = selected.items.findIndex((i) => i.id === active.id)
    const newIndex = selected.items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const previous = categories
    const nextItems = arrayMove(selected.items, oldIndex, newIndex)
    setCategories((prev) => prev.map((c) => (c.id === selected.id ? { ...c, items: nextItems } : c)))

    const res = await fetch('/api/admin/stack/items/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: nextItems.map((i) => i.id) }),
    })

    if (!res.ok) {
      setCategories(previous)
      toast('Failed to save new order', 'error')
    } else {
      router.refresh()
    }
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
          <DndContext id="stack-categories-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {categories.map((cat, index) => (
                <SortableCategory
                  key={cat.id}
                  cat={cat}
                  index={index}
                  active={selectedId === cat.id}
                  onSelect={() => setSelectedId(cat.id)}
                  onEdit={() => openEditCat(cat)}
                  onDelete={() => setDeleteTarget({ type: 'category', id: cat.id, name: cat.label })}
                />
              ))}
            </SortableContext>
          </DndContext>
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
            <DndContext id="stack-items-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 px-2" />
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext items={selected.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                    {selected.items.map((item) => (
                      <SortableItemRow
                        key={item.id}
                        item={item}
                        onEdit={() => openEditItem(item)}
                        onDelete={() => setDeleteTarget({ type: 'item', id: item.id, name: item.name })}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          ) : selected ? (
            <p className="py-8 text-center text-sm text-neutral-400">No items yet. Add one above.</p>
          ) : (
            <p className="py-8 text-center text-sm text-neutral-400">Select a category to manage its items.</p>
          )}
        </CardContent>
      </Card>

      {/* Category form dialog */}
      <Dialog open={showCatForm} onOpenChange={setShowCatForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCat ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={catForm.label} onChange={(e) => setCatForm({ ...catForm, label: e.target.value })} placeholder="Frontend" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={catForm.desc} onChange={(e) => setCatForm({ ...catForm, desc: e.target.value })} placeholder="UI & Styling" />
            </div>
            <Button className="w-full" onClick={saveCat}><Check className="mr-2 h-4 w-4" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item form dialog */}
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Item' : 'New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                {itemForm.slug ? (
                  <img
                    src={`https://cdn.simpleicons.org/${itemForm.slug}/${/^[0-9a-fA-F]{6}$/.test(itemForm.color) ? itemForm.color : '000000'}`}
                    alt=""
                    className="h-6 w-6"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                  />
                ) : (
                  <span className="text-[10px] text-neutral-400">Icon</span>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                Icons load automatically from <span className="font-mono">simpleicons.org</span> using the slug and color below — no upload needed.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="React" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (SimpleIcons)</Label>
              <Input value={itemForm.slug} onChange={(e) => setItemForm({ ...itemForm, slug: e.target.value })} placeholder="react" />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <ColorPickerInput value={itemForm.color} onChange={(hex) => setItemForm({ ...itemForm, color: hex })} />
            </div>
            <Button className="w-full" onClick={saveItem}><Check className="mr-2 h-4 w-4" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>

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
