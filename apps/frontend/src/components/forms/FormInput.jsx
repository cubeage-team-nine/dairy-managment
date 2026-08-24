function FormInput({ label, labelExtra, icon: Icon, error, helperText, className = '', ...props }) {
  return (
    <div>
      {(label || labelExtra) && (
        <div className="mb-2 flex items-center justify-between">
          {label && (
            <label htmlFor={props.id} className="text-sm font-medium text-foreground">
              {label}
            </label>
          )}
          {labelExtra}
        </div>
      )}

      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <Icon className="size-4" />
          </span>
        )}

        <input
          {...props}
          className={`h-12 w-full rounded-sm border border-border bg-card text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary ${
            Icon ? 'pl-10 pr-4' : 'px-4'
          } ${className}`}
        />
      </div>

      {helperText && !error && <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default FormInput
