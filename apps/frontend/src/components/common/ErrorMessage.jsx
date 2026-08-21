function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  )
}

export default ErrorMessage
