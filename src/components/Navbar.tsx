import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { RexoraLogo } from './RexoraLogo';
import type { PageRoute } from '../data/rexoraData';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

const DESKTOP_NAV_ITEMS: { page: PageRoute; label: string }[] = [
  { page: 'about', label: 'About Us' },
  { page: 'services', label: 'Services' },
  { page: 'industries', label: 'Industries' },
  { page: 'portfolio', label: 'Portfolio' },
  { page: 'process', label: 'Our Process' },
];

const MOBILE_NAV_ITEMS: { page: PageRoute; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'about', label: 'About Us' },
  { page: 'services', label: 'Services' },
  { page: 'industries', label: 'Industries' },
  { page: 'portfolio', label: 'Portfolio' },
  { page: 'process', label: 'Our Process' },
  { page: 'contact', label: 'Contact Us' },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (page: PageRoute) => {
    setMobileOpen(false);
    onNavigate(page);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            handleSelect('home');
          }}
          aria-label="RexoraTech Home"
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB] rounded-md shrink-0"
        >
          <RexoraLogo variant="dark" size="md" />
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <a
                key={item.page}
                href={`#${item.page}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(item.page);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB] ${
                  isActive
                    ? 'text-[#2563EB] border-[#2563EB]'
                    : 'text-slate-600 border-transparent hover:text-[#0B162C] hover:border-slate-300'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('contact')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B162C] hover:bg-[#1D4ED8] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 text-[#0B162C] hover:bg-slate-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2563EB]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-1"
        >
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <a
                key={item.page}
                href={`#${item.page}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(item.page);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-[#2563EB]'
                    : 'text-[#0B162C] hover:bg-slate-50'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      )}
    </header>
  );
};
