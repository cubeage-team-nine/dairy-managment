function DmiRationBreakdown({
  roughageKg,
  roughagePct,
  concentrateKg,
  concentratePct,
  roughagePercent,
  onRatioChange,
}) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
          Ration Breakdown Estimate
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>Ratio:</span>
          <select
            value={roughagePercent}
            onChange={(e) => onRatioChange(Number(e.target.value))}
            className="rounded border border-border bg-background px-2 py-0.5 text-[11px] font-semibold text-foreground outline-none cursor-pointer"
          >
            <option value={70}>70:30 (High Roughage)</option>
            <option value={60}>60:40 (Standard)</option>
            <option value={50}>50:50 (High Yield)</option>
          </select>
        </div>
      </div>

      {/* Progress Item 1: Roughage */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            Roughage (Silage, Hay, Green Fodder)
          </span>
          <span className="font-bold text-foreground">
            {roughageKg} kg ({roughagePct}%)
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-border/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${roughagePct}%` }}
          />
        </div>
      </div>

      {/* Progress Item 2: Concentrates */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">
            Concentrates (Grains, Protein Meal)
          </span>
          <span className="font-bold text-foreground">
            {concentrateKg} kg ({concentratePct}%)
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-border/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-600 transition-all duration-500 ease-out"
            style={{ width: `${concentratePct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default DmiRationBreakdown
