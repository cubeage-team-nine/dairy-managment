import { Calculator, RotateCcw, Loader2 } from 'lucide-react'
import { LACTATION_STAGES } from '../dmi.constants.js'

function DmiFormInputs({
  inputs,
  setLiveWeight,
  setMilkYield,
  setMilkFat,
  setLactationStage,
  isCalculating,
  onSubmit,
  onReset,
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Calculator Inputs</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Estimate the daily dry matter intake for optimum dairy cattle feed ration.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Animal Live Weight */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Animal Live Weight (kg)
          </label>
          <input
            type="number"
            min="0"
            max="1500"
            step="1"
            value={inputs.liveWeight}
            onChange={(e) => setLiveWeight(e.target.value)}
            placeholder="0"
            className="h-11 w-full rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground outline-none transition hover:border-foreground/30 focus:border-primary focus:bg-card"
          />
        </div>

        {/* Daily Milk Yield */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Daily Milk Yield (L)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={inputs.milkYield}
            onChange={(e) => setMilkYield(e.target.value)}
            placeholder="0"
            className="h-11 w-full rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground outline-none transition hover:border-foreground/30 focus:border-primary focus:bg-card"
          />
        </div>

        {/* Milk Fat Percentage */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Milk Fat Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={inputs.milkFat}
            onChange={(e) => setMilkFat(e.target.value)}
            placeholder="0.0"
            className="h-11 w-full rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground outline-none transition hover:border-foreground/30 focus:border-primary focus:bg-card"
          />
        </div>

        {/* Lactation Stage / Week */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Lactation Stage / Week
          </label>
          <select
            value={inputs.lactationStage}
            onChange={(e) => setLactationStage(e.target.value)}
            className="h-11 w-full rounded-md border border-border bg-background px-4 text-xs font-medium text-foreground outline-none transition hover:border-foreground/30 focus:border-primary focus:bg-card cursor-pointer"
          >
            {LACTATION_STAGES.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </div>

        {/* Calculate Button & Reset */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isCalculating}
            className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 active:scale-[0.99] shadow-xs disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculating DMI...</span>
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                <span>Calculate Optimal DMI</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isCalculating}
            className="h-12 px-4 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card text-xs font-medium text-muted-foreground transition hover:bg-background hover:text-foreground disabled:opacity-50"
            title="Reset inputs to 0"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default DmiFormInputs
