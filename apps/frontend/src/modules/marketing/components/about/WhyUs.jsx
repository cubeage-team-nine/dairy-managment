import React from "react";

const WhyUs = () => {
  const reasons = [
    {
      title: "Made with farmers, not for them",
      text: "Every screen was tested in working barns across Maharashtra, Karnataka and Punjab before release.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      title: "Built for rural reality",
      text: "Entries work offline on low-end Android phones and sync automatically when signal returns.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 9.5a10 10 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" />
          <path d="M7.8 12.3a6 6 0 0 1 8.4 0" stroke="currentColor" strokeWidth="1.7" />
          <path d="M10.5 15a2.2 2.2 0 0 1 3 0" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="18.3" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      title: "In your language",
      text: "Full interface in English, Hindi and Marathi, with regional units and Indian currency formats.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 6h7M8.5 4v2M6.5 6c.5 3 2.2 5.2 5 6.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 15h7M15.5 12.5v2.5M13.5 18.5c2-1.2 3.4-2.9 4.2-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Your data stays yours",
      text: "Encrypted storage, role-based access and one-click export. No selling of farm data, ever.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      ),
    },
    {
      title: "Real human support",
      text: "WhatsApp and phone support from people who understand lactation curves and DMI, not scripts.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7.5 17c1.2-2 2.7-3 4.5-3s3.3 1 4.5 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Priced for payback",
      text: "Most farms recover the subscription within a month through feed savings and fewer missed heats.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 17 10 12l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15 8h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-[#f7f8ee] px-6 py-[66px] pb-[75px] max-[650px]:px-[18px] max-[650px]:py-[52px] max-[650px]:pb-[60px] max-[400px]:px-[15px]">
      <div className="mx-auto w-full max-w-[1296px]">
        <div className="mb-[42px] max-[650px]:mb-[30px]">
          <span className="mb-[21px] inline-flex items-center rounded-full bg-[#def1de] px-[15px] py-2 font-sans text-[11px] font-semibold tracking-[0.7px] text-[#214a2c]">
            WHY US
          </span>
          <h2 className="font-serif text-[clamp(40px,4vw,54px)] font-normal leading-none tracking-[-1px] text-[#17271c] max-[650px]:text-[38px] max-[400px]:text-[34px]">
            Why Smart Dairy Manager
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-[22px] max-[1000px]:grid-cols-2 max-[650px]:grid-cols-1 max-[650px]:gap-[15px]">
          {reasons.map((reason, index) => (
            <article
              className="min-h-[202px] rounded-[21px] border border-[#e0e4db] bg-white px-[26px] pb-6 pt-[25px] shadow-[0_8px_22px_rgba(40,58,43,0.06)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_14px_28px_rgba(40,58,43,0.09)] max-[650px]:min-h-0 max-[650px]:rounded-[18px] max-[650px]:p-[22px]"
              key={index}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#dcf2dd] text-[#377d4a]">
                <span className="[&>svg]:h-6 [&>svg]:w-6">{reason.icon}</span>
              </div>
              <h3 className="mb-3 font-serif text-xl font-normal leading-[1.2] text-[#1c2a20]">
                {reason.title}
              </h3>
              <p className="font-sans text-sm leading-[1.6] text-[#6b706b]">
                {reason.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
