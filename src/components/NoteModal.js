/**
 * Quick Note Creation Modal
 */

export function renderNoteModal({
  isOpen = false
}) {
  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="note-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="color: var(--accent-emerald);"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v5h5"/></svg>
            <span>Create Business or Tax Note</span>
          </h3>
          <button class="icon-btn close-modal-btn" data-modal="note-modal" style="width: 32px; height: 32px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="note-form" class="modal-body">
          <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" id="note-title-input" class="input" placeholder="e.g. Q4 Tax Deduction Strategy" required />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Category Tag</label>
              <select id="note-tag-select" class="select">
                <option value="Taxes">Taxes (Steuern)</option>
                <option value="Compliance">Compliance & § 19 UStG</option>
                <option value="Clients">Client Notes</option>
                <option value="Strategy">Strategy & Pricing</option>
                <option value="Ideas">Ideas</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Color Accent</label>
              <select id="note-color-select" class="select">
                <option value="#10b981">Emerald Green</option>
                <option value="#06b6d4">Cyan Glow</option>
                <option value="#f59e0b">Amber Gold</option>
                <option value="#6366f1">Indigo</option>
                <option value="#f43f5e">Rose</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Note Content</label>
            <textarea id="note-content-input" class="textarea" rows="4" placeholder="Write reminders, deductibility notes, or calculations..." required></textarea>
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm close-modal-btn" data-modal="note-modal">Cancel</button>
          <button type="submit" form="note-form" class="btn btn-primary btn-sm">Save Note</button>
        </div>
      </div>
    </div>
  `;
}
