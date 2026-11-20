import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe,
  Layers,
  Workflow,
} from 'lucide-react';
import {
  SERVICE_PILLARS,
  type PageRoute,
  type ServiceDetail,
  type ServicePillar,
} from '../data/rexoraData';
import { SolutionAdvisor } from '../components/SolutionAdvisor';

interface ServicesPageProps {
  initialPillarId?: string;
  onNavigate: (page: PageRoute) => void;
  onRequestQuoteForService: (prefill: {
    serviceRequired: string;
    projectRequirements: string;
  }) => void;
}

const PILLAR_ICONS: Record<ServicePillar['id'], React.ComponentType<{ className?: string }>> = {
  'website-development': Globe,
  'business-automation': Workflow,
  'data-analytics-mis': BarChart3,
  'digital-solutions': Layers,
};

export const ServicesPage: React.FC<ServicesPageProps> = ({
  initialPillarId,
  onRequestQuoteForService,
}) => {
  const matchedPillar =
    SERVICE_PILLARS.find((p) => p.id === initialPillarId) ?? SERVICE_PILLARS[0];
  const [activePillarId, setActivePillarId] = useState<ServicePillar['id']>(matchedPillar.id);
  const [selectedService, setSelectedService] = useState<ServiceDetail>(
    matchedPillar.services[0]
  );

  useEffect(() => {
    if (initialPillarId) {
      const nextPillar = SERVICE_PILLARS.find((p) => p.id === initialPillarId);
      if (nextPillar) {
        setActivePillarId(nextPillar.id);
        setSelectedService(nextPillar.services[0]);
      }
    }
  }, [initialPillarId]);

  const activePillar =
    SERVICE_PILLARS.find((p) => p.id === activePillarId) ?? SERVICE_PILLARS[0];

  const handleSelectPillar = (pillar: ServicePillar) => {
    setActivePillarId(pillar.id);
    setSelectedService(pillar.services[0]);
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-[#0B162C] text-white py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-xs font-semibold text-[#60A5FA] tracking-wide uppercase">
            Our Services
          </p>
          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight max-w-3xl">
            Complete Digital, Automation & Analytics Capabilities
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Select any service category and individual capability below to inspect deliverables,
            ideal use cases, and request a tailored proposal.
          </p>
        </div>
      </section>

      {/* Pillar Tabs */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div
            role="tablist"
            aria-label="Service categories"
            className="flex flex-wrap items-center gap-2"
          >
            {SERVICE_PILLARS.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.id];
              const isActive = pillar.id === activePillar.id;
              return (
                <button
                  key={pillar.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => handleSelectPillar(pillar)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0B162C] text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {pillar.index}. {pillar.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Pillar Cards + Dedicated Service Detail View */}
      <section className="py-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-mono font-semibold text-[#2563EB]">
              {activePillar.index} · {activePillar.services.length} Specialized Offerings
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B162C] tracking-tight">
              {activePillar.title}
            </h2>
            <p className="text-base text-slate-600">{activePillar.description}</p>
            <p className="text-sm font-medium text-[#0B162C]">Outcome: {activePillar.outcome}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Individual Service Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activePillar.services.map((svc) => {
                const isSelected = selectedService.id === svc.id;
                const Icon = PILLAR_ICONS[activePillar.id];
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setSelectedService(svc)}
                    aria-pressed={isSelected}
                    className={`text-left p-5 rounded-xl border transition-colors flex flex-col justify-between space-y-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B162C] text-white border-[#0B162C]'
                        : 'bg-white text-[#0B162C] border-slate-200 hover:border-[#2563EB]'
                    }`}
                  >
                    <div className="space-y-2">
                      <Icon
                        className={`w-5 h-5 ${isSelected ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}
                        aria-hidden="true"
                      />
                      <h3 className="text-base font-display font-bold">{svc.title}</h3>
                      <p
                        className={`text-xs leading-relaxed ${
                          isSelected ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {svc.summary}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        isSelected ? 'text-blue-300' : 'text-[#2563EB]'
                      }`}
                    >
                      <span>{isSelected ? 'Viewing Details' : 'Inspect Service Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dedicated Service Detail Section */}
            <aside
              aria-label="Selected service details"
              className="lg:col-span-5 lg:sticky lg:top-24 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-7 space-y-6"
            >
              <div className="space-y-2 pb-4 border-b border-slate-200">
                <p className="text-xs font-semibold text-[#2563EB]">
                  Service Specification · {activePillar.title}
                </p>
                <h3 className="text-2xl font-display font-bold text-[#0B162C]">
                  {selectedService.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedService.summary}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#0B162C]">Key Deliverables</h4>
                <ul className="space-y-2.5">
                  {selectedService.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2
                        className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-1">
                <p className="text-xs font-semibold text-slate-500">Ideal For</p>
                <p className="text-sm font-medium text-[#0B162C]">{selectedService.idealFor}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onRequestQuoteForService({
                    serviceRequired: selectedService.title,
                    projectRequirements: `We are interested in ${selectedService.title} (${activePillar.title}). Please share a consultation plan and estimate.`,
                  })
                }
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
              >
                <span>Request Quote for {selectedService.title}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </aside>
          </div>
        </div>
      </section>

      {/* Complete 4-Pillar Index Overview */}
      <section className="py-14 border-b border-slate-200 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-display font-bold text-[#0B162C]">
              Full Service Directory
            </h2>
            <p className="text-sm text-slate-600">
              Click any service below to open its full deliverables specification above.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICE_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              >
                <h3 className="text-base font-display font-bold text-[#0B162C]">
                  {pillar.index}. {pillar.title}
                </h3>
                <ul className="space-y-2">
                  {pillar.services.map((svc) => (
                    <li key={svc.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePillarId(pillar.id);
                          setSelectedService(svc);
                          window.scrollTo({ top: 180, behavior: 'smooth' });
                        }}
                        className="text-left text-sm text-slate-600 hover:text-[#2563EB] transition-colors cursor-pointer"
                      >
                        {svc.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Solution Scope Advisor */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SolutionAdvisor onApplyToEnquiry={onRequestQuoteForService} />
        </div>
      </section>
    </div>
  );
};
