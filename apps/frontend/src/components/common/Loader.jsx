function Loader() {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-label="Loading">
      <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </div>
  )
}

export default Loader
