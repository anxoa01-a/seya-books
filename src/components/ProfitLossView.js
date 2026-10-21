/**
 * SEYA BOOKS - Profit & Loss (Einnahmenüberschussrechnung EÜR) View (Pure Black & White)
 */

import { ELSTER_CATEGORIES } from '../services/elsterService.js';

export function renderProfitLossView({
  transactions = [],
  totals = {},
  taxAssessment = {},
  selectedPeriod = 'year_2026',
  isKleinunternehmer = true
}) {
  const netRevenue = totals.totalIncomeNet || 0;
  const deductibleExp = totals.totalDeductibleExpense || 0;
  const netProfit = totals.netBusinessProfit || 0;
  const profitMargin = netRevenue > 0 ? Math.round((netProfit / netRevenue) * 100) : 0;

  // Group expenses by category
  const expenseBreakdown = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const catId = t.category || 'exp_other';
    const cat = ELSTER_CATEGORIES.find(c => c.id === catId) || { shortName: 'Sonstige', code: 'Zeile 48', deductiblePercent: 100 };
    if (!expenseBreakdown[catId]) {
      expenseBreakdown[catId] = {
        name: cat.shortName,
        code: cat.code,
        gross: 0,
        net: 0,
        deductiblePercent: cat.deductiblePercent ?? 100,
        deductibleAmount: 0,
        count: 0
      };
    }
    const amt = Number(t.amount) || 0;
    const vatRate = Number(t.vatRate) || 0;
    const net = vatRate > 0 ? amt / (1 + vatRate / 100) : amt;
    const deductible = net * ((cat.deductiblePercent ?? 100) / 100);

    expenseBreakdown[catId].gross += amt;
    expenseBreakdown[catId].net += net;
    expenseBreakdown[catId].deductibleAmount += deductible;
    expenseBreakdown[catId].count += 1;
  });

  const expenseItems = Object.values(expenseBreakdown).sort((a, b) => b.deductibleAmount - a.deductibleAmount);

  return `
    <div>
      <!-- Section Title & Actions -->
      <div class="section-title-row">
        <div>
          <h2 class="section-title">
            <span>Profit & Loss Statement (EÜR)</span>
            <span class="badge badge-outline">§ 4 Abs. 3 EStG</span>
          </h2>
          <div class="section-desc">Cash-basis accounting statement for German tax filing (Anlage EÜR)</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" id="btn-export-pnl-pdf">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download Statement PDF
          </button>
        </div>
      </div>

      <!-- Statement Highlights -->
      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-top">
            <span>Operating Revenue</span>
            <span class="badge badge-outline">Zeile 14</span>
          </div>
          <div class="metric-num">€${netRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Net taxable income</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Operating Expenses</span>
            <span class="badge badge-outline">Zeile 25-48</span>
          </div>
          <div class="metric-num">€${deductibleExp.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Total deductible deductions</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Net Taxable Profit</span>
            <span class="badge badge-filled">Zeile 60</span>
          </div>
          <div class="metric-num">€${netProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Einnahmenüberschuss</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Profit Margin</span>
            <span class="badge badge-outline">Ratio</span>
          </div>
          <div class="metric-num">${profitMargin}%</div>
          <div class="metric-sub">Efficiency of operations</div>
        </div>
      </div>

      <!-- Line-by-Line Anlage EÜR Category Breakdown Table -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div class="card-title">Deductible Operating Expenses (Betriebsausgaben)</div>
          <span class="badge badge-outline">${expenseItems.length} Categories</span>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>ELSTER Line</th>
                <th>Category Description</th>
                <th>Entries</th>
                <th>Deductible %</th>
                <th>Gross Total</th>
                <th style="text-align: right;">Deductible Amount (Net)</th>
              </tr>
            </thead>
            <tbody>
              ${expenseItems.map(item => `
                <tr>
                  <td>
                    <span class="badge badge-outline" style="font-family: var(--font-mono);">${item.code}</span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-primary);">${item.name}</div>
                  </td>
                  <td>
                    <span style="color: var(--text-muted); font-size: 12px;">${item.count} items</span>
                  </td>
                  <td>
                    <span class="badge ${item.deductiblePercent < 100 ? 'badge-outline' : 'badge-filled'}" style="font-size: 10px;">
                      ${item.deductiblePercent}%
                    </span>
                  </td>
                  <td>
                    <span style="font-family: var(--font-mono); color: var(--text-secondary);">
                      €${item.gross.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary);">
                      €${item.deductibleAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
