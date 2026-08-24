import React from 'react';

const Features = () => {
  return (
    <section className="min-h-screen bg-gray-50/50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#053321] tracking-tight mb-4">
            Everything you need to run a smarter dairy.
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Comprehensive tools designed for precision farming, delivering actionable insights from the barn to the balance sheet.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Animal Management */}
          <div className="md:col-span-7 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 text-[#053321] flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-5 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm10 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-12.5 7c.8 0 1.5.7 1.5 1.5S5.3 16 4.5 16 3 15.3 3 14.5 3.7 13 4.5 13zm15 0c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5zM12 8.5c2.5 0 4.5 1.8 4.5 4 0 2.8-2.5 6.5-4.5 8.5-2-2-4.5-5.7-4.5-8.5 0-2.2 2-4 4.5-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#053321] mb-2">Animal Management</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Complete profile tracking, health records, and detailed breeding history for every animal in your herd.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">Healthy</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">Tracked</span>
            </div>
          </div>

          {/* Milk Tracking */}
          <div className="md:col-span-5 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative flex flex-col justify-between p-8 min-h-[220px]">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1527153857715-3908f2bae5da?auto=format&fit=crop&q=80" 
                alt="Milk pouring background" 
                className="w-full h-full object-cover object-right opacity-30" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 text-[#053321] flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#053321] mb-2">Milk Tracking</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Real-time yield data, somatic cell count quality metrics, and seamless quota management.
              </p>
            </div>
          </div>

          {/* Feed & DMI */}
          <div className="md:col-span-5 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 text-[#053321] flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0-18C9 8 4 9 4 14a8 8 0 008 4m0-15c3 5 8 6 8 11a8 8 0 01-8 4"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#053321] mb-2">Feed & DMI</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Precise dry matter intake calculations and automated ration planning to optimize nutrition and reduce waste.
              </p>
            </div>
          </div>

          {/* Financials */}
          <div className="md:col-span-7 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div className="flex-1">
              <div className="w-10 h-10 text-[#053321] flex items-center justify-center mb-4">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#053321] mb-2">Financials</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Integrated expense tracking, detailed revenue reports, and automated milk check reconciliation.
              </p>
            </div>
            
            <div className="w-full sm:w-1/2 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-slate-50">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80" 
                alt="Financial Dashboard Preview" 
                className="w-full h-auto object-cover" 
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;