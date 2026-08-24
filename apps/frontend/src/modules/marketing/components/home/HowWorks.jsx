import React from "react";

const steps = [
  {
    stepNumber: "01",
    title: "Add your herd",
    description:
      "Enter or import animals with tag numbers. Our team helps migrate existing registers.",
  },
  {
    stepNumber: "02",
    title: "Record daily",
    description:
      "Log milk, feed, health and breeding events from any phone in a few taps.",
  },
  {
    stepNumber: "03",
    title: "Act on insights",
    description:
      "Get alerts and reports that tell you exactly which animal needs attention today.",
  },
];

const HowWorks = () => {
  return (
    <section id="how-it-works" className="bg-[#FDFDF8] py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

       
        <div className="mb-10 sm:mb-14">
       
          <div className="mb-4 inline-flex items-center rounded-full bg-[#EBF7EE] border border-[#CEEAD5] px-3.5 py-1.5 shadow-xs">
            <span className="eyebrow text-[#1F6B3E] text-[11px] sm:text-xs font-bold tracking-[0.08em]">
              How It Works
            </span>
          </div>

          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#17301F] sm:text-4xl lg:text-[40px] leading-tight">
            Up and running in a single day
          </h2>
        </div>


        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative flex flex-col justify-start rounded-[24px] border border-[#EFE5D3] bg-[#FDF9EE] p-7 sm:p-8 shadow-[0_4px_20px_rgba(75,62,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#E2D2B5] hover:shadow-[0_12px_28px_rgba(75,62,42,0.07)]"
            >
           
              <span className="font-heading text-3xl sm:text-4xl font-bold text-[#8FA58F] mb-4">
                {step.stepNumber}
              </span>

             
              <h3 className="font-heading text-xl font-bold text-[#17301F] mb-3 leading-snug">
                {step.title}
              </h3>

              <p className="font-body text-sm text-[#5D6B60] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowWorks;
