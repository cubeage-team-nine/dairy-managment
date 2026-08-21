function FormDatePicker({ label, error, ...props }) {
  return (
    <div className="form-field">
      {label && <label>{label}</label>}
      <input type="date" {...props} />
      {error && <span className="form-field__error">{error}</span>}
    </div>
  )
}

export default FormDatePicker
