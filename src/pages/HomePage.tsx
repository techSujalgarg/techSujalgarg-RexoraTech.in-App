import React from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Code2,
  Cpu,
  Globe,
  Layers,
  Mail,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import { HeroCore3D } from '../components/HeroCore3D';
import { SafeImage } from '../components/SafeImage';
import {
  COMPANY_INFO,
  INDUSTRIES,
  PORTFOLIO_PROJECTS,
  PROCESS_STEPS,
  SERVICE_PILLARS,
  type PageRoute,
  type PortfolioProject,
} from '../data/rexoraData';
import { buildMailtoHref } from '../utils/validation';

interface HomePageProps {
  onNavigate: (page: PageRoute, detailId?: string) => void;
  onOpenDemo: (project: PortfolioProject) => void;
}

const PILLAR_ICONS = {
  'website-development': Globe,
  'business-automation': Workflow,
  'data-analytics-mis': BarChart3,
  'digital-solutions': Layers,
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenDemo }) => {
  const featuredProjects = [
    PORTFOLIO_PROJECTS[0],
    PORTFOLIO_PROJECTS[2],
    PORTFOLIO_PROJECTS[5],
  ];

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="bg-[#0B162C] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-blue-300">
                <span className="whitespace-nowrap">{COMPANY_INFO.fullCompanyName}</span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">{COMPANY_INFO.location}</span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">{COMPANY_INFO.tagline}</span>
              </div>

              <h1
                className="font-display font-bold tracking-tight text-white leading-[1.08]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)' }}
              >
                Empowering Businesses Through Technology
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                From websites and business automation to data analytics and digital solutions, we
                help businesses work smarter and grow faster.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span>Explore Our Services</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white border border-white/25 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span>Get a Free Consultation</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div>
                  <p className="font-semibold text-white">Website Engineering</p>
                  <p className="text-slate-400 mt-0.5">Corporate, E-commerce & Landing</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Process Automation</p>
                  <p className="text-slate-400 mt-0.5">Inventory, Store & Sheets</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="font-semibold text-white">Analytics & MIS</p>
                  <p className="text-slate-400 mt-0.5">Excel, Cleaning & Dashboards</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex">
              <HeroCore3D />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Company Introduction */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
                About {COMPANY_INFO.brandName}
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0B162C] tracking-tight">
                Practical Engineering Built Around Real Business Operations
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Headquartered in {COMPANY_INFO.location}, {COMPANY_INFO.fullCompanyName} (
                {COMPANY_INFO.brandName}) partners with growing companies to modernize their web
                presence, eliminate repetitive manual spreadsheets, and organize business data into
                reliable management dashboards.
              </p>
              <p className="text-base text-slate-600 leading-relaxed">
                Whether you need a fast, credible corporate website or an integrated stock, store,
                and MIS reporting system, every solution we deliver is structured for daily team
                adoption and long-term maintainability.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                >
                  <span>Read About Our Company & Approach</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <SafeImage
                  src="/src/assets/images/about_rexora_studio_1794846101847.jpg"
                  alt="Rexora Technologies modern consulting office in Delhi"
                  className="w-full h-72 object-cover object-[15%_center]"
                />
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-[#0B162C]">
                    {COMPANY_INFO.fullCompanyName}
                  </span>
                  <span>{COMPANY_INFO.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Services */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
                Our Core Services
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0B162C] tracking-tight">
                Four Integrated Technology Pillars
              </h2>
              <p className="text-base text-slate-600">
                Explore dedicated engineering, automation, analytics, and business systems built to
                work together cleanly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B162C] bg-white border border-slate-300 hover:border-[#2563EB] hover:text-[#2563EB] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>View All 25 Services</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICE_PILLARS.map((pillar) => {
              const Icon = PILLAR_ICONS[pillar.id];
              return (
                <article
                  key={pillar.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-[#2563EB]/60 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB]">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {pillar.index} · {pillar.services.length} Services
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-[#0B162C]">
                        {pillar.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                      {pillar.services.slice(0, 6).map((svc) => (
                        <li key={svc.id} className="truncate">
                          · {svc.title}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('services', pillar.id)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
                    >
                      <span>Explore {pillar.title}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Industries We Serve */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
                Industries We Serve
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0B162C] tracking-tight">
                Domain-Specific Systems Across 7 Sectors
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('industries')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Explore Industry Solutions</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDUSTRIES.map((industry, idx) => (
              <button
                key={industry.id}
                type="button"
                onClick={() => onNavigate('industries', industry.id)}
                className="text-left p-5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#2563EB] transition-colors space-y-2 cursor-pointer"
              >
                <p className="text-xs font-mono text-slate-400">0{idx + 1}</p>
                <h3 className="text-base font-display font-bold text-[#0B162C]">
                  {industry.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{industry.headline}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose RexoraTech */}
      <section className="py-16 lg:py-20 bg-[#0B162C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold text-[#60A5FA] tracking-wide uppercase">
              Why Choose RexoraTech
            </p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              Built for Operational Clarity, Not Software Bloat
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Code2,
                title: 'Clean, Maintainable Architecture',
                text: 'Every website, automated spreadsheet, and dashboard is documented cleanly so your team never gets locked into fragile black-box hacks.',
              },
              {
                icon: Workflow,
                title: 'Mapped to Your Actual SOPs',
                text: 'We study how your inventory, billing, and approvals run today before engineering automation that fits your staff naturally.',
              },
              {
                icon: ShieldCheck,
                title: 'Validated Data Integrity',
                text: 'Strict input checks, structured schemas, and audit logs prevent duplicate party records, formula breaks, and reporting errors.',
              },
              {
                icon: Cpu,
                title: 'Unified Web & MIS Stack',
                text: 'Your customer-facing website, intake forms, internal stock ledgers, and executive MIS work together instead of sitting in silos.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3"
              >
                <item.icon className="w-6 h-6 text-[#60A5FA]" aria-hidden="true" />
                <h3 className="text-lg font-display font-bold text-white">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Featured Demonstration Projects */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
                Featured Demonstration Projects
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0B162C] tracking-tight">
                Interactive System Prototypes You Can Test Live
              </h2>
              <p className="text-sm text-slate-600">
                All previews below are demonstration builds powered by sample operational data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('portfolio')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B162C] border border-slate-300 hover:border-[#2563EB] hover:text-[#2563EB] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Explore All 6 Demos</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <article
                key={project.id}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between"
              >
                <div>
                  <SafeImage
                    src={project.imageUrl}
                    alt={`${project.title} demonstration preview`}
                    fallbackTitle={project.title}
                    fallbackSubtitle="Demonstration Project"
                    className="w-full h-48 object-cover border-b border-slate-200"
                  />
                  <div className="p-6 space-y-3">
                    <div className="text-xs text-slate-500 font-medium">
                      <span>Demonstration Project</span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-[#2563EB]">{project.category}</span>
                    </div>
                    <h3 className="text-lg font-display font-bold text-[#0B162C]">
                      {project.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{project.summary}</p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenDemo(project)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B162C] hover:bg-[#2563EB] rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Launch Interactive Demo</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 7. How We Work */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
                How We Work
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#0B162C] tracking-tight">
                A Transparent Five-Stage Delivery Process
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('process')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Inspect Full Process</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.stepNumber}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-2.5"
              >
                <span className="text-xs font-mono font-bold text-[#2563EB]">
                  {step.stepNumber}
                </span>
                <h3 className="text-base font-display font-bold text-[#0B162C]">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact CTA */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#0B162C] text-white p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold text-[#60A5FA] tracking-wide uppercase">
                Start Your Project · {COMPANY_INFO.location}
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                Ready to Modernize Your Website or Automate Operations?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Share your goals with {COMPANY_INFO.fullCompanyName} via our structured enquiry
                form or email us directly at{' '}
                <a
                  href={buildMailtoHref()}
                  className="text-white underline underline-offset-4 decoration-blue-400"
                >
                  {COMPANY_INFO.officialEmail}
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#60A5FA]" aria-hidden="true" />
                  Custom Scope & Architecture
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#60A5FA]" aria-hidden="true" />
                  Dedicated Support from Delhi, India
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={buildMailtoHref()}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>Email Us</span>
              </a>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0B162C] bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Get a Quote</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
