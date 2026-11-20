import React, { useEffect } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { INDUSTRIES } from '../data/rexoraData';
import { SafeImage } from '../components/SafeImage';

interface IndustriesPageProps {
  highlightIndustryId?: string;
  onRequestIndustryConsultation: (prefill: {
    serviceRequired: string;
    projectRequirements: string;
  }) => void;
}

export const IndustriesPage: React.FC<IndustriesPageProps> = ({
  highlightIndustryId,
  onRequestIndustryConsultation,
}) => {
  useEffect(() => {
    if (highlightIndustryId) {
      const el = document.getElementById(`industry-${highlightIndustryId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [highlightIndustryId]);

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-[#0B162C] text-white py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-semibold text-[#60A5FA] tracking-wide uppercase">
              Industries We Serve
            </p>
            <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight">
              Technology Tailored to Real Sector Bottlenecks
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Every sector handles stock, customer enquiries, billing, and MIS differently. Explore
              how RexoraTech engineers targeted digital solutions for seven core business categories.
            </p>
          </div>
          <div className="lg:col-span-5">
            <SafeImage
              src="/src/assets/images/industries_smart_operations_1794846103547.jpg"
              alt="Automated retail and distribution hub operations"
              className="w-full h-64 object-cover rounded-xl border border-white/15"
            />
          </div>
        </div>
      </section>

      {/* Quick Jump Strip */}
      <section className="bg-slate-50 border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2">
          {INDUSTRIES.map((ind) => (
            <a
              key={ind.id}
              href={`#industry-${ind.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(`industry-${ind.id}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-[#0B162C] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0"
            >
              {ind.name}
            </a>
          ))}
        </div>
      </section>

      {/* Industry Problem -> Solution Sections */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {INDUSTRIES.map((industry, idx) => (
            <article
              key={industry.id}
              id={`industry-${industry.id}`}
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-mono font-semibold text-[#2563EB]">
                    0{idx + 1} · Sector Solutions
                  </p>
                  <h2 className="mt-1 text-2xl font-display font-bold text-[#0B162C]">
                    {industry.name}
                  </h2>
                  <p className="mt-1 text-sm sm:text-base text-slate-600">{industry.headline}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onRequestIndustryConsultation({
                      serviceRequired: industry.recommendedServices[0],
                      projectRequirements: `Industry: ${industry.name}\nObjective: ${industry.headline}`,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B162C] hover:bg-[#2563EB] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Discuss {industry.name} Solution</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-sm font-semibold text-[#0B162C]">
                    Common Operational Challenges
                  </h3>
                  <ul className="space-y-2.5">
                    {industry.challenges.map((challenge) => (
                      <li
                        key={challenge}
                        className="flex items-start gap-2.5 text-sm text-slate-600"
                      >
                        <AlertCircle
                          className="w-4 h-4 text-amber-600 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-sm font-semibold text-[#0B162C]">
                    How RexoraTech Solves Them
                  </h3>
                  <ul className="space-y-2.5">
                    {industry.rexoraSolutions.map((solution) => (
                      <li key={solution} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2
                          className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="lg:col-span-2 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                  <h3 className="text-xs font-semibold text-slate-500">Core Services</h3>
                  <ul className="space-y-1.5 text-xs font-medium text-[#0B162C]">
                    {industry.recommendedServices.map((svc) => (
                      <li key={svc}>· {svc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
