import React from "react";
import { Link } from "react-router-dom";
import { Leaf, ArrowRight, TrendingUp } from "lucide-react";
import RoutePath from "../../../../core/constants/routes.constant";

const Hero = () => {
  const stats = [
    {
      label: "ANIMALS MANAGED",
      value: "12,400+",
    },
    {
      label: "AVERAGE YIELD GAIN",
      value: "18%",
    },
    {
      label: "MILK SALES TRACKED",
      value: "₹9.2 Cr",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#FDFDF8] pt-6 pb-14 sm:pt-10 sm:pb-20 lg:pt-14 lg:pb-24">
      {/* Background Soft Glow Decoration */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[450px] w-[450px] rounded-full bg-[#DDF2E2]/60 blur-3xl -z-0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-0 h-80 w-80 -translate-y-1/2 rounded-full bg-[#F8F1E2]/70 blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">

         
          <div className="lg:col-span-7 xl:col-span-7">

            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EBF7EE] border border-[#CEEAD5] px-3.5 py-1.5 shadow-xs mb-6 sm:mb-8">
              <Leaf className="size-3.5 text-[#1F6B3E]" />
              <span className="eyebrow text-[#1F6B3E] text-[11px] sm:text-xs font-bold tracking-[0.08em]">
                Digital Dairy Management
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-heading text-3xl font-bold tracking-tight text-[#17301F] sm:text-5xl lg:text-[54px] xl:text-[58px] leading-[1.12] mb-6">
              Every animal, every <br className="hidden sm:inline" />
              litre, every rupee — <br className="hidden sm:inline" />
              under control.
            </h1>

            {/* Subtitle / Description */}
            <p className="font-body text-base sm:text-lg leading-relaxed text-[#5C6A5E] max-w-2xl mb-8 sm:mb-10">
              Smart Dairy Manager replaces notebooks and scattered spreadsheets with one clear system for animal records, milk yield, feed, health, breeding and farm finance. Built for real barns and real farmers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 mb-12 sm:mb-16">
              <Link
                to={RoutePath.SIGNUP}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1F6B3E] px-7 py-3.5 font-body text-sm sm:text-base font-semibold text-white shadow-md shadow-[#1F6B3E]/20 transition-all duration-200 hover:bg-[#14562F] hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Get Started</span>
                <ArrowRight className="size-4" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-full border border-[#DEE5DB] bg-white px-7 py-3.5 font-body text-sm sm:text-base font-semibold text-[#17301F] shadow-xs transition-all duration-200 hover:bg-[#F8F1E2]/40 hover:border-[#1F6B3E]/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                See how it works
              </a>
            </div>

            {/* Stats Counter Row */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 border-t border-[#DEE5DB]/70 pt-7 sm:pt-8 max-w-xl">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="font-body text-[10px] sm:text-[11px] lg:text-xs font-bold uppercase tracking-wider text-[#6E7A70] mb-1 sm:mb-1.5 leading-tight">
                    {stat.label}
                  </span>
                  <span className="font-heading text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#17301F]">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

          </div>


          <div className="lg:col-span-5 xl:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-lg lg:max-w-none">

              {/* Image Frame */}
              <div className="relative aspect-[4/3] sm:aspect-[4/3] w-full overflow-hidden rounded-[26px] sm:rounded-[32px] border border-white/80 bg-[#F4EFE6] shadow-xl ring-1 ring-black/5">
                <img
                  src="https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern dairy farmer holding tablet in cattle barn"
                  className="h-full w-full object-cover object-center"
                  loading="eager"
                  onError={(e) => {
                    // Fallback to stylized high-contrast agricultural photo if offline
                    e.currentTarget.src = "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Floating Metric Card (Today's Yield) */}
              <div className="absolute -bottom-5 left-4 sm:-bottom-6 sm:left-6 md:left-8 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 px-4 py-3 sm:px-5 sm:py-3.5 shadow-xl backdrop-blur-md ring-1 ring-black/5 transition-transform duration-300 hover:scale-105">
                <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-[#DDF2E2] text-[#1F6B3E]">
                  <TrendingUp className="size-5 text-[#1F6B3E]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-body text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6E7A70] leading-none mb-1">
                    TODAY'S YIELD
                  </span>
                  <div className="flex items-center gap-1.5 font-heading text-sm sm:text-base font-bold text-[#17301F]">
                    <span>642 L</span>
                    <span className="text-[#3F9A63] font-body text-xs font-bold">· +4.3%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
