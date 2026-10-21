/**
 * SEYA BOOKS - Brand Creation Modal (Under Seya Technologies)
 * Replaces standard rate with Total Earned
 */

export function renderBrandModal({
  isOpen = false
}) {
  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="brand-modal">
      <div class="modal-box">
        <div class="modal-head">
          <h3>
            <div class="brand-symbol" style="width: 26px; height: 26px; font-size: 13px;">B</div>
            <span>Add Brand under Seya Technologies</span>
          </h3>
          <button class="btn btn-ghost btn-icon close-modal-btn" data-modal="brand-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="brand-form" class="modal-body">
          <div class="form-group">
            <label class="form-label">Brand / Venture Name *</label>
            <input type="text" id="brand-name-input" class="input" placeholder="e.g. Seya Pay, Seya AI, Seya Cloud" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Contact / Lead</label>
              <input type="text" id="brand-contact-input" class="input" placeholder="e.g. Pritam Maharjan" />
            </div>
            <div class="form-group">
              <label class="form-label">Billing Email</label>
              <input type="email" id="brand-email-input" class="input" placeholder="pay@seyatechnologies.com" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Total Earned / Initial Revenue (€)</label>
              <input type="number" step="0.01" id="brand-earned-input" class="input text-mono" value="0.00" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label class="form-label">Payment Terms</label>
              <select id="brand-terms-select" class="select">
                <option value="14 Days">14 Days Net</option>
                <option value="30 Days">30 Days Net</option>
                <option value="Immediate">Immediate</option>
                <option value="Monthly Retainer">Monthly Retainer</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Brand Scope / Ventures</label>
            <input type="text" id="brand-projects-input" class="input" placeholder="e.g. Fintech APIs, Stripe Integration, Mobile Apps" />
          </div>
        </form>

        <div class="modal-foot">
          <button type="button" class="btn btn-secondary btn-sm close-modal-btn" data-modal="brand-modal">Cancel</button>
          <button type="submit" form="brand-form" class="btn btn-primary btn-sm">Create Brand</button>
        </div>
      </div>
    </div>
  `;
}
