import type {
  DemoInventoryItem,
  LedgerTransaction,
  PortfolioCategory,
} from '../utils/portfolioFilter';

export type PageRoute =
  | 'home'
  | 'about'
  | 'services'
  | 'industries'
  | 'portfolio'
  | 'process'
  | 'contact';

export interface CompanyProfile {
  brandName: string;
  fullCompanyName: string;
  officialEmail: string;
  location: string;
  tagline: string;
}

export const COMPANY_INFO: CompanyProfile = {
  brandName: 'RexoraTech',
  fullCompanyName: 'Rexora Technologies',
  officialEmail: 'rexoratech.dl@gmail.com',
  location: 'Delhi, India',
  tagline: 'Smart Technology. Better Business.',
};

export interface ServiceDetail {
  id: string;
  title: string;
  summary: string;
  deliverables: string[];
  idealFor: string;
}

export interface ServicePillar {
  id: 'website-development' | 'business-automation' | 'data-analytics-mis' | 'digital-solutions';
  index: string;
  title: string;
  shortTitle: string;
  description: string;
  outcome: string;
  services: ServiceDetail[];
}

export const SERVICE_PILLARS: ServicePillar[] = [
  {
    id: 'website-development',
    index: '01',
    title: 'Website Development',
    shortTitle: 'Web Engineering',
    description:
      'High-conversion corporate websites, storefronts, and custom web applications engineered for speed, accessibility, and search visibility.',
    outcome: 'Establish credible digital presence that turns visitors into verified business enquiries.',
    services: [
      {
        id: 'business-websites',
        title: 'Business Websites',
        summary:
          'Multi-page corporate websites structured around clear service positioning, fast load performance, and lead capture.',
        deliverables: [
          'Responsive desktop, tablet, and mobile architecture',
          'SEO-ready semantic markup and structured metadata',
          'Validated enquiry forms integrated with email workflows',
        ],
        idealFor: 'Established enterprises, B2B firms, and growing regional brands',
      },
      {
        id: 'ecommerce-websites',
        title: 'E-commerce Websites',
        summary:
          'Catalog-driven online storefronts with category filtering, cart management, GST-ready invoicing, and order tracking.',
        deliverables: [
          'Product catalog & SKU variant management',
          'Streamlined checkout and order status workflows',
          'Inventory synchronization hooks with internal spreadsheets or ERPs',
        ],
        idealFor: 'Retailers, wholesalers, and D2C product brands',
      },
      {
        id: 'portfolio-websites',
        title: 'Portfolio Websites',
        summary:
          'Editorial showcase platforms highlighting technical case studies, visual work, and structured capability briefs.',
        deliverables: [
          'Filterable project gallery with interactive previews',
          'Optimized media loading and clean typographic hierarchy',
          'Direct consultation booking flow',
        ],
        idealFor: 'Consultancies, architecture studios, and specialized agencies',
      },
      {
        id: 'landing-pages',
        title: 'Landing Pages',
        summary:
          'Focused campaign pages engineered for product launches, regional lead generation, and paid acquisition funnels.',
        deliverables: [
          'Single-goal layout with clear value hierarchy',
          'Lightweight bundle for instant mobile rendering',
          'Conversion tracking and lead routing',
        ],
        idealFor: 'New service launches and targeted B2B outreach campaigns',
      },
      {
        id: 'website-redesign',
        title: 'Website Redesign',
        summary:
          'Modernizing outdated websites with cohesive design systems, stronger mobile usability, and cleaner information architecture.',
        deliverables: [
          'UX audit and content restructuring',
          'Modern visual identity alignment without losing search equity',
          'Accessibility and Core Web Vitals optimization',
        ],
        idealFor: 'Businesses outgrowing legacy templates or slow sites',
      },
      {
        id: 'website-maintenance',
        title: 'Website Maintenance',
        summary:
          'Ongoing technical stewardship covering uptime monitoring, security updates, content revisions, and performance tuning.',
        deliverables: [
          'Scheduled backups and dependency security patches',
          'Content, product, and page layout updates',
          'Continuous broken-link and speed diagnostics',
        ],
        idealFor: 'Teams needing dependable engineering support post-launch',
      },
    ],
  },
  {
    id: 'business-automation',
    index: '02',
    title: 'Business Automation',
    shortTitle: 'Workflow Automation',
    description:
      'Replace repetitive manual spreadsheets and paper registers with synchronized, rule-driven operational systems.',
    outcome: 'Eliminate data entry errors and reclaim hours every week across inventory, sales, and store operations.',
    services: [
      {
        id: 'google-sheets-automation',
        title: 'Google Sheets Automation',
        summary:
          'Custom Apps Script pipelines, cross-sheet synchronization, automated validations, and scheduled summary generation.',
        deliverables: [
          'Automated data validation and duplicate prevention',
          'Cross-department master workbook syncing',
          'Scheduled PDF & email digest triggers',
        ],
        idealFor: 'Teams running daily operations across multiple shared sheets',
      },
      {
        id: 'inventory-management-systems',
        title: 'Inventory Management Systems',
        summary:
          'Centralized stock visibility across warehouses and stores with reorder thresholds, batch tracking, and movement logs.',
        deliverables: [
          'Real-time inward/outward stock ledger',
          'Automated low-stock alerts at SKU reorder points',
          'Multi-location stock transfer tracking',
        ],
        idealFor: 'Manufacturers, distributors, and multi-outlet traders',
      },
      {
        id: 'store-management-systems',
        title: 'Store Management Systems',
        summary:
          'End-to-end store operations covering daily opening/closing logs, counter billing, staff shift records, and stock reconciliation.',
        deliverables: [
          'Counter-ready billing and receipt generation',
          'Daily cash & digital settlement reconciliation',
          'Shift-wise sales and shrinkage tracking',
        ],
        idealFor: 'Retail stores, quick-service restaurants, and showrooms',
      },
      {
        id: 'stock-management',
        title: 'Stock Management',
        summary:
          'Structured SKU classification, safety-stock calculations, dead-stock identification, and vendor lead-time monitoring.',
        deliverables: [
          'ABC/fast-moving SKU categorization',
          'Automated stock aging and expiry flags',
          'Audit-ready physical verification sheets',
        ],
        idealFor: 'Wholesalers, pharmacies, and FMCG stockists',
      },
      {
        id: 'sales-purchase-management',
        title: 'Sales & Purchase Management',
        summary:
          'Connected procurement and sales order tracking from purchase requisition and vendor bills to customer dispatch.',
        deliverables: [
          'Vendor purchase order & GRN reconciliation',
          'Customer quotation-to-invoice status tracking',
          'Payable and receivable aging schedules',
        ],
        idealFor: 'Traders, B2B suppliers, and distribution businesses',
      },
      {
        id: 'automated-reports',
        title: 'Automated Reports',
        summary:
          'Zero-touch daily, weekly, and monthly executive reports compiled automatically from operational data sources.',
        deliverables: [
          'Scheduled daily closing summaries for owners',
          'Standardized department KPI packs',
          'Exception alerts for margin drops or overdue bills',
        ],
        idealFor: 'Founders and operations managers tired of manual compilation',
      },
      {
        id: 'custom-business-workflows',
        title: 'Custom Business Workflows',
        summary:
          'Tailored approval chains, document routing, and multi-step operational pipelines mapped directly to your SOPs.',
        deliverables: [
          'Role-based approval and escalation flows',
          'Webhook and form-to-database integrations',
          'Audit trails for every operational state change',
        ],
        idealFor: 'Growing SMEs with unique operational processes',
      },
    ],
  },
  {
    id: 'data-analytics-mis',
    index: '03',
    title: 'Data Analytics & MIS',
    shortTitle: 'Analytics & MIS',
    description:
      'Turn fragmented spreadsheets, billing exports, and raw logs into clean, decision-ready management intelligence.',
    outcome: 'Give leadership clear visibility into margins, cash flow, and operational bottlenecks.',
    services: [
      {
        id: 'data-analysis',
        title: 'Data Analysis',
        summary:
          'Structured diagnostic analysis of sales trends, seasonal demand, SKU profitability, and customer retention patterns.',
        deliverables: [
          'Margin and product-mix profitability breakdowns',
          'Regional and channel performance comparisons',
          'Actionable executive findings brief',
        ],
        idealFor: 'Businesses sitting on years of unanalyzed billing or ERP exports',
      },
      {
        id: 'data-cleaning',
        title: 'Data Cleaning',
        summary:
          'Standardizing messy catalogs, deduplicating party ledgers, fixing date/GST formats, and normalizing multi-source records.',
        deliverables: [
          'Deduplicated customer, vendor, and SKU masters',
          'Consistent formatting and validation rules',
          'Reusable cleanup pipelines for recurring imports',
        ],
        idealFor: 'Companies migrating systems or consolidating branch records',
      },
      {
        id: 'mis-reporting',
        title: 'MIS Reporting',
        summary:
          'Comprehensive Management Information Systems delivering weekly P&L snapshots, expense ratios, and departmental metrics.',
        deliverables: [
          'Standardized monthly and weekly MIS templates',
          'Department-wise cost and output tracking',
          'Budget vs. actual variance views',
        ],
        idealFor: 'Directors and finance teams requiring consistent governance',
      },
      {
        id: 'excel-automation',
        title: 'Excel Automation',
        summary:
          'Power Query pipelines, dynamic formulas, and automated macro workflows that eliminate manual copy-paste reporting.',
        deliverables: [
          'One-click CSV/ERP import consolidation',
          'Protected, error-proof calculation models',
          'Automated multi-tab summary generation',
        ],
        idealFor: 'Finance, accounting, and operations teams anchored in Excel',
      },
      {
        id: 'interactive-dashboards',
        title: 'Interactive Dashboards',
        summary:
          'Clean web and BI dashboards with date-range filters, drill-downs, and KPI cards built for daily leadership review.',
        deliverables: [
          'Interactive filtering by branch, product, or timeframe',
          'Tabular drill-down views with exportable slices',
          'Role-appropriate executive summaries',
        ],
        idealFor: 'Multi-branch businesses and fast-moving teams',
      },
      {
        id: 'business-performance-reports',
        title: 'Business Performance Reports',
        summary:
          'Periodic diagnostic reports benchmarking revenue velocity, operational turnaround, and working-capital efficiency.',
        deliverables: [
          'Clear visual KPI narratives for stakeholders',
          'Bottleneck and leakage identification',
          'Quarterly target tracking matrices',
        ],
        idealFor: 'SME leadership teams planning expansion',
      },
    ],
  },
  {
    id: 'digital-solutions',
    index: '04',
    title: 'Digital Business Solutions',
    shortTitle: 'Digital Systems',
    description:
      'Purpose-built internal tools for customer relationships, staff operations, billing, and digital intake.',
    outcome: 'Unify scattered tools into cohesive, easy-to-adopt systems built around how your team actually works.',
    services: [
      {
        id: 'crm-solutions',
        title: 'CRM Solutions',
        summary:
          'Lightweight, disciplined lead and pipeline trackers ensuring every enquiry receives timely follow-up.',
        deliverables: [
          'Lead capture, stage tracking, and follow-up reminders',
          'Enquiry source and conversion visibility',
          'Clean customer interaction timelines',
        ],
        idealFor: 'Sales teams moving away from scattered chat threads and notebooks',
      },
      {
        id: 'employee-management-systems',
        title: 'Employee Management Systems',
        summary:
          'Centralized staff directories, shift rosters, attendance logs, leave tracking, and task accountability.',
        deliverables: [
          'Attendance and shift roster management',
          'Leave request and approval tracking',
          'Departmental task and responsibility logs',
        ],
        idealFor: 'SMEs, retail chains, and hospitality outlets',
      },
      {
        id: 'customer-management',
        title: 'Customer Management',
        summary:
          'Organized client records tracking order history, repeat purchase intervals, preferences, and support notes.',
        deliverables: [
          'Unified customer profile and transaction history',
          'Repeat-order and renewal reminders',
          'Segmented customer lists for outreach',
        ],
        idealFor: 'Service businesses, B2B suppliers, and specialty retailers',
      },
      {
        id: 'billing-expense-tracking',
        title: 'Billing & Expense Tracking',
        summary:
          'Structured invoice generation, petty cash logs, vendor payment schedules, and category-wise expense visibility.',
        deliverables: [
          'Digital invoice and receipt generation',
          'Daily operational expense categorization',
          'Monthly cash inflow vs. outflow reconciliation',
        ],
        idealFor: 'Growing businesses needing tighter daily financial control',
      },
      {
        id: 'google-forms-automation',
        title: 'Google Forms Automation',
        summary:
          'Smart intake forms connected directly to automated sheets, instant PDF confirmations, and team task assignments.',
        deliverables: [
          'Structured field intake, inspection, and order forms',
          'Automatic response routing and formatting',
          'Instant summary document generation',
        ],
        idealFor: 'Field teams, onboarding workflows, and order desks',
      },
      {
        id: 'custom-digital-solutions',
        title: 'Custom Digital Solutions',
        summary:
          'Bespoke web applications and internal portals engineered when off-the-shelf software forces awkward workarounds.',
        deliverables: [
          'Tailored UI and database schema around your business model',
          'Role-based access control and audit logging',
          'Full documentation and team handover',
        ],
        idealFor: 'Businesses with specialized operational requirements',
      },
    ],
  },
];

export interface IndustryProfile {
  id: string;
  name: string;
  headline: string;
  challenges: string[];
  rexoraSolutions: string[];
  recommendedServices: string[];
}

export const INDUSTRIES: IndustryProfile[] = [
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    headline: 'Synchronize raw material stock, production batches, and dispatch MIS.',
    challenges: [
      'Unrecorded raw material consumption causing sudden production halts',
      'Fragmented Excel files across store, shop floor, and accounts',
      'Delayed visibility into batch-wise wastage and unit costs',
    ],
    rexoraSolutions: [
      'Bill-of-Materials aware Inventory & Stock Management trackers',
      'Automated shop-floor daily output and rejection MIS reports',
      'Vendor purchase order and inward quality inspection workflows',
    ],
    recommendedServices: ['Inventory Management Systems', 'MIS Reporting', 'Sales & Purchase Management'],
  },
  {
    id: 'restaurants-cafes',
    name: 'Restaurants & Cafes',
    headline: 'Control kitchen inventory, daily counter settlements, and outlet margins.',
    challenges: [
      'Ingredient pilferage, spoilage, and inconsistent portion tracking',
      'Manual end-of-day reconciliation across dine-in, takeaway, and aggregators',
      'Staff shift scheduling and vendor bill tracking on paper registers',
    ],
    rexoraSolutions: [
      'Daily ingredient consumption vs. sales variance automation',
      'Unified Store Management & daily expense reconciliation sheet',
      'Mobile-ready brand website with digital menu and direct enquiry capture',
    ],
    recommendedServices: ['Store Management Systems', 'Billing & Expense Tracking', 'Business Websites'],
  },
  {
    id: 'traders-wholesalers',
    name: 'Traders & Wholesalers',
    headline: 'Keep fast-moving SKUs, party ledgers, and margins accurate in real time.',
    challenges: [
      'Price-tier confusion across bulk buyers and frequent rate changes',
      'Overdue party receivables hidden inside unorganized tally exports',
      'Time lost preparing daily stock availability lists for buyers',
    ],
    rexoraSolutions: [
      'Live Sales & Purchase Tracker with automated party aging alerts',
      'Clean SKU catalog and automated stock-in-hand sheets',
      'B2B product showcase website driving direct wholesale enquiries',
    ],
    recommendedServices: ['Sales & Purchase Management', 'Google Sheets Automation', 'Business Websites'],
  },
  {
    id: 'retail-businesses',
    name: 'Retail Businesses',
    headline: 'Bridge physical store counters with online discovery and clean stock control.',
    challenges: [
      'Dead stock tying up working capital while top sellers run out',
      'Disjointed records between physical store sales and online enquiries',
      'Slow manual preparation of monthly GST and category performance summaries',
    ],
    rexoraSolutions: [
      'Store Management System with low-stock reorder triggers',
      'E-commerce storefront synced with store inventory quantities',
      'Category-wise margin and fast/slow-mover analytics dashboards',
    ],
    recommendedServices: ['E-commerce Websites', 'Store Management Systems', 'Interactive Dashboards'],
  },
  {
    id: 'distributors',
    name: 'Distributors',
    headline: 'Coordinate multi-warehouse stock, field orders, and beat-wise collections.',
    challenges: [
      'Field sales orders arriving over unstructured chat messages with SKU errors',
      'Lack of visibility into warehouse-to-warehouse stock movement',
      'Hours spent consolidating daily dispatch and collection sheets',
    ],
    rexoraSolutions: [
      'Google Forms & mobile order intake piped directly into dispatch queues',
      'Multi-location Inventory Management and stock transfer logs',
      'Automated evening MIS digests for territory managers',
    ],
    recommendedServices: ['Google Forms Automation', 'Inventory Management Systems', 'Automated Reports'],
  },
  {
    id: 'smes',
    name: 'Small & Medium Enterprises',
    headline: 'Replace ad-hoc spreadsheets with structured, scalable digital infrastructure.',
    challenges: [
      'Critical business knowledge locked inside personal notebooks or disconnected files',
      'No single source of truth for leads, billing, and employee attendance',
      'Outdated company website failing to reflect current capabilities',
    ],
    rexoraSolutions: [
      'Modern corporate website paired with clean CRM lead tracking',
      'Integrated Employee, Billing, and Expense tracking workflows',
      'Monthly MIS reporting packs built directly from clean operational data',
    ],
    recommendedServices: ['Business Websites', 'CRM Solutions', 'MIS Reporting'],
  },
  {
    id: 'service-businesses',
    name: 'Service Businesses',
    headline: 'Streamline client onboarding, project billing, and team capacity tracking.',
    challenges: [
      'Enquiries slipping through the cracks without structured follow-up',
      'Manual client onboarding forms and repetitive proposal formatting',
      'Unclear visibility into project profitability and pending retainers',
    ],
    rexoraSolutions: [
      'Conversion-focused website & landing pages with validated enquiry routing',
      'Customer Management & Google Forms onboarding automation',
      'Billing, expense, and utilization performance dashboards',
    ],
    recommendedServices: ['Landing Pages', 'Customer Management', 'Business Performance Reports'],
  },
];

export interface PortfolioProject {
  id: string;
  title: string;
  category: Exclude<PortfolioCategory, 'All'>;
  summary: string;
  capabilities: string[];
  demoType:
    | 'inventory'
    | 'store'
    | 'website'
    | 'reporting'
    | 'sales-purchase'
    | 'analytics';
  imageUrl?: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'demo-inventory-dashboard',
    title: 'Inventory Management Dashboard',
    category: 'Business Automation',
    summary:
      'Interactive multi-warehouse SKU monitoring system with automated reorder-point alerts, inward/outward stock adjustments, and real-time valuation.',
    capabilities: [
      'Live SKU search & warehouse filtering',
      'Automated low-stock threshold flags',
      'Real-time inventory valuation in tabular figures',
    ],
    demoType: 'inventory',
    imageUrl: '/src/assets/images/industries_smart_operations_1794846103547.jpg',
  },
  {
    id: 'demo-store-management',
    title: 'Store Management System',
    category: 'Business Automation',
    summary:
      'Counter-ready store billing and shift reconciliation workspace designed for retail outlets and quick-service operations.',
    capabilities: [
      'Interactive item billing & tax calculation',
      'Payment mode split (Cash / UPI / Card)',
      'Instant shift register settlement summary',
    ],
    demoType: 'store',
  },
  {
    id: 'demo-business-website',
    title: 'Business Website',
    category: 'Website Development',
    summary:
      'Responsive corporate web architecture preview demonstrating clear hierarchy, service navigation, and desktop/mobile viewport adaptation.',
    capabilities: [
      'Desktop & mobile viewport switcher',
      'Structured B2B service & capability layout',
      'Fast-loading semantic markup',
    ],
    demoType: 'website',
    imageUrl: '/src/assets/images/web_platform_showcase_1794846103244.jpg',
  },
  {
    id: 'demo-automated-reporting',
    title: 'Automated Reporting System',
    category: 'Data Analytics & MIS',
    summary:
      'Scheduled MIS report compiler demonstrating automated daily, weekly, and monthly operational digests with clean CSV export.',
    capabilities: [
      'Cadence selector (Daily / Weekly / Monthly)',
      'Departmental variance & exception highlights',
      'One-click CSV report download',
    ],
    demoType: 'reporting',
  },
  {
    id: 'demo-sales-purchase-tracker',
    title: 'Sales & Purchase Tracker',
    category: 'Digital Business Solutions',
    summary:
      'Unified procurement and sales ledger tracking order status, net margin calculations, and pending settlements across parties.',
    capabilities: [
      'Filter by Sale vs. Purchase & settlement status',
      'Add new ledger entry in-browser',
      'Automated net margin & pending count calculation',
    ],
    demoType: 'sales-purchase',
  },
  {
    id: 'demo-data-analytics-dashboard',
    title: 'Data Analytics Dashboard',
    category: 'Data Analytics & MIS',
    summary:
      'Executive performance workbench visualizing revenue mix, regional distribution, and monthly operating trends.',
    capabilities: [
      'Quarter & region interactive slice',
      'Clean vector chart breakdowns',
      'Aligned tabular KPI comparisons',
    ],
    demoType: 'analytics',
    imageUrl: '/src/assets/images/analytics_mis_workstation_1794846102395.jpg',
  },
];

export interface ProcessStep {
  stepNumber: string;
  title: string;
  durationLabel: string;
  summary: string;
  activities: string[];
  deliverable: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    stepNumber: '01',
    title: 'Discovery & Operational Audit',
    durationLabel: 'Phase 1 · Scoping',
    summary:
      'We map your existing spreadsheets, websites, billing tools, and manual bottlenecks to pinpoint where automation or better software yields immediate returns.',
    activities: [
      'Stakeholder workflow walkthroughs',
      'Audit of current sheets, forms, and web assets',
      'Clear scope definition with prioritized milestones',
    ],
    deliverable: 'Technical Scope & Workflow Architecture Brief',
  },
  {
    stepNumber: '02',
    title: 'System Design & Data Modeling',
    durationLabel: 'Phase 2 · Blueprint',
    summary:
      'Before writing production code, we structure clean schemas, user roles, UI wireframes, and validation rules so the system stays dependable as data grows.',
    activities: [
      'Database, spreadsheet, and SKU master schema design',
      'UI/UX wireframes for desktop and mobile operators',
      'Edge-case and error-handling specification',
    ],
    deliverable: 'Interactive Wireframe & Data Schema Specification',
  },
  {
    stepNumber: '03',
    title: 'Engineering & Automation Build',
    durationLabel: 'Phase 3 · Build',
    summary:
      'Our team builds your website, custom web portal, automated sheets, or MIS pipelines in clean, modular increments with regular progress reviews.',
    activities: [
      'Responsive frontend & backend / script development',
      'Automated reporting triggers and form integrations',
      'Clean data migration and normalization',
    ],
    deliverable: 'Staging Environment & Working System Modules',
  },
  {
    stepNumber: '04',
    title: 'Validation & Team Onboarding',
    durationLabel: 'Phase 4 · Testing',
    summary:
      'Every formula, permission rule, and form validation is stress-tested against real operational scenarios, followed by clear training for your staff.',
    activities: [
      'End-to-end calculation and edge-case verification',
      'Cross-device and mobile responsiveness checks',
      'Plain-language SOPs and hands-on team training',
    ],
    deliverable: 'Verified Production Release & Operator Guide',
  },
  {
    stepNumber: '05',
    title: 'Deployment & Ongoing Evolution',
    durationLabel: 'Phase 5 · Support',
    summary:
      'We monitor initial live runs, fine-tune performance, and remain available to extend your digital infrastructure as your business scales.',
    activities: [
      'Live launch monitoring and backup verification',
      'Post-launch workflow adjustments from team feedback',
      'Scheduled maintenance and incremental feature upgrades',
    ],
    deliverable: 'Production Handover & Maintenance Roadmap',
  },
];

export const DEMO_INVENTORY_SEED: DemoInventoryItem[] = [
  {
    sku: 'RX-IND-104',
    name: 'Stainless Valve Assembly 25mm',
    category: 'Industrial Hardware',
    warehouse: 'Okhla Hub',
    inStock: 142,
    reorderPoint: 60,
    unitCostInr: 840,
  },
  {
    sku: 'RX-PKG-218',
    name: 'Corrugated Export Carton (5-Ply)',
    category: 'Packaging',
    warehouse: 'Noida Depot',
    inStock: 38,
    reorderPoint: 75,
    unitCostInr: 95,
  },
  {
    sku: 'RX-ELC-309',
    name: '24V SMPS Control Module',
    category: 'Electrical',
    warehouse: 'Okhla Hub',
    inStock: 19,
    reorderPoint: 25,
    unitCostInr: 1650,
  },
  {
    sku: 'RX-RET-412',
    name: 'Thermal Barcode Label Roll (1000s)',
    category: 'Consumables',
    warehouse: 'Central Store',
    inStock: 210,
    reorderPoint: 50,
    unitCostInr: 220,
  },
  {
    sku: 'RX-FAB-501',
    name: 'Powder-Coated Shelf Bracket Set',
    category: 'Fixtures',
    warehouse: 'Noida Depot',
    inStock: 0,
    reorderPoint: 30,
    unitCostInr: 410,
  },
  {
    sku: 'RX-CHM-615',
    name: 'Food-Grade Sealing Film 450m',
    category: 'Packaging',
    warehouse: 'Central Store',
    inStock: 64,
    reorderPoint: 40,
    unitCostInr: 1180,
  },
];

export const DEMO_LEDGER_SEED: LedgerTransaction[] = [
  {
    id: 'TX-8841',
    date: '2026-11-15',
    type: 'Sale',
    partyLabel: 'Batch Order · North Zone Retail',
    category: 'Hardware & Fixtures',
    amountInr: 148500,
    status: 'Settled',
  },
  {
    id: 'TX-8842',
    date: '2026-11-14',
    type: 'Purchase',
    partyLabel: 'Supplier Dispatch · Mill Lot #19',
    category: 'Raw Packaging',
    amountInr: 64200,
    status: 'Settled',
  },
  {
    id: 'TX-8843',
    date: '2026-11-13',
    type: 'Sale',
    partyLabel: 'Wholesale Counter · West Hub',
    category: 'Electrical Modules',
    amountInr: 92400,
    status: 'Pending',
  },
  {
    id: 'TX-8844',
    date: '2026-11-12',
    type: 'Purchase',
    partyLabel: 'Component Restock · Lot #44',
    category: 'Electrical Modules',
    amountInr: 41800,
    status: 'Settled',
  },
  {
    id: 'TX-8845',
    date: '2026-11-11',
    type: 'Sale',
    partyLabel: 'Direct Trade Dispatch · NCR',
    category: 'Consumables',
    amountInr: 57600,
    status: 'Pending',
  },
];
