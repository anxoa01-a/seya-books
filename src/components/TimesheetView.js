/**
 * Timesheet & Future Income Returns Projection View
 * Tracks client billable hours, calculates pending unbilled revenue,
 * and uses Groq AI to project future income returns and growth trajectory.
 */

export function renderTimesheetView({
  timesheets = [],
  clients = [],
  totals = {},
  forecastData = null,
  isForecasting = false
}) {
  let totalHours = 0;
  let unbilledHours = 0;
  let unbilledRevenue = 0;

  timesheets.forEach(ts => {
    const h = Number(ts.hours) || 0;
    const rate = Number(ts.hourlyRate) || 85;
    totalHours += h;
    if (!ts.invoiced) {
      unbilledHours += h;
      unbilledRevenue += (h * rate);
    }
  });

  const avgRate = timesheets.length > 0 ? Math.round(timesheets.reduce((acc, t) => acc + (Number(t.hourlyRate) || 0), 0) / timesheets.length) : 95;

  return `
    <div class="animate-fade-in">
      <!-- Section Header -->
      <div class="section-head">
        <div>
          <h2>
            <span>Timesheet & Future Returns</span>
            <span class="badge badge-success">€${unbilledRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })} Ready to Invoice</span>
          </h2>
          <div class="section-subtitle">Track billable client hours and project future earnings with Groq AI</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-project-future-income" ${isForecasting ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="${isForecasting ? 'animate-spin' : ''}"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            ${isForecasting ? 'Forecasting...' : 'Calculate Future Income Returns'}
          </button>
          <button class="btn btn-primary btn-sm" id="btn-add-timesheet-entry">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Log Hours
          </button>
        </div>
      </div>

      <!-- KPI Overview Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">Unbilled Work</span>
          <div class="metric-value text-emerald">€${unbilledRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-footnote">${unbilledHours} pending billable hours</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Total Logged Hours</span>
          <div class="metric-value text-cyan">${totalHours} hrs</div>
          <div class="metric-footnote">${timesheets.length} logged sessions</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Average Billing Rate</span>
          <div class="metric-value text-main">€${avgRate}/hr</div>
          <div class="metric-footnote">Across active clients</div>
        </div>
        <div class="metric-card">
          <span class="metric-label">Estimated Future Run-rate</span>
          <div class="metric-value text-amber">€${Math.round(unbilledRevenue + (totals.totalIncomeNet || 0)).toLocaleString('de-DE', { minimumFractionDigits: 0 })}</div>
          <div class="metric-footnote">Recorded + pipeline</div>
        </div>
      </div>

      <!-- Groq AI Future Income Returns Projection Banner -->
      ${forecastData ? `
        <div class="glass-card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(99, 102, 241, 0.06)); border: 1px solid rgba(6, 182, 212, 0.3);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="color: #06b6d4;"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                <h3 style="font-size: 17px; font-weight: 700; color: var(--text-main);">Groq AI Future Income Forecast</h3>
              </div>
              <div class="section-subtitle">Algorithmic revenue return projections based on your active billings and capacity</div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="badge badge-info" style="font-size: 11px;">Confidence: ${forecastData.confidenceScore || 88}%</span>
              <span class="badge badge-success" style="font-size: 11px;">Growth: +${forecastData.growthRatePercent || 12}%</span>
            </div>
          </div>

          <!-- Projection Numbers Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px;">
              <div style="font-size: 11.5px; color: var(--text-muted); text-transform: uppercase;">Next Quarter Revenue</div>
              <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--accent-cyan); margin-top: 4px;">
                €${Number(forecastData.projectedQuarterRevenue || 0).toLocaleString('de-DE')}
              </div>
            </div>
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px;">
              <div style="font-size: 11.5px; color: var(--text-muted); text-transform: uppercase;">12-Month Projected Revenue</div>
              <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--accent-emerald); margin-top: 4px;">
                €${Number(forecastData.projectedAnnualRevenue || 0).toLocaleString('de-DE')}
              </div>
            </div>
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px;">
              <div style="font-size: 11.5px; color: var(--text-muted); text-transform: uppercase;">Est. Future Tax Liability</div>
              <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--accent-amber); margin-top: 4px;">
                €${Number(forecastData.estimatedAnnualTaxLiability || 0).toLocaleString('de-DE')}
              </div>
            </div>
          </div>

          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; background: rgba(0, 0, 0, 0.2); padding: 12px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--accent-cyan);">
            <strong>Strategic Recommendation:</strong> ${forecastData.strategicAdvice || 'Maintain steady billable pacing and prepare advance quarterly tax reserves.'}
          </p>
        </div>
      ` : ''}

      <!-- Timesheet Ledger List -->
      <div class="glass-card">
        <div class="section-head" style="margin-bottom: 14px;">
          <h3 style="font-size: 16px; font-weight: 700;">Logged Work Sessions</h3>
          <span class="badge badge-neutral">${timesheets.length} Entries</span>
        </div>

        <div class="tx-list">
          ${timesheets.map(t => {
            const rowTotal = (Number(t.hours) || 0) * (Number(t.hourlyRate) || 85);
            return `
              <div class="tx-row" data-id="${t.id}">
                <div class="tx-left">
                  <div class="tx-icon-pill" style="background: rgba(245, 158, 11, 0.12); color: #f59e0b;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div class="tx-meta">
                    <div class="tx-title">${t.project || 'Consulting Session'}</div>
                    <div class="tx-subtext">
                      <span>${t.date}</span>
                      <span>•</span>
                      <span style="color: var(--text-main); font-weight: 600;">${t.clientName || 'Client'}</span>
                      <span>•</span>
                      <span>${t.hours} hrs @ €${t.hourlyRate}/hr</span>
                    </div>
                  </div>
                </div>
                <div class="tx-right">
                  <div class="tx-amount" style="color: var(--text-main);">
                    €${rowTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <button class="badge ${t.invoiced ? 'badge-success' : 'badge-caution'} toggle-invoiced-btn" data-id="${t.id}" style="cursor: pointer; border: none;">
                      ${t.invoiced ? 'Invoiced' : 'Pending'}
                    </button>
                    <button class="btn btn-secondary btn-sm delete-timesheet-btn" data-id="${t.id}" title="Delete" style="padding: 2px 6px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
