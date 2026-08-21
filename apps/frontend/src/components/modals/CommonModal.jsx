function CommonModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="common-modal-overlay" onClick={onClose}>
      <div className="common-modal" onClick={(e) => e.stopPropagation()}>
        <div className="common-modal__header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="common-modal__body">{children}</div>
      </div>
    </div>
  )
}

export default CommonModal
