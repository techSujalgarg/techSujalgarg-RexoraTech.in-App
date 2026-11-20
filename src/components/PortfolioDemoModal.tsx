import React, { useMemo, useState } from 'react';
import {
  X,
  Search,
  Plus,
  Minus,
  Download,
  Monitor,
  Smartphone,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import {
  DEMO_INVENTORY_SEED,
  DEMO_LEDGER_SEED,
  type PortfolioProject,
} from '../data/rexoraData';
import {
  calculateInventoryMetrics,
  filterInventoryItems,
  formatInr,
  summarizeLedger,
  type DemoInventoryItem,
  type LedgerTransaction,
} from '../utils/portfolioFilter';
import { SafeImage } from './SafeImage';

interface PortfolioDemoModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
  onRequestSimilar: (projectTitle: string) => void;
}

const STORE_CATALOG = [
  { id: 'POS-01', name: 'Artisan Filter Coffee 250g', priceInr: 420 },
  { id: 'POS-02', name: 'Ceramic Pour-Over Dripper', priceInr: 890 },
  { id: 'POS-03', name: 'Cold Brew Concentrate Bottle', priceInr: 310 },
  { id: 'POS-04', name: 'Stainless Steel Travel Tumbler', priceInr: 1150 },
];

export const PortfolioDemoModal: React.FC<PortfolioDemoModalProps> = ({
  project,
  onClose,
  onRequestSimilar,
}) => {
  // Inventory demo state
  const [inventory, setInventory] = useState<DemoInventoryItem[]>(DEMO_INVENTORY_SEED);
  const [invSearch, setInvSearch] = useState('');
  const [invStatus, setInvStatus] = useState<'all' | 'low' | 'healthy'>('all');

  // Store POS demo state
  const [cart, setCart] = useState<Record<string, number>>({ 'POS-01': 2, 'POS-03': 1 });
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Card' | 'Cash'>('UPI');

  // Business Website demo state
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  // Automated Reporting demo state
  const [reportCadence, setReportCadence] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  // Sales & Purchase Tracker demo state
  const [ledger, setLedger] = useState<LedgerTransaction[]>(DEMO_LEDGER_SEED);
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'All' | 'Sale' | 'Purchase'>('All');
  const [newTxType, setNewTxType] = useState<'Sale' | 'Purchase'>('Sale');
  const [newTxParty, setNewTxParty] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('25000');

  // Analytics Dashboard demo state
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3');

  const filteredInventory = useMemo(
    () => filterInventoryItems(inventory, invSearch, invStatus),
    [inventory, invSearch, invStatus]
  );
  const inventoryMetrics = useMemo(() => calculateInventoryMetrics(inventory), [inventory]);

  const filteredLedger = useMemo(() => {
    if (ledgerTypeFilter === 'All') return ledger;
    return ledger.filter((row) => row.type === ledgerTypeFilter);
  }, [ledger, ledgerTypeFilter]);
  const ledgerSummary = useMemo(() => summarizeLedger(ledger), [ledger]);

  if (!project) return null;

  const adjustStock = (sku: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, inStock: Math.max(0, item.inStock + delta) } : item
      )
    );
  };

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const next = (prev[id] ?? 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const storeSubtotal = STORE_CATALOG.reduce(
    (sum, item) => sum + (cart[item.id] ?? 0) * item.priceInr,
    0
  );
  const storeGst = Math.round(storeSubtotal * 0.18);
  const storeTotal = storeSubtotal + storeGst;

  const handleDownloadSampleCsv = () => {
    const rows = [
      ['Cadence', 'Department', 'Metric', 'Actual', 'Target', 'Variance'],
      [reportCadence, 'Operations', 'Order Dispatch SLA', '96.4%', '95.0%', '+1.4%'],
      [reportCadence, 'Inventory', 'Low Stock SKUs', String(inventoryMetrics.lowStockCount), '0', `+${inventoryMetrics.lowStockCount}`],
      [reportCadence, 'Finance', 'Net Trade Margin', formatInr(ledgerSummary.netMarginInr), 'INR 1,50,000', 'On Track'],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rexoratech-demo-${reportCadence.toLowerCase()}-mis.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddLedgerRow = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(newTxAmount);
    if (!newTxParty.trim() || Number.isNaN(numericAmount) || numericAmount <= 0) return;

    const nextRow: LedgerTransaction = {
      id: `TX-${8850 + ledger.length}`,
      date: new Date().toISOString().slice(0, 10),
      type: newTxType,
      partyLabel: newTxParty.trim(),
      category: 'Demo Entry',
      amountInr: numericAmount,
      status: 'Pending',
    };
    setLedger((prev) => [nextRow, ...prev]);
    setNewTxParty('');
  };

  const analyticsByQuarter: Record<
    'Q1' | 'Q2' | 'Q3' | 'Q4',
    { bars: { label: string; value: number }[]; marginPct: string; fulfillment: string }
  > = {
    Q1: {
      bars: [
        { label: 'North NCR', value: 68 },
        { label: 'West Zone', value: 52 },
        { label: 'East Hub', value: 41 },
        { label: 'South Retail', value: 59 },
      ],
      marginPct: '24.2%',
      fulfillment: '94.8%',
    },
    Q2: {
      bars: [
        { label: 'North NCR', value: 74 },
        { label: 'West Zone', value: 61 },
        { label: 'East Hub', value: 49 },
        { label: 'South Retail', value: 66 },
      ],
      marginPct: '25.8%',
      fulfillment: '95.6%',
    },
    Q3: {
      bars: [
        { label: 'North NCR', value: 86 },
        { label: 'West Zone', value: 72 },
        { label: 'East Hub', value: 58 },
        { label: 'South Retail', value: 79 },
      ],
      marginPct: '27.4%',
      fulfillment: '97.1%',
    },
    Q4: {
      bars: [
        { label: 'North NCR', value: 92 },
        { label: 'West Zone', value: 78 },
        { label: 'East Hub', value: 64 },
        { label: 'South Retail', value: 84 },
      ],
      marginPct: '28.1%',
      fulfillment: '97.9%',
    },
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B162C]/75 p-4 overflow-y-auto"
    >
      <div className="w-full max-w-5xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 bg-[#0B162C] text-white">
          <div>
            <p className="text-xs font-medium text-blue-300">
              Demonstration Project · Interactive Prototype (Sample Data Only)
            </p>
            <h2 id="demo-modal-title" className="mt-1 text-xl sm:text-2xl font-display font-bold">
              {project.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close demonstration preview"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {project.demoType === 'inventory' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Tracked SKUs</p>
                  <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#0B162C]">
                    {inventoryMetrics.totalSkus}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Units on Hand</p>
                  <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#0B162C]">
                    {inventoryMetrics.totalUnits}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-800">Low / Out Alerts</p>
                  <p className="mt-1 text-xl font-bold font-mono tabular-nums text-amber-900">
                    {inventoryMetrics.lowStockCount}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Stock Valuation</p>
                  <p className="mt-1 text-xl font-bold font-mono tabular-nums text-[#0B162C]">
                    {formatInr(inventoryMetrics.totalValueInr)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={invSearch}
                    onChange={(e) => setInvSearch(e.target.value)}
                    placeholder="Search SKU, item, or warehouse..."
                    aria-label="Search demonstration inventory"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  {(['all', 'low', 'healthy'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setInvStatus(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        invStatus === status
                          ? 'bg-white text-[#0B162C] shadow-xs'
                          : 'text-slate-600 hover:text-[#0B162C]'
                      }`}
                    >
                      {status === 'all' ? 'All SKUs' : status === 'low' ? 'Needs Reorder' : 'Healthy'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">SKU</th>
                      <th className="px-4 py-3 font-semibold">Item Name</th>
                      <th className="px-4 py-3 font-semibold">Warehouse</th>
                      <th className="px-4 py-3 font-semibold text-right">In Stock</th>
                      <th className="px-4 py-3 font-semibold text-right">Reorder At</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.map((item) => {
                      const isOut = item.inStock === 0;
                      const isLow = item.inStock > 0 && item.inStock <= item.reorderPoint;
                      return (
                        <tr key={item.sku} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.sku}</td>
                          <td className="px-4 py-3 font-medium text-[#0B162C]">{item.name}</td>
                          <td className="px-4 py-3 text-slate-600">{item.warehouse}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold">
                            {item.inStock}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                            {item.reorderPoint}
                          </td>
                          <td className="px-4 py-3">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                                <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-emerald-700">Optimal</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => adjustStock(item.sku, -5)}
                                aria-label={`Decrease stock for ${item.name}`}
                                className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustStock(item.sku, 10)}
                                aria-label={`Increase stock for ${item.name}`}
                                className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {project.demoType === 'store' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-sm font-semibold text-[#0B162C]">
                  Counter Catalog (Click to add to active bill)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STORE_CATALOG.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateCart(item.id, 1)}
                      className="text-left p-4 rounded-xl border border-slate-200 hover:border-[#2563EB] hover:bg-blue-50/40 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-mono text-slate-500">{item.id}</p>
                      <p className="mt-1 text-sm font-semibold text-[#0B162C]">{item.name}</p>
                      <p className="mt-2 text-sm font-mono tabular-nums font-bold text-[#2563EB]">
                        {formatInr(item.priceInr)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#0B162C]">Current Counter Receipt</h3>
                  <span className="text-xs font-mono text-slate-500">Demo Shift #04</span>
                </div>

                <div className="space-y-2.5 min-h-[120px]">
                  {STORE_CATALOG.filter((i) => (cart[i.id] ?? 0) > 0).length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">
                      Select an item from the catalog to build a demo bill.
                    </p>
                  ) : (
                    STORE_CATALOG.filter((i) => (cart[i.id] ?? 0) > 0).map((item) => {
                      const qty = cart[item.id] ?? 0;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-[#0B162C] truncate">{item.name}</p>
                            <p className="text-xs font-mono tabular-nums text-slate-500">
                              {qty} x {formatInr(item.priceInr)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateCart(item.id, -1)}
                              aria-label={`Remove one ${item.name}`}
                              className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCart(item.id, 1)}
                              aria-label={`Add one ${item.name}`}
                              className="w-7 h-7 inline-flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums">{formatInr(storeSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%)</span>
                    <span className="font-mono tabular-nums">{formatInr(storeGst)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#0B162C] pt-1 border-t border-slate-200">
                    <span>Net Payable ({paymentMode})</span>
                    <span className="font-mono tabular-nums text-[#2563EB]">
                      {formatInr(storeTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {(['UPI', 'Card', 'Cash'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                        paymentMode === mode
                          ? 'bg-[#0B162C] text-white border-[#0B162C]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {project.demoType === 'website' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-slate-600">
                  Switch viewport sizes to inspect responsive corporate web architecture.
                </p>
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setViewportMode('desktop')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      viewportMode === 'desktop'
                        ? 'bg-white text-[#0B162C] shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewportMode('mobile')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      viewportMode === 'mobile'
                        ? 'bg-white text-[#0B162C] shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl flex justify-center">
                <div
                  className={`bg-white border border-slate-300 rounded-xl overflow-hidden transition-all duration-200 ${
                    viewportMode === 'mobile' ? 'w-[340px]' : 'w-full'
                  }`}
                >
                  <div className="px-4 py-2.5 bg-[#0B162C] text-white flex items-center justify-between text-xs">
                    <span className="font-semibold">Demonstration Corporate Portal</span>
                    <span className="text-blue-300">Delhi, India</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 items-center">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#2563EB]">B2B Capability Brief</p>
                      <h3 className="text-lg font-display font-bold text-[#0B162C]">
                        Structured Digital Presence Built for Enquiries
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Clean semantic layout, clear service hierarchy, fast image delivery, and
                        validated lead capture designed for regional and national businesses.
                      </p>
                    </div>
                    <SafeImage
                      src={project.imageUrl}
                      alt="Business website demonstration preview"
                      className="w-full h-44 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {project.demoType === 'reporting' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  {(['Daily', 'Weekly', 'Monthly'] as const).map((cadence) => (
                    <button
                      key={cadence}
                      type="button"
                      onClick={() => setReportCadence(cadence)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                        reportCadence === cadence
                          ? 'bg-white text-[#0B162C] shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      {cadence} Digest
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0B162C]">
                    Automated {reportCadence} MIS Summary Preview
                  </span>
                  <span className="text-slate-500">Generated from unified sheets & logs</span>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5">KPI Metric</th>
                      <th className="px-4 py-2.5 text-right">Actual</th>
                      <th className="px-4 py-2.5 text-right">Target</th>
                      <th className="px-4 py-2.5">Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-medium">Dispatch & Logistics</td>
                      <td className="px-4 py-3 text-slate-600">On-time Order Fulfillment</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {reportCadence === 'Daily' ? '97.2%' : reportCadence === 'Weekly' ? '96.4%' : '95.9%'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                        95.0%
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-emerald-700">+1.4% above SLA</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Procurement</td>
                      <td className="px-4 py-3 text-slate-600">Low-Stock SKU Exceptions</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {inventoryMetrics.lowStockCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                        0
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-amber-700">
                        Reorder Triggered
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Accounts & Sales</td>
                      <td className="px-4 py-3 text-slate-600">Net Trade Margin</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">
                        {formatInr(ledgerSummary.netMarginInr)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                        {formatInr(150000)}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-emerald-700">On Track</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {project.demoType === 'sales-purchase' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Total Sales</p>
                  <p className="mt-1 text-lg font-bold font-mono tabular-nums text-[#0B162C]">
                    {formatInr(ledgerSummary.totalSalesInr)}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Total Purchases</p>
                  <p className="mt-1 text-lg font-bold font-mono tabular-nums text-[#0B162C]">
                    {formatInr(ledgerSummary.totalPurchasesInr)}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-[#1D4ED8]">Net Margin</p>
                  <p className="mt-1 text-lg font-bold font-mono tabular-nums text-[#0B162C]">
                    {formatInr(ledgerSummary.netMarginInr)}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500">Pending Bills</p>
                  <p className="mt-1 text-lg font-bold font-mono tabular-nums text-amber-700">
                    {ledgerSummary.pendingCount}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddLedgerRow} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <select
                  value={newTxType}
                  onChange={(e) => setNewTxType(e.target.value as 'Sale' | 'Purchase')}
                  aria-label="Transaction type"
                  className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="Sale">Sale</option>
                  <option value="Purchase">Purchase</option>
                </select>
                <input
                  type="text"
                  value={newTxParty}
                  onChange={(e) => setNewTxParty(e.target.value)}
                  placeholder="Demo batch or order label..."
                  aria-label="Party or batch label"
                  className="sm:col-span-5 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={100}
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  aria-label="Amount in INR"
                  className="sm:col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums"
                />
                <button
                  type="submit"
                  className="sm:col-span-2 px-3 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                >
                  Add Entry
                </button>
              </form>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 w-fit">
                {(['All', 'Sale', 'Purchase'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLedgerTypeFilter(t)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      ledgerTypeFilter === t ? 'bg-white text-[#0B162C]' : 'text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Ref ID</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Order / Batch Label</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLedger.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{row.id}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{row.date}</td>
                        <td className="px-4 py-2.5 font-medium">
                          <span
                            className={
                              row.type === 'Sale' ? 'text-[#2563EB]' : 'text-[#0B162C]'
                            }
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{row.partyLabel}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold">
                          {formatInr(row.amountInr)}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-medium text-slate-600">
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {project.demoType === 'analytics' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-lg bg-slate-100 p-1">
                  {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuarter(q)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                        quarter === q ? 'bg-white text-[#0B162C]' : 'text-slate-600'
                      }`}
                    >
                      {q} FY
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-slate-500">Gross Margin: </span>
                    <span className="font-mono tabular-nums font-bold text-[#0B162C]">
                      {analyticsByQuarter[quarter].marginPct}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Order SLA: </span>
                    <span className="font-mono tabular-nums font-bold text-[#2563EB]">
                      {analyticsByQuarter[quarter].fulfillment}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                <div className="md:col-span-7 p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="text-sm font-semibold text-[#0B162C]">
                    Regional Performance Index ({quarter})
                  </h3>
                  <div className="space-y-3">
                    {analyticsByQuarter[quarter].bars.map((bar) => (
                      <div key={bar.label} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-700">{bar.label}</span>
                          <span className="font-mono tabular-nums text-[#0B162C]">
                            {bar.value} pts
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                            style={{ width: `${bar.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-5">
                  <SafeImage
                    src={project.imageUrl}
                    alt="Executive analytics dashboard demonstration"
                    className="w-full h-56 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Demonstration prototype built by Rexora Technologies · No client data is displayed.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:bg-white rounded-lg cursor-pointer"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={() => onRequestSimilar(project.title)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
            >
              <span>Request Similar System</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
