function DmiResultCard({ dmi, bwPercent }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary-soft p-6 space-y-3 transform transition-transform duration-300 hover:scale-[1.01]">
      <span className="inline-block text-[11px] font-bold tracking-wider text-primary uppercase">
        RECOMMENDED DAILY INTAKE
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
          {dmi}
        </span>
        <span className="text-base font-bold text-primary">kg DM/day</span>
      </div>
      <p className="text-xs font-medium text-primary/90">
        Equivalent to ~{bwPercent}% of the animal's total body weight.
      </p>
    </div>
  )
}

export default DmiResultCard
