/**
 * SEYA BOOKS - Profit & Loss (Einnahmenüberschussrechnung EÜR) View
 * Includes only real user-added transactions (no dummy statements),
 * sorted chronologically by transaction date, with clean CSV export.
 */

import { ELSTER_CATEGORIES, getCategoryById } from '../services/elsterService.js';

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

  // Sort real transactions chronologically by transaction date
  const sortedTransactions = [...transactions].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return da - db;
  });

  // Group real expenses by category
  const expenseBreakdown = {};
  sortedTransactions.filter(t => t.type === 'expense').forEach(t => {
    const catId = t.category || 'exp_other';
    const cat = ELSTER_CATEGORIES.find(c => c.id === catId) || { 
      shortName: t.categoryName || 'Other Expense', 
      code: 'Zeile 48', 
      deductiblePercent: t.taxDeductiblePercent ?? 100 
    };
    if (!expenseBreakdown[catId]) {
      expenseBreakdown[catId] = {
        name: t.categoryName || cat.shortName,
        code: cat.code || 'Zeile 48',
        gross: 0,
        net: 0,
        deductiblePercent: t.taxDeductiblePercent ?? cat.deductiblePercent ?? 100,
        deductibleAmount: 0,
        count: 0
      };
    }
    const amt = Number(t.amount) || 0;
    const vatRate = Number(t.vatRate) || 0;
    const net = vatRate > 0 ? amt / (1 + vatRate / 100) : amt;
    const deductible = net * ((expenseBreakdown[catId].deductiblePercent) / 100);

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
            <span class="badge badge-reflective">§ 4 Abs. 3 EStG</span>
          </h2>
          <div class="section-desc">Real-time cash-basis accounting calculated strictly from your added transactions</div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <!-- Download P&L CSV Button -->
          <button class="btn btn-primary btn-sm" id="btn-download-pnl-csv" title="Download P&L statement as structured CSV">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download P&L CSV
          </button>

          <button class="btn btn-secondary btn-sm" id="btn-export-pnl-pdf" title="Generate PDF financial statement">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Statement PDF
          </button>
        </div>
      </div>

      <!-- Statement Highlights -->
      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-top">
            <span>Operating Revenue</span>
            <span class="badge badge-outline" style="color: var(--color-income);">Income</span>
          </div>
          <div class="metric-num" style="color: var(--color-income);">€${netRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Net taxable income (${transactions.filter(t => t.type === 'income').length} entries)</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Operating Expenses</span>
            <span class="badge badge-outline" style="color: var(--pleo-coral);">Deductions</span>
          </div>
          <div class="metric-num" style="color: var(--pleo-coral);">€${deductibleExp.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Deductible expenses (${transactions.filter(t => t.type === 'expense').length} entries)</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Net Taxable Profit</span>
            <span class="badge badge-filled">EÜR Zeile 60</span>
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
          <div class="metric-sub">Operating profit margin</div>
        </div>
      </div>

      ${transactions.length === 0 ? `
        <!-- Empty State When No Real Transactions Added Yet -->
        <div class="card" style="text-align: center; padding: 48px 20px;">
          <div style="width: 52px; height: 52px; border-radius: var(--radius-sm); background: var(--pleo-coral-light); color: var(--pleo-coral); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
          </div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">No Real Transactions Logged Yet</h3>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 440px; margin: 0 auto 20px auto;">
            Your Profit & Loss statement is strictly calculated from the transactions you add. No dummy statements are loaded. Record an income or expense to generate your statement.
          </p>
          <button class="btn btn-primary btn-sm" id="btn-pnl-add-first-tx">
            + Record First Transaction
          </button>
        </div>
      ` : `
        <!-- 1. Category Expense Breakdown (Anlage EÜR) -->
        <div class="card" style="padding: 0; overflow: hidden; margin-bottom: 24px;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div class="card-title">Deductible Operating Expenses (Betriebsausgaben)</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Aggregated by official German tax lines</div>
            </div>
            <span class="badge badge-outline">${expenseItems.length} Categories</span>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ELSTER Line</th>
                  <th>Category</th>
                  <th>Entries</th>
                  <th>Deductible %</th>
                  <th>Gross Total</th>
                  <th style="text-align: right;">Deductible Amount (Net)</th>
                </tr>
              </thead>
              <tbody>
                ${expenseItems.length === 0 ? `
                  <tr>
                    <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No expense transactions recorded.</td>
                  </tr>
                ` : expenseItems.map(item => `
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

        <!-- 2. Itemized Added Transactions Table (Sorted by Date) -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div>
              <div class="card-title">Itemized P&L Transactions (${sortedTransactions.length})</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">All real entries comprising this P&L statement, ordered by transaction date</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <span class="badge badge-reflective">${sortedTransactions.length} Real Entries</span>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description / Counterparty</th>
                  <th>Category</th>
                  <th>Brand / Client</th>
                  <th>Account</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${sortedTransactions.map(t => {
                  const isInc = t.type === 'income';
                  const cat = getCategoryById(t.category);
                  const catLabel = t.categoryName || cat.shortName || t.category;
                  return `
                    <tr class="tx-item-row" data-id="${t.id}" style="cursor: pointer;">
                      <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); white-space: nowrap;">
                        ${t.date || '—'}
                      </td>
                      <td>
                        <span class="badge ${isInc ? 'badge-filled' : 'badge-outline'}" style="font-size: 10.5px; ${isInc ? 'background: var(--color-income); border-color: var(--color-income);' : 'color: var(--pleo-coral); border-color: var(--pleo-coral-border);'}">
                          ${isInc ? '+ INCOME' : '- EXPENSE'}
                        </span>
                      </td>
                      <td>
                        <div style="font-weight: 700; color: var(--text-primary);">${t.description || (isInc ? 'Revenue' : 'Expense')}</div>
                      </td>
                      <td>
                        <span class="badge badge-outline" style="font-size: 11px;">${catLabel}</span>
                      </td>
                      <td>
                        <span style="color: var(--text-secondary); font-size: 12px;">${t.clientName || t.businessName || '—'}</span>
                      </td>
                      <td>
                        <span style="color: var(--text-muted); font-size: 11.5px; font-family: var(--font-mono);">${t.bankName || 'Account'}</span>
                      </td>
                      <td style="text-align: right;">
                        <span style="font-family: var(--font-mono); font-weight: 700; font-size: 13.5px; color: ${isInc ? 'var(--color-income)' : 'var(--pleo-coral)'};">
                          ${isInc ? '+' : '-'}€${Number(t.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `}
    </div>
  `;
}
