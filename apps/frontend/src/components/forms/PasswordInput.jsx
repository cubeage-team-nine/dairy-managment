import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

function PasswordInput({ label, labelExtra, error, helperText, className = '', ...props }) {
  const [isVisible, setIsVisible] = useState(false)

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
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
          <Lock className="size-4" />
        </span>

        <input
          {...props}
          type={isVisible ? 'text' : 'password'}
          className={`h-12 w-full rounded-sm border border-border bg-card pl-10 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:border-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
        />

        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center px-3.5 text-muted-foreground transition hover:text-foreground"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          {isVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>

      {helperText && !error && <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default PasswordInput
