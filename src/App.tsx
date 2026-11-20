import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PortfolioDemoModal } from './components/PortfolioDemoModal';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { IndustriesPage } from './pages/IndustriesPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ProcessPage } from './pages/ProcessPage';
import { ContactPage } from './pages/ContactPage';
import type { PageRoute, PortfolioProject } from './data/rexoraData';

const PAGE_SEO: Record<PageRoute, { title: string; description: string }> = {
  home: {
    title: 'RexoraTech — Smart Technology. Better Business.',
    description:
      'Rexora Technologies (RexoraTech) in Delhi, India empowers businesses with website development, workflow automation, data analytics, and custom digital systems.',
  },
  about: {
    title: 'About Us — RexoraTech (Rexora Technologies)',
    description:
      'Learn about Rexora Technologies in Delhi, India—our mission, vision, operational approach, and why businesses choose RexoraTech.',
  },
  services: {
    title: 'Services — Website Development, Automation & MIS | RexoraTech',
    description:
      'Explore 25 specialized capabilities across Website Development, Business Automation, Data Analytics & MIS, and Digital Business Solutions.',
  },
  industries: {
    title: 'Industries We Serve — RexoraTech',
    description:
      'See how RexoraTech solves real operational bottlenecks for Manufacturing, Restaurants, Traders, Retail, Distributors, SMEs, and Service Businesses.',
  },
  portfolio: {
    title: 'Portfolio & Interactive Demos — RexoraTech',
    description:
      'Preview live demonstration prototypes including Inventory Management, Store Management, Business Websites, MIS Reporting, and Sales & Purchase Trackers.',
  },
  process: {
    title: 'Our Process — How RexoraTech Delivers | Rexora Technologies',
    description:
      'Inspect RexoraTech’s structured 5-stage delivery methodology from operational discovery and schema design to build, testing, and support.',
  },
  contact: {
    title: 'Contact Us — RexoraTech (Delhi, India)',
    description:
      'Submit a project enquiry or email Rexora Technologies directly at rexoratech.dl@gmail.com for website, automation, and MIS solutions.',
  },
};

function resolveInitialPage(): PageRoute {
  const hash = window.location.hash.replace('#', '').split('-')[0] as PageRoute;
  const validPages: PageRoute[] = [
    'home',
    'about',
    'services',
    'industries',
    'portfolio',
    'process',
    'contact',
  ];
  return validPages.includes(hash) ? hash : 'home';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>(resolveInitialPage);
  const [selectedPillarId, setSelectedPillarId] = useState<string | undefined>(undefined);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string | undefined>(undefined);
  const [activeDemo, setActiveDemo] = useState<PortfolioProject | null>(null);
  const [contactPrefill, setContactPrefill] = useState<{
    serviceRequired?: string;
    projectRequirements?: string;
  } | null>(null);

  useEffect(() => {
    const seo = PAGE_SEO[currentPage];
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', seo.description);
    }
  }, [currentPage]);

  useEffect(() => {
    const onHashChange = () => {
      setCurrentPage(resolveInitialPage());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (page: PageRoute, detailId?: string) => {
    setCurrentPage(page);
    if (page === 'services') {
      setSelectedPillarId(detailId);
    } else if (page === 'industries') {
      setSelectedIndustryId(detailId);
    }
    window.history.replaceState(null, '', `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuotePrefill = (prefill: {
    serviceRequired: string;
    projectRequirements: string;
  }) => {
    setContactPrefill(prefill);
    setActiveDemo(null);
    handleNavigate('contact');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0B162C]">
      <Navbar currentPage={currentPage} onNavigate={(page) => handleNavigate(page)} />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} onOpenDemo={setActiveDemo} />
        )}
        {currentPage === 'about' && <AboutPage onNavigate={(p) => handleNavigate(p)} />}
        {currentPage === 'services' && (
          <ServicesPage
            initialPillarId={selectedPillarId}
            onNavigate={(p) => handleNavigate(p)}
            onRequestQuoteForService={handleQuotePrefill}
          />
        )}
        {currentPage === 'industries' && (
          <IndustriesPage
            highlightIndustryId={selectedIndustryId}
            onRequestIndustryConsultation={handleQuotePrefill}
          />
        )}
        {currentPage === 'portfolio' && (
          <PortfolioPage
            onOpenDemo={setActiveDemo}
            onRequestQuote={() => handleNavigate('contact')}
          />
        )}
        {currentPage === 'process' && <ProcessPage onNavigate={(p) => handleNavigate(p)} />}
        {currentPage === 'contact' && <ContactPage prefill={contactPrefill} />}
      </main>

      <Footer onNavigate={handleNavigate} />

      <PortfolioDemoModal
        project={activeDemo}
        onClose={() => setActiveDemo(null)}
        onRequestSimilar={(projectTitle) =>
          handleQuotePrefill({
            serviceRequired: 'Custom Digital Solutions',
            projectRequirements: `Interested in a custom build modeled after the "${projectTitle}" demonstration prototype.`,
          })
        }
      />
    </div>
  );
}
