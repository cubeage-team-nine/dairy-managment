import React from "react";

const Benefits = () => {
  const benefits = [
    "One record per animal, from birth to culling",
    "Milk yield trends with fat and SNF quality",
    "Feed cost per litre, calculated daily",
    "Heat, insemination and calving reminders",
    "Vaccination and treatment history for audits",
    "Profit and loss per animal and per shed",
  ];

  return (
    <section className="w-full bg-[#fbfbf3] px-6 py-[85px] pb-[105px] max-[800px]:px-[22px] max-[800px]:py-[65px] max-[800px]:pb-[75px] max-[560px]:px-[18px] max-[560px]:py-[50px] max-[560px]:pb-[60px]">
      <div className="mx-auto grid w-full max-w-[1296px] grid-cols-[0.95fr_1.05fr] items-center gap-[85px] max-[1050px]:gap-[45px] max-[800px]:grid-cols-1 max-[800px]:gap-[42px]">
        <div className="max-w-[570px] max-[800px]:max-w-[650px]">
          <span className="mb-[23px] inline-flex rounded-full bg-[#def2df] px-[15px] py-2 font-sans text-[11px] font-semibold tracking-[0.7px] text-[#234c30]">
            KEY BENEFITS
          </span>

          <h2 className="mb-[19px] font-serif text-[clamp(38px,4vw,52px)] font-normal leading-none tracking-[-1px] text-[#18291d] max-[1050px]:text-[43px] max-[800px]:text-[42px] max-[560px]:text-[36px] max-[560px]:leading-[1.05]">
            What changes on your farm
          </h2>

          <p className="font-sans text-base leading-[1.7] text-[#696e68] max-[560px]:text-sm">
            Within the first month most farms know their true feed cost per
            litre and stop missing breeding windows. Those two changes alone
            move the profit line.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-[18px] max-[560px]:grid-cols-1 max-[560px]:gap-[13px]">
          {benefits.map((benefit, index) => (
            <div
              className="flex min-h-[91px] items-center rounded-[19px] bg-[#fffdf0] p-[23px] shadow-[0_10px_25px_rgba(55,62,31,0.07)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_15px_30px_rgba(55,62,31,0.11)] max-[1050px]:p-5 max-[560px]:min-h-[72px] max-[560px]:rounded-2xl max-[560px]:px-5 max-[560px]:py-[18px]"
              key={index}
            >
              <span className="font-sans text-[15px] font-medium leading-[1.45] text-[#202a22] max-[1050px]:text-sm">
                {benefit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
