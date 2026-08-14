'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { useToastStore } from '@/store/useToastStore'
import { cn } from '@/lib/utils'

export interface AdminTableColumn {
  header: string
  headClassName?: string
}

export interface AdminTableRow {
  id: string
  searchText: string
  cells: ReactNode[]
}

interface AdminDataTableProps {
  columns: AdminTableColumn[]
  rows: AdminTableRow[]
  searchPlaceholder?: string
  pageSize?: number
  emptyMessage?: string
  headerAction?: ReactNode
  /** When set, rows can be drag-reordered and the new order is PATCHed here as { ids: string[] }. */
  reorderEndpoint?: string
}

function SortableRow({ row, canDrag, children }: { row: AdminTableRow; canDrag: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id })

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <TableCell className="w-8 px-2">
        <button
          type="button"
          {...(canDrag ? attributes : {})}
          {...(canDrag ? listeners : {})}
          disabled={!canDrag}
          title={canDrag ? 'Drag to reorder' : 'Clear search and pagination to reorder'}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md text-neutral-300',
            canDrag ? 'cursor-grab hover:bg-neutral-100 hover:text-neutral-500 active:cursor-grabbing' : 'cursor-not-allowed opacity-40'
          )}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  )
}

export default function AdminDataTable({
  columns,
  rows,
  searchPlaceholder = 'Search…',
  pageSize = 10,
  emptyMessage = 'No results found.',
  headerAction,
  reorderEndpoint,
}: AdminDataTableProps) {
  const router = useRouter()
  const toast = useToastStore((s) => s.add)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [orderedRows, setOrderedRows] = useState(rows)

  useEffect(() => { setOrderedRows(rows) }, [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orderedRows
    return orderedRows.filter((row) => row.searchText.toLowerCase().includes(q))
  }, [orderedRows, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const canReorder = !!reorderEndpoint && !query && totalPages <= 1

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !canReorder || !reorderEndpoint) return

    const oldIndex = orderedRows.findIndex((r) => r.id === active.id)
    const newIndex = orderedRows.findIndex((r) => r.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const previous = orderedRows
    const next = arrayMove(orderedRows, oldIndex, newIndex)
    setOrderedRows(next)

    const res = await fetch(reorderEndpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((r) => r.id) }),
    })

    if (!res.ok) {
      setOrderedRows(previous)
      toast('Failed to save new order', 'error')
    } else {
      router.refresh()
    }
  }

  const handleSearchChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {headerAction}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white">
        <DndContext id="admin-table-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                {reorderEndpoint && <TableHead className="w-8 px-2" />}
                {columns.map((col, i) => (
                  <TableHead key={i} className={col.headClassName}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (reorderEndpoint ? 1 : 0)} className="py-12 text-center text-sm text-neutral-400">
                    {query ? `No results for "${query}"` : emptyMessage}
                  </TableCell>
                </TableRow>
              ) : reorderEndpoint ? (
                <SortableContext items={paged.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                  {paged.map((row) => (
                    <SortableRow key={row.id} row={row} canDrag={canReorder}>
                      {row.cells.map((cell, i) => (
                        <TableCell key={i}>{cell}</TableCell>
                      ))}
                    </SortableRow>
                  ))}
                </SortableContext>
              ) : (
                paged.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell, i) => (
                      <TableCell key={i}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
          <span>
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[88px] text-center text-xs font-medium text-neutral-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
