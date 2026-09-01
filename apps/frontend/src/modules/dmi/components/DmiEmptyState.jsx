import { Calculator } from 'lucide-react'

function DmiEmptyState() {
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-background p-10 text-center flex flex-col items-center justify-center space-y-3">
      <div className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground">
        <Calculator className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">
        No Calculation Yet
      </h3>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        Enter animal live weight, milk yield, and fat percentage, then click{' '}
        <span className="font-semibold text-primary">"Calculate Optimal DMI"</span> to view recommendation.
      </p>
    </div>
  )
}

export default DmiEmptyState
