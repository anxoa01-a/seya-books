/**
 * SEYA BOOKS - Timesheet Entry Modal (Pure Black & White Monochrome)
 */

export function renderTimesheetModal({
  isOpen = false,
  clients = []
}) {
  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="timesheet-modal">
      <div class="modal-box">
        <div class="modal-head">
          <h3>
            <div class="brand-symbol" style="width: 26px; height: 26px; font-size: 13px;">T</div>
            <span>Log Billable Work Session</span>
          </h3>
          <button class="btn btn-ghost btn-icon close-modal-btn" data-modal="timesheet-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form id="timesheet-form" class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Brand / Venture</label>
              <select id="ts-client-select" class="select" required>
                ${clients.map(c => `
                  <option value="${c.id}" data-rate="${c.hourlyRate || 95}">${c.name} (Total Earned: €${(c.totalEarned || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })})</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" id="ts-date-input" class="input text-mono" value="${new Date().toISOString().split('T')[0]}" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Hours Worked</label>
              <input type="number" step="0.25" min="0.25" max="24" id="ts-hours-input" class="input text-mono" placeholder="4.5" required />
            </div>
            <div class="form-group">
              <label class="form-label">Hourly Rate (€/h)</label>
              <input type="number" step="1" id="ts-rate-input" class="input text-mono" value="95" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Project / Deliverable Title</label>
            <input type="text" id="ts-project-input" class="input" placeholder="e.g. Cloud API Integration & Testing" required />
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">Session Notes</label>
            <textarea id="ts-notes-input" class="textarea" rows="2" placeholder="Details of deliverables..."></textarea>
          </div>
        </form>

        <div class="modal-foot">
          <button type="button" class="btn btn-secondary btn-sm close-modal-btn" data-modal="timesheet-modal">Cancel</button>
          <button type="submit" form="timesheet-form" class="btn btn-primary btn-sm">Log Time</button>
        </div>
      </div>
    </div>
  `;
}
