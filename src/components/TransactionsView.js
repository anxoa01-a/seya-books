/**
 * Transactions Ledger View
 * Search, filter, inspect, and manage income and deductible expenses.
 */

import { ELSTER_CATEGORIES, getCategoryById } from '../services/elsterService.js';

export function renderTransactionsView({
  transactions = [],
  banks = [],
  clients = [],
  filters = {
    search: '',
    type: 'all',
    category: 'all',
    bankId: 'all'
  }
}) {
  // Apply filtering
  const filteredTx = transactions.filter(t => {
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.bankId !== 'all' && t.bankId !== filters.bankId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const descMatch = (t.description || '').toLowerCase().includes(q);
      const clientMatch = (t.clientName || '').toLowerCase().includes(q);
      const noteMatch = (t.notes || '').toLowerCase().includes(q);
      if (!descMatch && !clientMatch && !noteMatch) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Compute filtered totals
  let incTotal = 0;
  let expTotal = 0;
  filteredTx.forEach(t => {
    if (t.type === 'income') incTotal += Number(t.amount || 0);
    else expTotal += Number(t.amount || 0);
  });
  const balance = incTotal - expTotal;

  return `
    <div class="animate-fade-in">
      <!-- Section Header -->
      <div class="section-head">
        <div>
          <h2>
            <span>Financial Ledger</span>
            <span class="badge badge-neutral">${filteredTx.length} Entries</span>
          </h2>
          <div class="section-subtitle">Track, categorize, and document business income & expenses</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-export-csv">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btn-add-tx-main">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Transaction
          </button>
        </div>
      </div>

      <!-- Filter Controls Card -->
      <div class="glass-card" style="margin-bottom: 20px; padding: 16px;">
        <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
          <!-- Search input -->
          <div style="position: relative;">
            <input 
              type="text" 
              class="input" 
              id="tx-search-input" 
              placeholder="Search by description, client, invoice #..." 
              value="${filters.search || ''}"
              style="padding-left: 38px;"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute; left: 14px; top: 13px; color: var(--text-dim);"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>

          <!-- Filter Dropdowns Row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
            <!-- Type -->
            <select class="select" id="filter-type-select">
              <option value="all" ${filters.type === 'all' ? 'selected' : ''}>All Types</option>
              <option value="income" ${filters.type === 'income' ? 'selected' : ''}>+ Incomes Only</option>
              <option value="expense" ${filters.type === 'expense' ? 'selected' : ''}>- Expenses Only</option>
            </select>

            <!-- Category -->
            <select class="select" id="filter-cat-select">
              <option value="all" ${filters.category === 'all' ? 'selected' : ''}>All Categories</option>
              ${ELSTER_CATEGORIES.map(c => `
                <option value="${c.id}" ${filters.category === c.id ? 'selected' : ''}>
                  ${c.shortName} (${c.code})
                </option>
              `).join('')}
            </select>

            <!-- Bank Account -->
            <select class="select" id="filter-bank-select">
              <option value="all" ${filters.bankId === 'all' ? 'selected' : ''}>All Accounts</option>
              ${banks.map(b => `
                <option value="${b.id}" ${filters.bankId === b.id ? 'selected' : ''}>${b.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Filter Summary Bar -->
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: 12px;">
          <div style="display: flex; gap: 14px;">
            <span style="color: var(--accent-emerald);">Income: <strong>+€${incTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong></span>
            <span style="color: var(--accent-rose);">Expenses: <strong>-€${expTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong></span>
            <span style="color: var(--text-main);">Net: <strong>€${balance.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong></span>
          </div>
          ${(filters.search || filters.type !== 'all' || filters.category !== 'all' || filters.bankId !== 'all') ? `
            <button class="btn btn-secondary btn-sm" id="btn-reset-filters" style="font-size: 11px; padding: 3px 8px;">Clear Filters</button>
          ` : ''}
        </div>
      </div>

      <!-- Transaction Items List -->
      <div class="glass-card" style="padding: 10px;">
        ${filteredTx.length > 0 ? `
          <div class="tx-list">
            ${filteredTx.map(t => {
              const cat = getCategoryById(t.category);
              const isIncome = t.type === 'income';
              return `
                <div class="tx-row" data-id="${t.id}" id="tx-${t.id}">
                  <div class="tx-left">
                    <div class="tx-icon-pill ${isIncome ? 'income' : 'expense'}">
                      ${isIncome ? `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14"/><path d="m19 12-7-7-7 7"/></svg>
                      ` : `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
                      `}
                    </div>
                    <div class="tx-meta">
                      <div class="tx-title">${t.description || (isIncome ? 'Customer Payment' : 'Expense')}</div>
                      <div class="tx-subtext">
                        <span>${t.date}</span>
                        <span>•</span>
                        <span class="badge badge-neutral" style="font-size: 10px; padding: 1px 6px;">
                          ${cat.code}: ${cat.shortName}
                        </span>
                        ${t.clientName ? `<span style="color: var(--text-muted); font-weight: 500;">• ${t.clientName}</span>` : ''}
                        ${t.bankName ? `<span style="color: var(--text-dim);">• ${t.bankName}</span>` : ''}
                        ${t.receiptAttachment ? `
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-cyan);" title="Beleg attached"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="tx-right">
                    <div class="tx-amount ${isIncome ? 'income' : 'expense'}">
                      ${isIncome ? '+' : '-'}€${Number(t.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${!isIncome && cat.deductiblePercent < 100 ? `
                        <span class="badge badge-warning" style="font-size: 9.5px; padding: 1px 5px;">${cat.deductiblePercent}% abziehbar</span>
                      ` : ''}
                      <button class="btn btn-secondary btn-sm tx-action-btn" data-action="delete" data-id="${t.id}" title="Delete" style="padding: 2px 6px; font-size: 11px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 48px 20px;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.04); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px auto; color: var(--text-dim);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <h4 style="font-size: 15px; font-weight: 600; color: var(--text-main); margin-bottom: 6px;">No transactions found</h4>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 340px; margin: 0 auto 16px auto;">Try adjusting your filters or record a new transaction.</p>
            <button class="btn btn-primary btn-sm" id="btn-add-tx-empty">Add First Transaction</button>
          </div>
        `}
      </div>
    </div>
  `;
}
