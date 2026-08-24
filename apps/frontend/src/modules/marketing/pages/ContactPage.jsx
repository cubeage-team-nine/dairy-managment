import React, { useState } from "react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Contact Form Submitted:", formData);

    alert("Thank you! Your message has been sent successfully.");

    setFormData({
      name: "",
      mobile: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className="min-h-screen bg-[#f8f9f3] px-4 py-10 font-sans text-[#202820] sm:px-6 sm:py-12 lg:px-10 lg:py-[55px]">
      <div className="mx-auto grid max-w-[1080px] grid-cols-1 items-start gap-7 lg:grid-cols-[1.15fr_0.85fr]">

        {/* ================= LEFT: CONTACT FORM ================= */}

        <section className="rounded-[24px] border border-[#e7e9e2] bg-white px-5 py-7 shadow-[0_8px_25px_rgba(31,55,35,0.08)] sm:px-8 sm:py-[34px]">

          <h1 className="mb-2.5 font-serif text-[22px] font-bold text-[#1e2a20] sm:text-[25px]">
            Send us a message
          </h1>

          <p className="mb-7 text-[13px] leading-[1.5] text-[#777d76]">
            Fields marked with an asterisk are required.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Name + Mobile */}
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-[18px]">

              {/* Name */}
              <div className="mb-[19px]">
                <label className="mb-2 block text-[13px] font-semibold text-[#263027]">
                  Name <span className="text-[#273b2b]">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Sanjay Patil"
                  required
                  className="h-11 w-full rounded-[15px] border border-[#dfe3db] bg-[#fcfcf8] px-[15px] text-[13px] text-[#263027] outline-none transition-all duration-200 placeholder:text-[#b7bbb5] focus:border-[#31934a] focus:bg-white focus:ring-[3px] focus:ring-[#31934a]/10"
                />
              </div>

              {/* Mobile */}
              <div className="mb-[19px]">
                <label className="mb-2 block text-[13px] font-semibold text-[#263027]">
                  Mobile <span className="text-[#273b2b]">*</span>
                </label>

                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+919876543210"
                  required
                  className="h-11 w-full rounded-[15px] border border-[#dfe3db] bg-[#fcfcf8] px-[15px] text-[13px] text-[#263027] outline-none transition-all duration-200 placeholder:text-[#b7bbb5] focus:border-[#31934a] focus:bg-white focus:ring-[3px] focus:ring-[#31934a]/10"
                />
              </div>

            </div>

            {/* Email */}
            <div className="mb-[19px]">
              <label className="mb-2 block text-[13px] font-semibold text-[#263027]">
                Email <span className="text-[#273b2b]">*</span>
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@farm.com"
                required
                className="h-11 w-full rounded-[15px] border border-[#dfe3db] bg-[#fcfcf8] px-[15px] text-[13px] text-[#263027] outline-none transition-all duration-200 placeholder:text-[#b7bbb5] focus:border-[#31934a] focus:bg-white focus:ring-[3px] focus:ring-[#31934a]/10"
              />
            </div>

            {/* Subject */}
            <div className="mb-[19px]">
              <label className="mb-2 block text-[13px] font-semibold text-[#263027]">
                Subject <span className="text-[#273b2b]">*</span>
              </label>

              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Demo for a 60-cow farm"
                required
                className="h-11 w-full rounded-[15px] border border-[#dfe3db] bg-[#fcfcf8] px-[15px] text-[13px] text-[#263027] outline-none transition-all duration-200 placeholder:text-[#b7bbb5] focus:border-[#31934a] focus:bg-white focus:ring-[3px] focus:ring-[#31934a]/10"
              />
            </div>

            {/* Message */}
            <div className="mb-[19px]">
              <label className="mb-2 block text-[13px] font-semibold text-[#263027]">
                Message <span className="text-[#273b2b]">*</span>
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your herd size, current records and what you'd like to improve."
                required
                className="min-h-[117px] w-full resize-y rounded-[15px] border border-[#dfe3db] bg-[#fcfcf8] px-[15px] py-[14px] text-[13px] leading-[1.5] text-[#263027] outline-none transition-all duration-200 placeholder:text-[#b7bbb5] focus:border-[#31934a] focus:bg-white focus:ring-[3px] focus:ring-[#31934a]/10"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-0.5 inline-flex min-w-[185px] items-center justify-center gap-2.5 rounded-full bg-gradient-to-br from-[#116d35] to-[#45a63c] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_7px_17px_rgba(35,117,54,0.17)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(35,117,54,0.24)] active:translate-y-0 sm:min-w-[185px]"
            >
              <span>Send message</span>

              {/* Send Icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>

          </form>
        </section>

        {/* ================= RIGHT SIDEBAR ================= */}

        <aside className="flex flex-col gap-5 lg:flex">

          {/* Contact Information */}
          <section className="rounded-[22px] bg-gradient-to-br from-[#116c35] to-[#3ca53b] px-[21px] py-6 text-white shadow-[0_8px_24px_rgba(28,104,47,0.18)] sm:px-[27px] sm:py-7">

            <h2 className="mb-[22px] font-serif text-xl font-bold text-white">
              Contact information
            </h2>

            {/* Phone */}
            <div className="mb-5 flex items-start gap-[13px]">
              <svg
                className="mt-px h-5 w-5 shrink-0 stroke-white"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.1 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 21 15.9v1.02" />
              </svg>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold">
                  Sales & support
                </span>

                <span className="text-xs leading-[1.4] text-white/85">
                  +919876543210
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="mb-5 flex items-start gap-[13px]">
              <svg
                className="mt-px h-5 w-5 shrink-0 stroke-white"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />
                <path d="M3 7l9 6 9-6" />
              </svg>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold">
                  Email
                </span>

                <span className="break-all text-xs leading-[1.4] text-white/85">
                  hello@smartdairymanager.com
                </span>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-start gap-[13px]">
              <svg
                className="mt-px h-5 w-5 shrink-0 stroke-white"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold">
                  Working hours
                </span>

                <span className="text-xs leading-[1.4] text-white/85">
                  Mon – Sat, 8:00 AM to 8:00 PM IST
                </span>
              </div>
            </div>

          </section>

          {/* Registered Address */}
          <section className="rounded-[22px] border border-[#e7e9e2] bg-white px-[21px] py-6 shadow-[0_7px_22px_rgba(31,55,35,0.07)] sm:px-[27px] sm:py-7">

            <div className="mb-[17px] flex h-[43px] w-[43px] items-center justify-center rounded-full bg-[#e4f5e6]">
              <svg
                className="h-[21px] w-[21px] stroke-[#398e48]"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
              >
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>

            <h2 className="mb-[13px] font-serif text-[19px] text-[#253026]">
              Registered address
            </h2>

            <p className="m-0 text-[13px] leading-[1.6] text-[#858a83]">
              Smart Dairy Manager Pvt. Ltd.
              <br />
              3rd Floor, Greenfield Tech Park
              <br />
              Baner Road, Pune
              <br />
              Maharashtra 411045, India
            </p>

          </section>

        </aside>

      </div>
    </main>
  );
};

export default ContactPage;