/**
 * SEYA BOOKS - AI Work Session & Auto-Sheet Generator Modal
 * Extracts date, hrs, pay/rate, business/brand name from any text and lets user adjust & save to sheet
 */

export function renderAiSheetModal({
  isOpen = false,
  isParsing = false,
  parsedData = null,
  rawText = '',
  brands = []
}) {
  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="ai-sheet-modal">
      <div class="modal-box" style="max-width: 620px;">
        <div class="modal-head">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="brand-symbol" style="width: 28px; height: 28px; font-size: 14px;">AI</div>
            <div>
              <h3 style="font-size: 16px; margin: 0;">AI Work Session Auto-Sheet</h3>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                Paste text &rarr; Auto-extract date, hours, pay & business
              </div>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon close-modal-btn" data-modal="ai-sheet-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Text Input / Prompt Area -->
          <div class="form-group">
            <label class="form-label">Paste Work Log, Chat Note, or Timesheet Description</label>
            <textarea 
              id="ai-sheet-input-text" 
              class="textarea" 
              rows="3" 
              placeholder="e.g. 'Worked 4.5 hours yesterday for Seya Pay on Stripe payment webhook integration at €125/hr' or paste your daily notes..."
            >${rawText}</textarea>
          </div>

          <div style="text-align: right; margin-bottom: 16px;">
            <button class="btn btn-primary btn-sm" id="btn-run-ai-sheet-parse" ${isParsing ? 'disabled' : ''}>
              ${isParsing ? 'Parsing with Groq AI...' : 'Generate Sheet Entry &rarr;'}
            </button>
          </div>

          <!-- Parsed Result Review & Interactive Adjustment Form -->
          ${parsedData ? `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-sm); padding: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <span class="badge badge-filled">AI Extracted Values</span>
                <span style="font-size: 11px; color: var(--text-muted);">Adjust any field below before saving</span>
              </div>

              <form id="ai-sheet-adjust-form">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <!-- Business / Brand Name -->
                  <div class="form-group">
                    <label class="form-label">Brand / Business Name *</label>
                    <input 
                      type="text" 
                      id="ai-sheet-business" 
                      class="input" 
                      value="${parsedData.businessName || 'Seya Pay'}" 
                      required 
                    />
                  </div>

                  <!-- Date -->
                  <div class="form-group">
                    <label class="form-label">Session Date *</label>
                    <input 
                      type="date" 
                      id="ai-sheet-date" 
                      class="input text-mono" 
                      value="${parsedData.date || new Date().toISOString().split('T')[0]}" 
                      required 
                    />
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                  <!-- Hours -->
                  <div class="form-group">
                    <label class="form-label">Hours (hrs) *</label>
                    <input 
                      type="number" 
                      step="0.25" 
                      min="0.25" 
                      max="24" 
                      id="ai-sheet-hours" 
                      class="input text-mono" 
                      value="${parsedData.hours || 4}" 
                      required 
                    />
                  </div>

                  <!-- Pay / Hourly Rate -->
                  <div class="form-group">
                    <label class="form-label">Hourly Pay (€/h) *</label>
                    <input 
                      type="number" 
                      step="1" 
                      id="ai-sheet-rate" 
                      class="input text-mono" 
                      value="${parsedData.hourlyRate || 125}" 
                      required 
                    />
                  </div>

                  <!-- Calculated Total Pay -->
                  <div class="form-group">
                    <label class="form-label">Total Pay (€)</label>
                    <input 
                      type="text" 
                      id="ai-sheet-total-pay" 
                      class="input text-mono" 
                      value="€${((parsedData.hours || 4) * (parsedData.hourlyRate || 125)).toFixed(2)}" 
                      readonly 
                      style="background: var(--bg-card); font-weight: 700;" 
                    />
                  </div>
                </div>

                <!-- Deliverable / Project Title -->
                <div class="form-group">
                  <label class="form-label">Project / Deliverable Title *</label>
                  <input 
                    type="text" 
                    id="ai-sheet-project" 
                    class="input" 
                    value="${parsedData.project || 'Feature Implementation'}" 
                    required 
                  />
                </div>

                <!-- Scope / Notes -->
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Deliverable Notes</label>
                  <textarea id="ai-sheet-notes" class="textarea" rows="2">${parsedData.notes || ''}</textarea>
                </div>
              </form>
            </div>
          ` : ''}
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-secondary btn-sm close-modal-btn" data-modal="ai-sheet-modal">Cancel</button>
          ${parsedData ? `
            <button type="submit" form="ai-sheet-adjust-form" class="btn btn-primary btn-sm" id="btn-commit-ai-sheet">
              Commit to Timesheet
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
