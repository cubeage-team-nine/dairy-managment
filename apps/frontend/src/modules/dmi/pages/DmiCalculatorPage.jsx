import { useState } from 'react'
import { Search, Bell, X, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../../core/hooks/useAuth.js'
import { ROLE_LABELS } from '../../../core/constants/app.constants.js'

import { useDmiCalculator } from '../dmi.hooks.js'
import DmiFormInputs from '../components/DmiFormInputs.jsx'
import DmiResultCard from '../components/DmiResultCard.jsx'
import DmiRationBreakdown from '../components/DmiRationBreakdown.jsx'
import DmiEmptyState from '../components/DmiEmptyState.jsx'

function DmiCalculatorPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const {
    inputs,
    setLiveWeight,
    setMilkYield,
    setMilkFat,
    setLactationStage,
    results,
    isCalculating,
    handleCalculate,
    handleReset,
    updateRoughageRatio,
  } = useDmiCalculator()

  const userName = user?.name || 'Rajesh Kumar'
  const userRoleText = user?.role ? ROLE_LABELS[user.role] : 'Farmer'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="-m-6 min-h-screen bg-background text-foreground">
      {/* ==============================================
          TOP HEADER BAR (Matching Figma Top Bar)
      =============================================== */}
      <header className="flex flex-col gap-4 border-b border-border bg-card px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          Dry Matter Intake (DMI) Calculator
        </h1>

        <div className="flex items-center gap-5">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search animals, tasks, records..."
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-xs text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Notification Button */}
          <button
            type="button"
            className="relative rounded-full p-2 text-muted-foreground hover:bg-background"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-xs">
              {userInitial}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-foreground">{userName}</span>
              <span className="text-[10px] text-muted-foreground">{userRoleText}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ==============================================
          MAIN CONTENT AREA (Matched to 1200 Fill Canvas)
      =============================================== */}
      <main className="p-6 md:p-8 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* ==============================================
              LEFT CARD: CALCULATOR INPUTS
          =============================================== */}
          <div>
            <DmiFormInputs
              inputs={inputs}
              setLiveWeight={setLiveWeight}
              setMilkYield={setMilkYield}
              setMilkFat={setMilkFat}
              setLactationStage={setLactationStage}
              isCalculating={isCalculating}
              onSubmit={handleCalculate}
              onReset={handleReset}
            />
          </div>

          {/* ==============================================
              RIGHT CARD: CALCULATION RESULTS
          =============================================== */}
          <div className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground font-heading">Calculation Results</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on National Research Council (NRC) standards.
              </p>
            </div>

            {/* Loading Pulse State */}
            {isCalculating && (
              <div className="space-y-6 animate-pulse py-4">
                <div className="h-32 rounded-xl bg-primary-soft/60 flex flex-col justify-center p-6 space-y-3">
                  <div className="h-4 w-40 bg-primary/20 rounded" />
                  <div className="h-10 w-28 bg-primary/20 rounded" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-48 bg-border/60 rounded" />
                  <div className="h-3 w-full bg-border/60 rounded" />
                  <div className="h-3 w-full bg-border/60 rounded" />
                </div>
              </div>
            )}

            {/* Empty State before Calculate is clicked */}
            {!results && !isCalculating && <DmiEmptyState />}

            {/* Results Displayed when available */}
            {results && !isCalculating && (
              <div className="space-y-6 transition-all duration-300 ease-out">
                <DmiResultCard dmi={results.dmi} bwPercent={results.bwPercent} />

                <DmiRationBreakdown
                  roughageKg={results.roughageKg}
                  roughagePct={results.roughagePct}
                  concentrateKg={results.concentrateKg}
                  concentratePct={results.concentratePct}
                  roughagePercent={inputs.roughagePercent}
                  onRatioChange={updateRoughageRatio}
                />

                {/* Disclaimer / Warning Footer Note */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                    <p>
                      DMI may vary based on weather, water quality, feed digestibility, and overall physiological health of the cows.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  )
}

export default DmiCalculatorPage
