function TableActions({ onEdit, onDelete }) {
  return (
    <div className="table-actions">
      {onEdit && (
        <button type="button" onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  )
}

export default TableActions
