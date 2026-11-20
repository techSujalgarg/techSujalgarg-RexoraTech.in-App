import React from 'react';
import { ArrowRight, Compass, Eye, Layers, Mail, ShieldCheck, Target } from 'lucide-react';
import { COMPANY_INFO, type PageRoute } from '../data/rexoraData';
import { SafeImage } from '../components/SafeImage';
import { buildMailtoHref } from '../utils/validation';

interface AboutPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white">
      {/* Page Hero */}
      <section className="bg-[#0B162C] text-white py-14 lg:py-18 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-[#60A5FA] tracking-wide uppercase">
            About Us · {COMPANY_INFO.location}
          </p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-display font-bold tracking-tight max-w-3xl">
            {COMPANY_INFO.fullCompanyName}: Engineering Practical Technology for Growing Businesses
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {COMPANY_INFO.tagline} We bridge modern web engineering, workflow automation, and clean
            data analytics so businesses run with precision.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B162C] tracking-tight">
              Company Overview
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {COMPANY_INFO.brandName} ({COMPANY_INFO.fullCompanyName}) is a Delhi-based technology
              and business solutions company built around a clear reality: most growing companies do
              not struggle from a lack of effort—they lose time and margin to fragmented
              spreadsheets, disconnected billing systems, and outdated digital storefronts.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              We solve these operational bottlenecks by combining clean web development, automated
              Google Sheets and Excel pipelines, structured inventory and store systems, and
              decision-ready MIS reporting into cohesive, maintainable tools tailored to each
              organization.
            </p>
          </div>

          <div className="lg:col-span-6">
            <SafeImage
              src="/src/assets/images/about_rexora_studio_1794846101847.jpg"
              alt="Rexora Technologies collaborative strategy room in Delhi"
              className="w-full h-80 object-cover object-[15%_center] rounded-xl border border-slate-200"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white border border-slate-200 rounded-xl p-8 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Target className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-display font-bold text-[#0B162C]">Our Mission</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              To equip businesses of every size with dependable websites, automated workflows, and
              accurate data intelligence—removing manual friction so leadership and staff can focus
              on serving customers and scaling operations.
            </p>
          </article>

          <article className="bg-white border border-slate-200 rounded-xl p-8 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Eye className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-display font-bold text-[#0B162C]">Our Vision</h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              To become a trusted long-term technology partner for enterprises, traders,
              manufacturers, and service providers across India—recognized for systems that remain
              clear, fast, and reliable long after launch day.
            </p>
          </article>
        </div>
      </section>

      {/* Our Approach & Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 space-y-3">
              <p className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
                How We Think
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#0B162C] tracking-tight">
                Our Approach
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Technology succeeds only when the people using it daily find it intuitive. We build
                around operational clarity first, then apply the right layer of software engineering.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  icon: Compass,
                  title: 'Process Before Code',
                  body: 'We document how orders, stock, and reporting flow through your business before designing screens or scripts.',
                },
                {
                  icon: Layers,
                  title: 'Modular Delivery',
                  body: 'Start with your highest-impact bottleneck—like inventory or a new corporate website—and expand cleanly over time.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Data Hygiene Built In',
                  body: 'Standardized SKU IDs, validated intake forms, and clean ledger structures keep your reports trustworthy.',
                },
                {
                  icon: Mail,
                  title: 'Direct Engineering Communication',
                  body: 'Transparent milestones, documented handovers, and responsive support directly with our team.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                >
                  <item.icon className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
                  <h3 className="text-base font-display font-bold text-[#0B162C]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200">
            <h2 className="text-2xl font-display font-bold text-[#0B162C] mb-6">
              Why Businesses Choose {COMPANY_INFO.brandName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'End-to-End Capability',
                  detail:
                    'One cohesive partner for public websites, internal Google Sheets/Excel automation, CRM, and MIS dashboards.',
                },
                {
                  title: 'Practical ROI Focus',
                  detail:
                    'Every workflow targets measurable hours saved, fewer manual entry mistakes, and faster leadership visibility.',
                },
                {
                  title: 'Zero Unnecessary Complexity',
                  detail:
                    'Clean interfaces designed for busy store managers, accountants, and business owners—not bloated enterprise menus.',
                },
              ].map((reason) => (
                <div
                  key={reason.title}
                  className="p-6 rounded-xl border border-slate-200 bg-white space-y-2"
                >
                  <h3 className="text-base font-display font-bold text-[#0B162C]">
                    {reason.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{reason.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Located in {COMPANY_INFO.location} · Serving businesses across India and globally.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={buildMailtoHref()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B162C] border border-slate-300 hover:border-[#2563EB] rounded-lg"
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span>Email Us</span>
              </a>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
              >
                <span>Start a Conversation</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
