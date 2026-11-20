import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { PROCESS_STEPS, type PageRoute } from '../data/rexoraData';

interface ProcessPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const ProcessPage: React.FC<ProcessPageProps> = ({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeStep = PROCESS_STEPS[activeIndex] ?? PROCESS_STEPS[0];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-[#0B162C] text-white py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-xs font-semibold text-[#60A5FA] tracking-wide uppercase">
            Our Process
          </p>
          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight max-w-3xl">
            Structured Delivery From First Audit to Production Launch
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Predictable milestones, clean documentation, and zero guesswork—so your team always
            knows what is being built and how it fits daily operations.
          </p>
        </div>
      </section>

      {/* Interactive Phase Selector */}
      <section className="py-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3" role="tablist" aria-label="Delivery process stages">
            {PROCESS_STEPS.map((step, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={step.stepNumber}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`w-full text-left p-5 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B162C] text-white border-[#0B162C]'
                      : 'bg-slate-50 text-[#0B162C] border-slate-200 hover:border-[#2563EB]'
                  }`}
                >
                  <p
                    className={`text-xs font-mono font-semibold ${
                      isSelected ? 'text-[#60A5FA]' : 'text-[#2563EB]'
                    }`}
                  >
                    {step.stepNumber} · {step.durationLabel}
                  </p>
                  <h2 className="mt-1 text-lg font-display font-bold">{step.title}</h2>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 space-y-6">
            <div className="space-y-2 pb-5 border-b border-slate-200">
              <p className="text-xs font-mono font-semibold text-[#2563EB]">
                Stage {activeStep.stepNumber} · {activeStep.durationLabel}
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B162C]">
                {activeStep.title}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">{activeStep.summary}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#0B162C]">Key Activities</h3>
              <ul className="space-y-2.5">
                {activeStep.activities.map((act) => (
                  <li key={act} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <CheckCircle2
                      className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="text-xs font-semibold text-slate-500">Phase Deliverable</p>
              <p className="text-base font-display font-bold text-[#0B162C]">
                {activeStep.deliverable}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
              >
                <span>Schedule Phase 01 Discovery</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % PROCESS_STEPS.length)}
                className="text-sm font-semibold text-[#0B162C] hover:text-[#2563EB] cursor-pointer"
              >
                Next Stage →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
