import { useState } from 'react'

/**
 * Calculates Dry Matter Intake (DMI) based on NRC 2001 standards.
 */
export function calculateDmi({
  liveWeight,
  milkYield,
  milkFat,
  lactationStage = 'mid',
  roughagePercent = 60,
}) {
  const bw = parseFloat(liveWeight) || 0
  const milk = parseFloat(milkYield) || 0
  const fat = parseFloat(milkFat) || 0

  if (bw <= 0) {
    return {
      dmi: '0.0',
      bwPercent: '0.0',
      roughageKg: '0.0',
      concentrateKg: '0.0',
      roughagePct: roughagePercent,
      concentratePct: 100 - roughagePercent,
    }
  }

  // 4% FCM (Fat-Corrected Milk)
  const fcm = 0.4 * milk + 15 * (fat / 100) * milk
  const metabolicBw = Math.pow(bw, 0.75)
  let baseDmi = 0.096 * metabolicBw + 0.372 * fcm

  // Lactation stage adjustment factor
  if (lactationStage === 'early') {
    baseDmi *= 0.92
  } else if (lactationStage === 'mid') {
    baseDmi *= 1.0
  } else if (lactationStage === 'late') {
    baseDmi *= 0.98
  } else if (lactationStage === 'dry') {
    baseDmi = bw * 0.019
  }

  const finalDmi = Math.max(0, baseDmi)
  const bwPct = bw > 0 ? (finalDmi / bw) * 100 : 0
  const rPct = Math.min(100, Math.max(0, parseFloat(roughagePercent) || 60))
  const cPct = 100 - rPct

  const roughageKg = finalDmi * (rPct / 100)
  const concentrateKg = finalDmi * (cPct / 100)

  return {
    dmi: finalDmi.toFixed(1),
    bwPercent: bwPct.toFixed(1),
    roughageKg: roughageKg.toFixed(1),
    concentrateKg: concentrateKg.toFixed(1),
    roughagePct: rPct,
    concentratePct: cPct,
  }
}

export function useDmiCalculator() {
  const [liveWeight, setLiveWeight] = useState('')
  const [milkYield, setMilkYield] = useState('')
  const [milkFat, setMilkFat] = useState('')
  const [lactationStage, setLactationStage] = useState('mid')
  const [roughagePercent, setRoughagePercent] = useState(60)

  const [results, setResults] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = (e) => {
    if (e) e.preventDefault()
    setIsCalculating(true)

    setTimeout(() => {
      const res = calculateDmi({
        liveWeight,
        milkYield,
        milkFat,
        lactationStage,
        roughagePercent,
      })
      setResults(res)
      setIsCalculating(false)
    }, 450)
  }

  const handleReset = () => {
    setLiveWeight('')
    setMilkYield('')
    setMilkFat('')
    setLactationStage('mid')
    setRoughagePercent(60)
    setResults(null)
  }

  const updateRoughageRatio = (newPercent) => {
    setRoughagePercent(newPercent)
    if (results) {
      const res = calculateDmi({
        liveWeight,
        milkYield,
        milkFat,
        lactationStage,
        roughagePercent: newPercent,
      })
      setResults(res)
    }
  }

  return {
    inputs: {
      liveWeight,
      milkYield,
      milkFat,
      lactationStage,
      roughagePercent,
    },
    setLiveWeight,
    setMilkYield,
    setMilkFat,
    setLactationStage,
    results,
    isCalculating,
    handleCalculate,
    handleReset,
    updateRoughageRatio,
  }
}