/**
 * SEYA BOOKS - Clients View (Pure Black & White Monochrome)
 * Full client directory, billable rates, outstanding revenue, timesheet connection
 */

export function renderClientsView({
  clients = [],
  timesheets = [],
  transactions = []
}) {
  // Compute client stats
  const clientStats = clients.map(client => {
    const clientTs = timesheets.filter(ts => ts.clientId === client.id || ts.clientName === client.name);
    const unbilledTs = clientTs.filter(ts => !ts.invoiced);
    const unbilledHours = unbilledTs.reduce((acc, ts) => acc + (Number(ts.hours) || 0), 0);
    const unbilledAmount = unbilledHours * (Number(client.hourlyRate) || 95);

    const clientTx = transactions.filter(t => t.clientId === client.id || t.clientName === client.name);
    const totalPaid = clientTx.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    return {
      ...client,
      unbilledHours,
      unbilledAmount,
      totalPaid,
      timesheetCount: clientTs.length
    };
  });

  const totalClients = clients.length;
  const totalUnbilledRevenue = clientStats.reduce((acc, c) => acc + c.unbilledAmount, 0);
  const totalPaidRevenue = clientStats.reduce((acc, c) => acc + c.totalPaid, 0);
  const avgRate = totalClients > 0 ? Math.round(clients.reduce((acc, c) => acc + (Number(c.hourlyRate) || 0), 0) / totalClients) : 100;

  return `
    <div>
      <!-- Section Title & Actions -->
      <div class="section-title-row">
        <div>
          <h2 class="section-title">
            <span>Clients & Directory</span>
            <span class="badge badge-outline">${totalClients} Accounts</span>
          </h2>
          <div class="section-desc">Manage customer accounts, billable rates, contracts & unbilled revenues</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" id="btn-add-client-modal">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Client
          </button>
        </div>
      </div>

      <!-- Clients Financial Metrics -->
      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-top">
            <span>Active Clients</span>
            <span class="badge badge-outline">Total</span>
          </div>
          <div class="metric-num">${totalClients}</div>
          <div class="metric-sub">Retainers & projects</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Unbilled Work</span>
            <span class="badge badge-filled">Ready</span>
          </div>
          <div class="metric-num">€${totalUnbilledRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Pending client invoicing</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Collected YTD</span>
            <span class="badge badge-outline">Paid</span>
          </div>
          <div class="metric-num">€${totalPaidRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Customer receipts</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Avg Hourly Rate</span>
            <span class="badge badge-outline">Pricing</span>
          </div>
          <div class="metric-num">€${avgRate}/h</div>
          <div class="metric-sub">Standard billing rate</div>
        </div>
      </div>

      <!-- Clients Directory Table / List -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div class="card-title">Client Accounts</div>
          <span class="badge badge-outline">Monochrome Directory</span>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Client / Organization</th>
                <th>Contact</th>
                <th>Rate</th>
                <th>Payment Term</th>
                <th>Unbilled Work</th>
                <th>Total Invoiced</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${clientStats.map(c => `
                <tr class="client-row" data-id="${c.id}">
                  <td>
                    <div style="font-weight: 700; color: var(--text-primary); font-size: 14px;">${c.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${c.projects ? c.projects.join(' • ') : 'Standard Engagement'}</div>
                  </td>
                  <td>
                    <div style="color: var(--text-primary);">${c.contactPerson || c.name}</div>
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${c.email || '—'}</div>
                  </td>
                  <td>
                    <div style="font-family: var(--font-mono); font-weight: 600;">€${c.hourlyRate || 95}/h</div>
                  </td>
                  <td>
                    <span class="badge badge-outline">${c.paymentTerms || '14 Days'}</span>
                  </td>
                  <td>
                    <div style="font-family: var(--font-mono); font-weight: 700;">
                      ${c.unbilledAmount > 0 ? `€${c.unbilledAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '—'}
                    </div>
                    ${c.unbilledHours > 0 ? `<div style="font-size: 10px; color: var(--text-muted);">${c.unbilledHours} hrs logged</div>` : ''}
                  </td>
                  <td>
                    <div style="font-family: var(--font-mono); color: var(--text-secondary);">
                      €${c.totalPaid.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm client-bill-btn" data-id="${c.id}" title="Log Time">
                        Log Hours
                      </button>
                      <button class="btn btn-ghost btn-sm client-delete-btn" data-id="${c.id}" title="Delete Client" style="padding: 4px 8px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
