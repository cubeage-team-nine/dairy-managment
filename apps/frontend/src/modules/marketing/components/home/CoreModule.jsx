import React from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Droplets,
  Wheat,
  HeartPulse,
  Sprout,
  IndianRupee,
  BarChart3,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import RoutePath from "../../../../core/constants/routes.constant";

const modulesList = [
  {
    icon: ClipboardList,
    title: "Animal Management",
    description:
      "Individual profiles with tag number, breed, lactation stage, parentage and lifetime history.",
  },
  {
    icon: Droplets,
    title: "Milk Tracking",
    description:
      "Shift-wise yield, fat and SNF per animal, with automatic daily and monthly totals.",
  },
  {
    icon: Wheat,
    title: "Feed & DMI",
    description:
      "Ration planning, dry matter intake tracking and feed cost per litre of milk produced.",
  },
  {
    icon: HeartPulse,
    title: "Health",
    description:
      "Vaccination schedules, treatments, vet visits and withdrawal-period alerts.",
  },
  {
    icon: Sprout,
    title: "Breeding",
    description:
      "Heat detection, AI records, pregnancy checks, calving calendar and dry-off reminders.",
  },
  {
    icon: IndianRupee,
    title: "Finance",
    description:
      "Milk income, feed and labour expenses, dues and profit per animal at a glance.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    description:
      "Herd performance, yield trends and cost reports exportable for banks and cooperatives.",
  },
];

const CoreModule = () => {
  return (
    <section className="bg-[#FDFDF8] py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        
        <div className="mb-12 sm:mb-16">
          {/* Eyebrow Badge */}
          <div className="mb-4 inline-flex items-center rounded-full bg-[#EBF7EE] border border-[#CEEAD5] px-3.5 py-1.5 shadow-xs">
            <span className="eyebrow text-[#1F6B3E] text-[11px] sm:text-xs font-bold tracking-[0.08em]">
              Core Modules
            </span>
          </div>

          {/* Section Heading */}
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#17301F] sm:text-4xl lg:text-[40px] leading-tight mb-4">
            Everything a dairy farm needs to run
          </h2>

          {/* Section Description */}
          <p className="font-body text-base sm:text-lg text-[#5D6B60] max-w-3xl leading-relaxed">
            Seven connected modules. Enter data once and it flows into your reports, alerts and profit calculations automatically.
          </p>
        </div>

        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* 7 Standard Module Cards */}
          {modulesList.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group relative flex flex-col justify-start rounded-[24px] border border-[#E5EBE3] bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(23,48,31,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CEEAD5] hover:shadow-[0_12px_28px_rgba(23,48,31,0.08)]"
              >
                {/* Icon Circle */}
                <div className="mb-6 flex size-11 items-center justify-center rounded-full bg-[#EBF7EE] text-[#1F6B3E] transition-colors duration-200 group-hover:bg-[#DDF2E2]">
                  <Icon className="size-5 text-[#1F6B3E]" />
                </div>

                {/* Module Title */}
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#17301F] mb-3 leading-snug">
                  {item.title}
                </h3>

                {/* Module Description */}
                <p className="font-body text-sm text-[#5D6B60] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}

          {/* 8th Highlight Card: "Works on any phone" */}
          <div className="relative flex flex-col justify-between rounded-[24px] bg-gradient-to-br from-[#14562F] via-[#1A6136] to-[#257A42] p-6 sm:p-7 text-white shadow-xl shadow-[#14562F]/15 transition-all duration-300 hover:-translate-y-1">
            <div>
              {/* Smartphone Icon */}
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs text-white">
                <Smartphone className="size-6 text-white" />
              </div>

              {/* Title */}
              <h3 className="font-heading text-xl font-bold text-white mb-2.5">
                Works on any phone
              </h3>

              {/* Description */}
              <p className="font-body text-sm text-white/85 leading-relaxed mb-6">
                Offline-friendly entry in English, Hindi and Marathi. Sync happens when the network returns.
              </p>
            </div>

            {/* Book a Demo Button */}
            <div>
              <Link
                to={RoutePath.CONTACT}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 py-2.5 font-body text-sm font-semibold text-white backdrop-blur-xs transition-all duration-200 hover:bg-white hover:text-[#14562F] hover:shadow-md"
              >
                <span>Book a demo</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CoreModule;
