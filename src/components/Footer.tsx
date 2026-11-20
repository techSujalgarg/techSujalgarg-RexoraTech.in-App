import React from 'react';
import { Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { RexoraLogo } from './RexoraLogo';
import { COMPANY_INFO, SERVICE_PILLARS, type PageRoute } from '../data/rexoraData';
import { buildMailtoHref } from '../utils/validation';

interface FooterProps {
  onNavigate: (page: PageRoute, pillarId?: string) => void;
}

const FOOTER_PAGES: { page: PageRoute; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'about', label: 'About Us' },
  { page: 'services', label: 'Services' },
  { page: 'industries', label: 'Industries' },
  { page: 'portfolio', label: 'Portfolio' },
  { page: 'process', label: 'Our Process' },
  { page: 'contact', label: 'Contact Us' },
];

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0B162C] text-slate-300 border-t border-[#1A2B4C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-5 space-y-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              aria-label="RexoraTech Home"
              className="inline-block focus-visible:outline-2 focus-visible:outline-[#60A5FA] rounded-md"
            >
              <RexoraLogo variant="light" size="md" />
            </a>
            <p className="text-sm font-medium text-white">
              {COMPANY_INFO.fullCompanyName} · {COMPANY_INFO.tagline}
            </p>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Engineering business websites, operational automation, MIS reporting, and custom
              digital systems for ambitious enterprises and growing SMEs.
            </p>
            <div className="pt-2 space-y-2 text-sm">
              <div className="flex items-center gap-2.5 text-slate-200">
                <Mail className="w-4 h-4 text-[#60A5FA] shrink-0" aria-hidden="true" />
                <a
                  href={buildMailtoHref()}
                  className="hover:text-white transition-colors underline underline-offset-4 decoration-white/30"
                >
                  {COMPANY_INFO.officialEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-[#60A5FA] shrink-0" aria-hidden="true" />
                <span>{COMPANY_INFO.location}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-semibold text-white">Company & Pages</h2>
            <ul className="space-y-2 text-sm">
              {FOOTER_PAGES.map((item) => (
                <li key={item.page}>
                  <a
                    href={`#${item.page}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.page);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">Core Capabilities</h2>
            <ul className="space-y-2 text-sm">
              {SERVICE_PILLARS.map((pillar) => (
                <li key={pillar.id}>
                  <a
                    href={`#services-${pillar.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('services', pillar.id);
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {pillar.index}. {pillar.title}
                  </a>
                </li>
              ))}
            </ul>
            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href={buildMailtoHref()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Email Us</span>
              </a>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white border border-white/20 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Get a Quote</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {year} {COMPANY_INFO.fullCompanyName} ({COMPANY_INFO.brandName}). All rights reserved.
          </p>
          <p>{COMPANY_INFO.location} · {COMPANY_INFO.officialEmail}</p>
        </div>
      </div>
    </footer>
  );
};
