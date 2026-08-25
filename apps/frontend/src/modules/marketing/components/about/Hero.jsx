import React from "react";
import logo from "./img/img.jpg";

const Hero = () => {
  return (
    <section className="w-full bg-[#f7f6e9] px-6 py-[92px] pb-[78px] max-[1000px]:px-7 max-[1000px]:py-[75px] max-[1000px]:pb-[65px] max-[768px]:px-[22px] max-[768px]:py-[65px] max-[768px]:pb-[55px] max-[480px]:px-[18px] max-[480px]:py-[50px] max-[480px]:pb-[45px]">
      <div className="mx-auto grid w-full max-w-[1296px] grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] items-center gap-[68px] max-[1000px]:grid-cols-2 max-[1000px]:gap-10 max-[768px]:grid-cols-1 max-[768px]:gap-[38px]">
        <div className="max-w-[650px] max-[768px]:max-w-full">
          <span className="mb-[27px] inline-flex items-center rounded-full bg-[#dff2df] px-4 py-2 font-sans text-xs font-semibold tracking-[0.8px] text-[#173f27] max-[480px]:mb-5 max-[480px]:px-[13px] max-[480px]:py-[7px] max-[480px]:text-[10px]">
            ABOUT US
          </span>

          <h1 className="mb-[26px] font-serif text-[clamp(44px,4.1vw,65px)] font-normal leading-[0.98] tracking-[-1.6px] text-[#18291d] max-[1000px]:text-[clamp(40px,5vw,54px)] max-[768px]:text-[clamp(40px,10vw,54px)] max-[768px]:leading-none max-[768px]:tracking-[-1px] max-[480px]:mb-5 max-[480px]:text-[39px]">
            A dairy platform shaped by
            <br className="max-[768px]:hidden" />
            barn floors, not
            <br className="max-[768px]:hidden" />
            boardrooms
          </h1>

          <p className="mb-[18px] max-w-[610px] font-sans text-[17px] leading-[1.7] text-[#626760] max-[1000px]:text-[15px] max-[768px]:text-[15px] max-[768px]:leading-[1.65] max-[480px]:text-sm max-[480px]:leading-[1.6]">
            Smart Dairy Manager began in 2019 when a group of dairy
            technologists and second generation farmers realised the same
            truth: Indian dairy farms produce enormous amounts of data every
            day, and almost all of it disappears into notebooks.
          </p>

          <p className="mb-[18px] max-w-[610px] font-sans text-[17px] leading-[1.7] text-[#626760] max-[1000px]:text-[15px] max-[768px]:text-[15px] max-[768px]:leading-[1.65] max-[480px]:text-sm max-[480px]:leading-[1.6]">
            We built one platform that captures animal, milk, feed, health,
            breeding and financial records in a way a busy farmer can
            actually maintain — and turns them into decisions worth money.
          </p>
        </div>

        <div className="aspect-[1.15/0.84] w-full overflow-hidden rounded-[25px] shadow-[0_14px_35px_rgba(33,55,38,0.08)] max-[768px]:aspect-[1.35/1] max-[768px]:rounded-[20px] max-[480px]:rounded-[17px]">
          <img
            src={logo}
            alt="Milk storage containers in a dairy"
            className="block h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
