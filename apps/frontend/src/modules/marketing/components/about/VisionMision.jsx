import React from "react";

const VisionMision = () => {
  return (
    <section className="w-full bg-[#fbfbf3] px-6 py-[76px] pb-[110px] max-[900px]:py-[60px] max-[900px]:pb-20 max-[700px]:px-5 max-[700px]:py-[45px] max-[700px]:pb-[65px] max-[480px]:px-4">
      <div className="mx-auto grid w-full max-w-[1296px] grid-cols-2 gap-[25px] max-[900px]:gap-5 max-[700px]:grid-cols-1">
        <div className="flex min-h-[315px] flex-col justify-start rounded-[24px] border border-[#e2e5dc] bg-white p-[42px] shadow-[0_13px_35px_rgba(29,53,34,0.07)] max-[900px]:min-h-[320px] max-[900px]:p-8 max-[700px]:min-h-0 max-[700px]:rounded-[20px] max-[700px]:p-[30px] max-[480px]:p-[25px]">
          <div className="mb-[26px] flex h-[51px] w-[51px] items-center justify-center rounded-[15px] bg-[#dff3df] text-[#397c4b] max-[700px]:mb-[22px] max-[700px]:h-12 max-[700px]:w-12">
            <svg viewBox="0 0 24 24" fill="none" className="h-[25px] w-[25px]">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
          </div>
          <h2 className="mb-[15px] font-serif text-[30px] font-normal leading-[1.1] tracking-[-0.5px] text-[#18291d] max-[900px]:text-[28px] max-[700px]:text-[28px] max-[480px]:text-[26px]">
            Our mission
          </h2>
          <p className="max-w-[580px] font-sans text-base leading-[1.65] text-[#686d66] max-[900px]:text-[15px] max-[700px]:text-sm">
            To put professional-grade herd management in the hands of every
            dairy farmer — however small the farm — so that milk production
            becomes more profitable, more predictable and kinder to the
            animals that make it possible.
          </p>
        </div>

        <div className="flex min-h-[315px] flex-col justify-start rounded-[24px] bg-gradient-to-br from-[#075b2a] to-[#3e9c3b] p-[42px] text-white shadow-[0_15px_35px_rgba(24,101,48,0.14)] max-[900px]:min-h-[320px] max-[900px]:p-8 max-[700px]:min-h-0 max-[700px]:rounded-[20px] max-[700px]:p-[30px] max-[480px]:p-[25px]">
          <div className="mb-[26px] flex h-[51px] w-[51px] items-center justify-center rounded-[15px] bg-white/10 text-white max-[700px]:mb-[22px] max-[700px]:h-12 max-[700px]:w-12">
            <svg viewBox="0 0 24 24" fill="none" className="h-[25px] w-[25px]">
              <path d="M2.8 12s3.4-5.5 9.2-5.5S21.2 12 21.2 12s-3.4 5.5-9.2 5.5S2.8 12 2.8 12Z" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </div>
          <h2 className="mb-[15px] font-serif text-[30px] font-normal leading-[1.1] tracking-[-0.5px] max-[900px]:text-[28px] max-[700px]:text-[28px] max-[480px]:text-[26px]">
            Our vision
          </h2>
          <p className="max-w-[580px] font-sans text-base leading-[1.65] text-white/85 max-[900px]:text-[15px] max-[700px]:text-sm">
            A dairy sector where every litre is traceable, every animal is
            cared for on time, and every farmer can see exactly how their
            farm is performing — making India's dairy farms among the most
            efficient and transparent in the world.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VisionMision;
