import React, { useMemo, useState } from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { PORTFOLIO_PROJECTS, type PortfolioProject } from '../data/rexoraData';
import { filterProjects, type PortfolioCategory } from '../utils/portfolioFilter';
import { SafeImage } from '../components/SafeImage';

interface PortfolioPageProps {
  onOpenDemo: (project: PortfolioProject) => void;
  onRequestQuote: () => void;
}

const CATEGORIES: PortfolioCategory[] = [
  'All',
  'Website Development',
  'Business Automation',
  'Data Analytics & MIS',
  'Digital Business Solutions',
];

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  onOpenDemo,
  onRequestQuote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PortfolioCategory>('All');

  const visibleProjects = useMemo(
    () => filterProjects(PORTFOLIO_PROJECTS, selectedCategory),
    [selectedCategory]
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-[#0B162C] text-white py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-xs font-semibold text-[#60A5FA] tracking-wide uppercase">
            Portfolio · Demonstration Prototypes
          </p>
          <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight max-w-3xl">
            Interactive System Showcases Built by RexoraTech
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Inspect realistic, working prototypes of our core business systems. Every showcase
            below is a clearly labeled demonstration project populated strictly with sample data.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-slate-50 border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Filter demonstration projects by category"
            className="flex flex-wrap items-center gap-1.5"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={active}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0B162C] text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 font-mono tabular-nums">
            Showing {visibleProjects.length} of {PORTFOLIO_PROJECTS.length} demonstration projects
          </p>
        </div>
      </section>

      {/* Project Grid */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleProjects.map((project) => (
              <article
                key={project.id}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between hover:border-[#2563EB]/60 transition-colors"
              >
                <div>
                  <SafeImage
                    src={project.imageUrl}
                    alt={`${project.title} demonstration preview`}
                    fallbackTitle={project.title}
                    fallbackSubtitle="Demonstration Project · Interactive Demo"
                    className="w-full h-52 object-cover border-b border-slate-200"
                  />
                  <div className="p-6 space-y-3">
                    <div className="text-xs text-slate-500 font-medium">
                      <span>Demonstration Project</span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-[#2563EB]">{project.category}</span>
                    </div>
                    <h2 className="text-xl font-display font-bold text-[#0B162C]">
                      {project.title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{project.summary}</p>
                    <ul className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                      {project.capabilities.map((cap) => (
                        <li key={cap}>· {cap}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenDemo(project)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Preview Interactive Demo</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-14 p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="text-xl font-display font-bold text-[#0B162C]">
                Need a Custom Version Built Around Your Business Rules?
              </h2>
              <p className="text-sm text-slate-600">
                Every system above can be adapted to your SKU formats, approval flows, branding,
                and reporting schedules.
              </p>
            </div>
            <button
              type="button"
              onClick={onRequestQuote}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0B162C] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Request Custom Build</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
