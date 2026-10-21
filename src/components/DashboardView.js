/**
 * SEYA BOOKS - Dashboard View (Monochrome Black & White with Reflective Accents)
 * Dual charts (Spline Trend + Category Donut), AI Financial Health Widget, Clean Tax CSV Download
 */

import { getCategoryById } from '../services/elsterService.js';

export function renderDashboardView({
  transactions = [],
  totals = {},
  taxAssessment = {},
  banks = [],
  brands = [],
  aiAuditData = null
}) {
  const { kleinunternehmer } = taxAssessment;
  const kuRatio = kleinunternehmer?.percentageOf25k || 0;
  const recentTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const healthScore = aiAuditData?.healthScore || 92;
  const verdict = aiAuditData?.verdict || "Strong financial velocity with healthy margin buffer and compliant tax shields.";

  return `
    <div>
      <!-- Section Title & Quick Actions -->
      <div class="section-title-row">
        <div>
          <h2 class="section-title">
            <span>Executive Dashboard</span>
            <span class="badge badge-reflective">2026 Fiscal Year</span>
          </h2>
          <div class="section-desc">Einnahmenüberschussrechnung (EÜR), German Tax Allocation & Cashflow</div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <!-- Clean Tax CSV Download Button -->
          <button class="btn btn-secondary btn-sm" id="btn-download-tax-csv" title="Download clean transaction CSV for German tax filing">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download Tax CSV
          </button>

          <button class="btn btn-secondary btn-sm" id="btn-export-pdf-summary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            PDF Statement
          </button>

          <button class="btn btn-primary btn-sm" id="btn-quick-add-tx">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Record Entry
          </button>
        </div>
      </div>

      <!-- AI FINANCIAL HEALTH & INTELLIGENCE HERO WIDGET -->
      <div class="ai-insights-hero" id="trigger-ai-insights-modal" title="Click to view full financial health audit & detailed diagnosis">
        <div class="ai-hero-inner">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div class="ai-hero-badge-wrap">AI</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                <span style="font-size: 11px; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; color: var(--text-muted);">
                  Financial Health Intelligence
                </span>
                <span class="badge badge-reflective" style="font-size: 9.5px; padding: 1px 7px;">Groq LPU Audit</span>
              </div>
              <div style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); line-height: 1.4;">
                ${verdict}
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="ai-hero-score-pill">
              <span class="badge-dot"></span>
              <span>Health: <strong>${healthScore}/100</strong></span>
            </div>
            <button class="btn btn-primary btn-sm" style="pointer-events: none;">
              Detailed Audit &rarr;
            </button>
          </div>
        </div>
      </div>

      <!-- 4 Core Financial KPI Cards -->
      <div class="metrics-row">
        <!-- 1. Revenue -->
        <div class="metric-card">
          <div class="metric-top">
            <span>Net Revenue</span>
            <span class="badge badge-outline">Total</span>
          </div>
          <div class="metric-num">€${(totals.totalIncomeNet || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Gross: €${(totals.totalIncomeGross || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
        </div>

        <!-- 2. Deductible Expenses -->
        <div class="metric-card">
          <div class="metric-top">
            <span>Operating Expenses</span>
            <span class="badge badge-outline">EÜR</span>
          </div>
          <div class="metric-num">€${(totals.totalDeductibleExpense || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Deductible write-offs</div>
        </div>

        <!-- 3. Net Profit -->
        <div class="metric-card">
          <div class="metric-top">
            <span>Net Profit</span>
            <span class="badge badge-filled">Margin ${totals.totalIncomeNet > 0 ? Math.round((totals.netBusinessProfit / totals.totalIncomeNet) * 100) : 0}%</span>
          </div>
          <div class="metric-num">€${(totals.netBusinessProfit || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Pre-tax business profit</div>
        </div>

        <!-- 4. Tax Reserve -->
        <div class="metric-card">
          <div class="metric-top">
            <span>Tax Reserve</span>
            <span class="badge badge-reflective">Allocated</span>
          </div>
          <div class="metric-num">€${(taxAssessment.totalTaxReserve || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Est. Rate: ${(taxAssessment.effectiveTaxRate || 0).toFixed(1)}%</div>
        </div>
      </div>

      <!-- Kleinunternehmer § 19 UStG Limit Tracker -->
      <div class="card" style="margin-bottom: 24px; padding: 18px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 13.5px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span class="badge-dot"></span>
            <span>§ 19 UStG Exemption Limit (25.000 € Threshold)</span>
          </div>
          <span class="badge badge-outline">${kuRatio}% Utilized</span>
        </div>
        <div style="width: 100%; height: 8px; background: var(--bg-subtle); border-radius: var(--radius-full); overflow: hidden; border: 1px solid var(--border-subtle); margin: 8px 0;">
          <div style="width: ${Math.min(kuRatio, 100)}%; height: 100%; background: var(--text-primary); transition: width 0.6s ease;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
          <span>Turnover: €${(totals.totalIncomeNet || 0).toLocaleString('de-DE')}</span>
          <span>Remaining Shield: €${Math.max(0, 25000 - (totals.totalIncomeNet || 0)).toLocaleString('de-DE')}</span>
        </div>
      </div>

      <!-- DUAL CHARTS (Spline Cashflow + Donut Distribution) -->
      <div class="charts-grid">
        <!-- Chart 1: Cashflow Trend Spline Area -->
        <div class="chart-card">
          <div class="card-header">
            <div>
              <div class="card-title">Cashflow & Revenue Trajectory</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Monthly income vs operating costs</div>
            </div>
            <span class="badge badge-outline">YTD 2026</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="cashflow-trend-chart"></canvas>
          </div>
        </div>

        <!-- Chart 2: Category Distribution Donut -->
        <div class="chart-card">
          <div class="card-header">
            <div>
              <div class="card-title">Expense Breakdown</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">By Anlage EÜR categories</div>
            </div>
            <span class="badge badge-outline">Deductions</span>
          </div>
          <div class="chart-wrapper">
            <canvas id="expense-category-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Recent Transactions Ledger -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 18px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div class="card-title">Recent Transactions</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Last 6 logged financial entries</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="btn-quick-tax-csv">
              Export Clean CSV
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-nav-to-ledger">
              All Entries &rarr;
            </button>
          </div>
        </div>

        <div>
          ${recentTx.map(t => {
            const cat = getCategoryById(t.category);
            const isIncome = t.type === 'income';
            return `
              <div class="list-row tx-item-row" data-id="${t.id}">
                <div class="list-row-left">
                  <div class="list-row-icon">
                    ${isIncome ? `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="m19 12-7-7-7 7"/></svg>
                    ` : `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
                    `}
                  </div>
                  <div style="min-width: 0;">
                    <div class="list-row-title">${t.description || (isIncome ? 'Customer Revenue' : 'Operating Cost')}</div>
                    <div class="list-row-sub">
                      <span>${t.date}</span>
                      <span>•</span>
                      <span class="badge badge-outline" style="font-size: 9.5px; padding: 1px 6px;">${cat.shortName}</span>
                      ${t.clientName || t.businessName ? `<span>• ${t.clientName || t.businessName}</span>` : ''}
                    </div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="text-align: right;">
                    <div class="list-row-amount">
                      ${isIncome ? '+' : '-'}€${Number(t.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                    <div style="font-size: 10px; color: var(--text-muted);">
                      ${isIncome ? 'Income' : 'Expense'}
                    </div>
                  </div>
                  <button class="btn btn-secondary btn-sm edit-tx-btn" data-id="${t.id}" title="Edit Transaction" style="padding: 4px 10px; font-size: 11px;">
                    Edit
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
