export type PortfolioCategory =
  | 'All'
  | 'Website Development'
  | 'Business Automation'
  | 'Data Analytics & MIS'
  | 'Digital Business Solutions';

export interface FilterableProject {
  id: string;
  category: Exclude<PortfolioCategory, 'All'>;
  title: string;
}

export interface DemoInventoryItem {
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  inStock: number;
  reorderPoint: number;
  unitCostInr: number;
}

export interface InventoryMetrics {
  totalSkus: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValueInr: number;
}

export interface LedgerTransaction {
  id: string;
  date: string;
  type: 'Sale' | 'Purchase';
  partyLabel: string;
  category: string;
  amountInr: number;
  status: 'Settled' | 'Pending';
}

export interface LedgerSummary {
  totalSalesInr: number;
  totalPurchasesInr: number;
  netMarginInr: number;
  pendingCount: number;
}

export function filterProjects<T extends FilterableProject>(
  projects: readonly T[],
  category: PortfolioCategory
): T[] {
  if (category === 'All') {
    return [...projects];
  }
  return projects.filter((project) => project.category === category);
}

export function filterInventoryItems(
  items: readonly DemoInventoryItem[],
  searchQuery: string,
  statusFilter: 'all' | 'low' | 'healthy'
): DemoInventoryItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      !normalizedQuery ||
      item.sku.toLowerCase().includes(normalizedQuery) ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.category.toLowerCase().includes(normalizedQuery) ||
      item.warehouse.toLowerCase().includes(normalizedQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'low') {
      return item.inStock <= item.reorderPoint;
    }
    if (statusFilter === 'healthy') {
      return item.inStock > item.reorderPoint;
    }
    return true;
  });
}

export function calculateInventoryMetrics(
  items: readonly DemoInventoryItem[]
): InventoryMetrics {
  let totalUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let totalValueInr = 0;

  for (const item of items) {
    totalUnits += item.inStock;
    totalValueInr += item.inStock * item.unitCostInr;
    if (item.inStock === 0) {
      outOfStockCount += 1;
      lowStockCount += 1;
    } else if (item.inStock <= item.reorderPoint) {
      lowStockCount += 1;
    }
  }

  return {
    totalSkus: items.length,
    totalUnits,
    lowStockCount,
    outOfStockCount,
    totalValueInr,
  };
}

export function summarizeLedger(transactions: readonly LedgerTransaction[]): LedgerSummary {
  let totalSalesInr = 0;
  let totalPurchasesInr = 0;
  let pendingCount = 0;

  for (const tx of transactions) {
    if (tx.type === 'Sale') {
      totalSalesInr += tx.amountInr;
    } else {
      totalPurchasesInr += tx.amountInr;
    }
    if (tx.status === 'Pending') {
      pendingCount += 1;
    }
  }

  return {
    totalSalesInr,
    totalPurchasesInr,
    netMarginInr: totalSalesInr - totalPurchasesInr,
    pendingCount,
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
