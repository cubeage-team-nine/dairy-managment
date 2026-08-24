import React from "react";
import { Users, Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Earlier I kept three notebooks. Now milk, feed and vet records sit in one place and I know which cow is losing money.",
    rating: 5,
    name: "Sanjay Patil",
    role: "78 crossbred cows, Baramati",
  },
  {
    quote:
      "The breeding calendar alone paid for the subscription. Our calving interval dropped by nearly a month.",
    rating: 5,
    name: "Meenakshi Rao",
    role: "Dairy cooperative secretary, Kolar",
  },
  {
    quote:
      "Feed cost per litre is finally visible. We changed the ration and saved close to ₹40,000 in one season.",
    rating: 5,
    name: "Harpreet Singh",
    role: "Farm manager, Ludhiana",
  },
];

const Blog = () => {
  return (
    <section className="bg-[#FDFDF8] py-14 sm:py-18 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        
        <div className="mb-12 sm:mb-16">
          {/* Eyebrow Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EBF7EE] border border-[#CEEAD5] px-3.5 py-1.5 shadow-xs">
            <Users className="size-3.5 text-[#1F6B3E]" />
            <span className="eyebrow text-[#1F6B3E] text-[11px] sm:text-xs font-bold tracking-[0.08em]">
              Farmer Voices
            </span>
          </div>

          {/* Section Heading */}
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#17301F] sm:text-4xl lg:text-[40px] leading-tight max-w-3xl">
            Trusted in the barn, not just the <br className="hidden sm:inline" />
            boardroom
          </h2>
        </div>

       
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="group relative flex flex-col justify-between rounded-[24px] border border-[#E5EBE3] bg-white p-7 sm:p-8 shadow-[0_4px_20px_rgba(23,48,31,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CEEAD5] hover:shadow-[0_12px_28px_rgba(23,48,31,0.08)]"
            >
              <div>
                {/* Stylized Quote Icon */}
                <div className="mb-5 text-[#5FBF52]">
                  <Quote className="size-7 rotate-180 fill-[#5FBF52]/20 stroke-[2.5]" />
                </div>

                {/* Quote Text */}
                <p className="font-body text-sm sm:text-base text-[#46544A] leading-relaxed mb-6">
                  “{item.quote}”
                </p>
              </div>

              <div>
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 text-[#3F9A63] fill-[#3F9A63]"
                    />
                  ))}
                </div>

                {/* Author Name */}
                <h3 className="font-heading text-base sm:text-lg font-bold text-[#17301F]">
                  {item.name}
                </h3>

                {/* Author Role / Location */}
                <p className="font-body text-xs sm:text-sm text-[#6E7A70] mt-0.5">
                  {item.role}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Blog;
