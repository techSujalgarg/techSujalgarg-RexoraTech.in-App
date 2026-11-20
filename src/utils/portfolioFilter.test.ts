import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInventoryMetrics,
  filterInventoryItems,
  filterProjects,
  summarizeLedger,
} from './portfolioFilter';
import {
  DEMO_INVENTORY_SEED,
  DEMO_LEDGER_SEED,
  PORTFOLIO_PROJECTS,
} from '../data/rexoraData';

test('filterProjects returns all projects for All and narrows by category', () => {
  const all = filterProjects(PORTFOLIO_PROJECTS, 'All');
  assert.equal(all.length, 6);

  const analytics = filterProjects(PORTFOLIO_PROJECTS, 'Data Analytics & MIS');
  assert.equal(analytics.length, 2);
  assert.ok(analytics.every((p) => p.category === 'Data Analytics & MIS'));
});

test('calculateInventoryMetrics computes SKU counts, low-stock alerts, and total INR value', () => {
  const metrics = calculateInventoryMetrics(DEMO_INVENTORY_SEED);
  assert.equal(metrics.totalSkus, 6);
  assert.equal(metrics.outOfStockCount, 1);
  assert.equal(metrics.lowStockCount, 3);
  assert.ok(metrics.totalUnits > 0);
  assert.ok(metrics.totalValueInr > 0);
});

test('filterInventoryItems filters by search query and low-stock status', () => {
  const lowOnly = filterInventoryItems(DEMO_INVENTORY_SEED, '', 'low');
  assert.equal(lowOnly.length, 3);

  const okhla = filterInventoryItems(DEMO_INVENTORY_SEED, 'Okhla', 'all');
  assert.equal(okhla.length, 2);
});

test('summarizeLedger computes sales, purchases, net margin, and pending count', () => {
  const summary = summarizeLedger(DEMO_LEDGER_SEED);
  assert.equal(summary.totalSalesInr, 298500);
  assert.equal(summary.totalPurchasesInr, 106000);
  assert.equal(summary.netMarginInr, 192500);
  assert.equal(summary.pendingCount, 2);
});
