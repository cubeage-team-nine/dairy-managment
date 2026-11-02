import { useState } from 'react'
import { MoreHorizontal, Pencil, Eye, Trash2 } from 'lucide-react'

function TableActions({ onEdit, onView, onDelete }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center justify-end gap-2">
      <button type="button" onClick={onEdit} title="Edit" className="rounded-md border p-2 hover:bg-green-50">
        <Pencil size={16} />
      </button>

      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className="rounded-md border p-2 hover:bg-gray-100">
          <MoreHorizontal size={18} />
        </button>

        {open && (
          <div className="absolute right-0 z-20 mt-1 w-32 rounded-md border bg-white py-1 shadow-lg">
            <button type="button" onClick={() => { setOpen(false); onView?.() }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100">
              <Eye size={14} /> View
            </button>
            <button type="button" onClick={() => { setOpen(false); onDelete?.() }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TableActions
