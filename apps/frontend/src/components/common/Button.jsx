function Button({ children, type = 'button', ...props }) {
  return (
    <button type={type} className="btn" {...props}>
      {children}
    </button>
  )
}

export default Button
