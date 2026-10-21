/**
 * SEYA BOOKS - Client Creation Modal (Pure Black & White)
 */

export function renderClientModal({
  isOpen = false
}) {
  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="client-modal">
      <div class="modal-box">
        <div class="modal-head">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
            <span>Add New Client</span>
          </h3>
          <button class="btn btn-ghost btn-icon close-modal-btn" data-modal="client-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="client-form" class="modal-body">
          <div class="form-group">
            <label class="form-label">Client / Company Name *</label>
            <input type="text" id="client-name-input" class="input" placeholder="e.g. Acme Tech Solutions GmbH" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Contact Person</label>
              <input type="text" id="client-contact-input" class="input" placeholder="e.g. Michael Schmidt" />
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="client-email-input" class="input" placeholder="accounting@acme.de" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Hourly Rate (€/h) *</label>
              <input type="number" step="1" id="client-rate-input" class="input text-mono" value="120" required />
            </div>
            <div class="form-group">
              <label class="form-label">Payment Terms</label>
              <select id="client-terms-select" class="select">
                <option value="14 Days">14 Days Net</option>
                <option value="30 Days">30 Days Net</option>
                <option value="Immediate">Immediate on receipt</option>
                <option value="Retainer">Monthly Retainer</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Projects / Scopes</label>
            <input type="text" id="client-projects-input" class="input" placeholder="e.g. Mobile UI, Cloud Architecture" />
          </div>
        </form>

        <div class="modal-foot">
          <button type="button" class="btn btn-secondary btn-sm close-modal-btn" data-modal="client-modal">Cancel</button>
          <button type="submit" form="client-form" class="btn btn-primary btn-sm">Save Client</button>
        </div>
      </div>
    </div>
  `;
}
