import React from "react";
import { Droplets, Wheat, Clock, ShieldCheck } from "lucide-react";

const featureCards = [
  {
    icon: Droplets,
    title: "More milk per animal",
    description:
      "Spot low-yield animals early and act before a whole lactation is lost.",
  },
  {
    icon: Wheat,
    title: "Lower feed cost",
    description:
      "Balance dry matter intake against yield so every kilo of feed pays for itself.",
  },
  {
    icon: Clock,
    title: "Minutes, not ledgers",
    description:
      "Daily entries take under five minutes on a phone, even with patchy network.",
  },
  {
    icon: ShieldCheck,
    title: "Records you can trust",
    description:
      "Health, breeding and payment history stored safely and ready for audits.",
  },
];

const Card = () => {
  return (
    <section className="bg-[#FDFDF8] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        
        <div className="mb-10 sm:mb-14">
          {/* Eyebrow Badge */}
          <div className="mb-4 inline-flex items-center rounded-full bg-[#EBF7EE] border border-[#CEEAD5] px-3.5 py-1.5 shadow-xs">
            <span className="eyebrow text-[#1F6B3E] text-[11px] sm:text-xs font-bold tracking-[0.08em]">
              Why Farmers Switch
            </span>
          </div>

          {/* Section Heading */}
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#17301F] sm:text-4xl lg:text-[40px] leading-tight">
            Simple to use, serious about results
          </h2>
        </div>

        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-start rounded-[24px] border border-[#E5EBE3] bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(23,48,31,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CEEAD5] hover:shadow-[0_12px_28px_rgba(23,48,31,0.08)]"
              >
                {/* Icon Circle */}
                <div className="mb-6 flex size-11 items-center justify-center rounded-full bg-[#EBF7EE] text-[#1F6B3E] transition-colors duration-200 group-hover:bg-[#DDF2E2]">
                  <Icon className="size-5 text-[#1F6B3E]" />
                </div>

                {/* Card Title */}
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#17301F] mb-3 leading-snug">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="font-body text-sm text-[#5D6B60] leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Card;
