/**
 * SEYA BOOKS - Transaction Modal (Pleo Inspired)
 * Plain English Categories + Custom Category typing support, no deductibility slider, clean minimal UI
 */

export const PLAIN_INCOME_CATEGORIES = [
  { id: 'cat_client_services', name: 'Client Services' },
  { id: 'cat_consulting', name: 'Consulting & Advisory' },
  { id: 'cat_saas_sales', name: 'Product & SaaS Sales' },
  { id: 'cat_retainer', name: 'Monthly Retainer' },
  { id: 'cat_other_income', name: 'Other Income' }
];

export const PLAIN_EXPENSE_CATEGORIES = [
  { id: 'cat_software_tools', name: 'Software & Tools' },
  { id: 'cat_equipment', name: 'Equipment & Hardware' },
  { id: 'cat_office', name: 'Office & Workspace' },
  { id: 'cat_travel', name: 'Travel & Transport' },
  { id: 'cat_meals', name: 'Meals & Dining' },
  { id: 'cat_marketing', name: 'Marketing & Ads' },
  { id: 'cat_contractors', name: 'Contractors & Freelancers' },
  { id: 'cat_bank_fees', name: 'Bank & Payment Fees' },
  { id: 'cat_legal_accounting', name: 'Legal & Accounting' },
  { id: 'cat_other_expense', name: 'Other Operating Expense' }
];

export function renderTransactionModal({
  isOpen = false,
  mode = 'create',
  initialType = 'expense',
  transaction = null,
  clients = [],
  banks = [],
  customCategories = [],
  isKleinunternehmer = true
}) {
  const currentType = transaction?.type || initialType;
  const categories = currentType === 'income' ? PLAIN_INCOME_CATEGORIES : PLAIN_EXPENSE_CATEGORIES;

  // Check if current category is a custom one
  const isPredefined = categories.some(c => c.id === transaction?.category || c.name === transaction?.categoryName);
  const isCustomCategory = transaction?.category === '__custom__' || (transaction && !isPredefined && transaction.category);
  const customCatVal = isCustomCategory ? (transaction?.categoryName || transaction?.category || '') : '';

  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="transaction-modal">
      <div class="modal-box">
        <div class="modal-head">
          <h3 style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: var(--radius-xs); background: ${currentType === 'income' ? 'var(--color-income)' : 'var(--pleo-coral)'}; color: #ffffff; display: flex; align-items: center; justify-content: center;">
              ${currentType === 'income' ? `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="m19 12-7-7-7 7"/></svg>
              ` : `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
              `}
            </div>
            <span>${mode === 'create' ? 'Record New' : 'Edit'} ${currentType === 'income' ? 'Income' : 'Expense'}</span>
          </h3>
          <button class="btn btn-ghost btn-icon close-modal-btn" data-modal="transaction-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="tx-form" class="modal-body">
          <input type="hidden" id="tx-id" value="${transaction?.id || ''}" />

          <!-- Income / Expense Type Toggle -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px; background: var(--bg-subtle); padding: 4px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
            <button type="button" class="btn ${currentType === 'income' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="tx-type-income-btn" style="flex: 1; ${currentType === 'income' ? 'background: var(--color-income); border-color: var(--color-income);' : ''}">
              + Income
            </button>
            <button type="button" class="btn ${currentType === 'expense' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="tx-type-expense-btn" style="flex: 1;">
              - Expense
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px;">
            <!-- Amount -->
            <div class="form-group">
              <label class="form-label">Total Amount (€) *</label>
              <input 
                type="number" 
                step="0.01" 
                id="tx-amount" 
                class="input text-mono" 
                style="font-size: 18px; font-weight: 700;" 
                placeholder="0.00" 
                value="${transaction ? transaction.amount : ''}" 
                required 
              />
            </div>

            <!-- Date -->
            <div class="form-group">
              <label class="form-label">Date *</label>
              <input 
                type="date" 
                id="tx-date" 
                class="input text-mono" 
                value="${transaction ? transaction.date : new Date().toISOString().split('T')[0]}" 
                required 
              />
            </div>
          </div>

          <!-- Description -->
          <div class="form-group">
            <label class="form-label">Description / Counterparty *</label>
            <input 
              type="text" 
              id="tx-desc" 
              class="input" 
              placeholder="e.g. Google Play, AWS Cloud, Stripe Consulting" 
              value="${transaction ? transaction.description : ''}" 
              required 
            />
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px;">
            <!-- Category (Plain English + Custom Category input) -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label" style="margin-bottom: 0;">Category</label>
                <button type="button" class="btn btn-ghost btn-sm" id="btn-toggle-custom-category" style="font-size: 10px; padding: 1px 6px; color: var(--pleo-coral);" title="Type your own category name">
                  + Type Custom
                </button>
              </div>
              <select id="tx-category" class="select">
                <optgroup label="Standard Categories">
                  ${categories.map(c => `
                    <option value="${c.id}" ${(!isCustomCategory && (transaction?.category === c.id || transaction?.categoryName === c.name)) ? 'selected' : ''}>
                      ${c.name}
                    </option>
                  `).join('')}
                </optgroup>
                ${customCategories && customCategories.length > 0 ? `
                  <optgroup label="Saved Custom Categories">
                    ${customCategories.map(cat => `
                      <option value="cat_${cat.toLowerCase().replace(/[^a-z0-9]/g, '_')}" ${(!isCustomCategory && (transaction?.categoryName === cat || transaction?.category === cat)) ? 'selected' : ''}>
                        ${cat}
                      </option>
                    `).join('')}
                  </optgroup>
                ` : ''}
                <optgroup label="Custom">
                  <option value="__custom__" ${isCustomCategory ? 'selected' : ''}>
                    + Type Custom Category...
                  </option>
                </optgroup>
              </select>

              <!-- Custom Category Text Input -->
              <div id="tx-custom-cat-box" style="margin-top: 8px; ${isCustomCategory ? '' : 'display: none;'}">
                <input 
                  type="text" 
                  id="tx-custom-category" 
                  class="input" 
                  placeholder="Enter custom category name (e.g. AI Subscriptions, Coworking)" 
                  value="${customCatVal}" 
                />
              </div>
            </div>

            <!-- VAT Rate -->
            <div class="form-group">
              <label class="form-label">VAT Rate</label>
              <select id="tx-vat" class="select text-mono">
                <option value="0" ${transaction?.vatRate === 0 || isKleinunternehmer ? 'selected' : ''}>0% (${isKleinunternehmer ? '§ 19 UStG' : 'Exempt'})</option>
                <option value="19" ${transaction?.vatRate === 19 ? 'selected' : ''}>19% Standard</option>
                <option value="7" ${transaction?.vatRate === 7 ? 'selected' : ''}>7% Reduced</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <!-- Bank Account / Pocket -->
            <div class="form-group">
              <label class="form-label">Account / Pocket</label>
              <select id="tx-bank" class="select">
                ${banks.map(b => `
                  <option value="${b.id}" ${transaction?.bankId === b.id ? 'selected' : ''}>${b.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- Brand Attribution (Optional) -->
            <div class="form-group">
              <label class="form-label">Brand Attribution (Optional)</label>
              <select id="tx-client" class="select">
                <option value="">None / General Business</option>
                ${clients.map(c => `
                  <option value="${c.id}" ${transaction?.clientId === c.id ? 'selected' : ''}>
                    ${c.name} ${c.totalEarned !== undefined ? `(Total Earned: €${Number(c.totalEarned).toLocaleString('de-DE', { minimumFractionDigits: 2 })})` : ''}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label">Internal Tax Notes (Optional)</label>
            <input 
              type="text" 
              id="tx-notes" 
              class="input" 
              placeholder="e.g. Business purpose, invoice reference, client project" 
              value="${transaction?.notes || ''}" 
            />
          </div>

          <div class="modal-foot" style="margin-top: 12px; padding-top: 16px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            ${transaction ? `
              <button type="button" class="btn btn-ghost btn-sm" id="btn-delete-current-tx" style="color: var(--pleo-coral);">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                Delete
              </button>
            ` : '<div></div>'}
            
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary btn-sm close-modal-btn" data-modal="transaction-modal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary btn-sm">
                ${mode === 'create' ? 'Save Entry' : 'Update Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}
