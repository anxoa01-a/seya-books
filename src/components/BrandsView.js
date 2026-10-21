/**
 * SEYA BOOKS - Brands View (Brands under Seya Technologies)
 * Pure Black & White with Reflective Accents
 * Standard rate removed; displays Total Earned for each brand.
 */

export function renderBrandsView({
  brands = [],
  timesheets = [],
  transactions = []
}) {
  const brandStats = brands.map(brand => {
    const brandTs = timesheets.filter(ts => ts.clientId === brand.id || ts.clientName === brand.name || (ts.businessName && ts.businessName.toLowerCase() === brand.name.toLowerCase()));
    const unbilledTs = brandTs.filter(ts => !ts.invoiced);
    const unbilledHours = unbilledTs.reduce((acc, ts) => acc + (Number(ts.hours) || 0), 0);
    const unbilledAmount = unbilledHours * (Number(brand.hourlyRate) || 120);

    const brandTx = transactions.filter(t => t.clientId === brand.id || t.clientName === brand.name || (t.businessName && t.businessName.toLowerCase() === brand.name.toLowerCase()));
    const totalEarned = brandTx.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    return {
      ...brand,
      unbilledHours,
      unbilledAmount,
      totalEarned,
      timesheetCount: brandTs.length
    };
  });

  const totalBrands = brands.length;
  const totalEarnedRevenue = brandStats.reduce((acc, b) => acc + b.totalEarned, 0);
  const totalUnbilledRevenue = brandStats.reduce((acc, b) => acc + b.unbilledAmount, 0);

  return `
    <div>
      <!-- Section Title & Actions -->
      <div class="section-title-row">
        <div>
          <h2 class="section-title">
            <span>Brands Portfolio</span>
            <span class="badge badge-reflective">Seya Technologies</span>
          </h2>
          <div class="section-desc">Manage ventures, brand performance, and revenue earned under Seya Technologies</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary btn-sm" id="btn-add-brand-modal">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Brand
          </button>
        </div>
      </div>

      <!-- Brands Portfolio Financial Metrics -->
      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-top">
            <span>Active Brands</span>
            <span class="badge badge-outline">Seya Tech</span>
          </div>
          <div class="metric-num">${totalBrands}</div>
          <div class="metric-sub">Portfolio entities</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Total Earned</span>
            <span class="badge badge-reflective">Revenue</span>
          </div>
          <div class="metric-num">€${totalEarnedRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Lifetime brand revenue</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Unbilled Work</span>
            <span class="badge badge-filled">Ready</span>
          </div>
          <div class="metric-num">€${totalUnbilledRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
          <div class="metric-sub">Logged work pending billing</div>
        </div>

        <div class="metric-card">
          <div class="metric-top">
            <span>Brand Status</span>
            <span class="badge badge-outline">Operational</span>
          </div>
          <div class="metric-num">${brandStats.filter(b => b.totalEarned > 0).length}/${totalBrands} Active</div>
          <div class="metric-sub">Monetized ventures</div>
        </div>
      </div>

      <!-- Brands Table / Directory -->
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
          <div class="card-title">Brands under Seya Technologies</div>
          <span class="badge badge-outline">${totalBrands} Entities</span>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Brand Name</th>
                <th>Focus / Scope</th>
                <th>Total Earned</th>
                <th>Payment Term</th>
                <th>Unbilled Work</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${brandStats.map(b => `
                <tr class="brand-row" data-id="${b.id}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <span style="font-weight: 800; color: var(--text-primary); font-size: 14.5px;">
                        ${b.name}
                      </span>
                      <span class="badge badge-reflective" style="font-size: 10px; padding: 2px 7px;">
                        Total Earned: €${b.totalEarned.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">
                      ${b.email || 'brand@seyatechnologies.com'}
                    </div>
                  </td>
                  <td>
                    <div style="color: var(--text-primary); font-size: 13px;">
                      ${b.projects ? b.projects.join(' • ') : 'Software & Design'}
                    </div>
                  </td>
                  <td>
                    <div style="font-family: var(--font-mono); font-weight: 800; font-size: 14.5px; color: var(--text-primary);">
                      €${b.totalEarned.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </div>
                    <div style="font-size: 10px; color: var(--text-muted);">Total Earned</div>
                  </td>
                  <td>
                    <span class="badge badge-outline">${b.paymentTerms || '14 Days'}</span>
                  </td>
                  <td>
                    <div style="font-family: var(--font-mono); font-weight: 700;">
                      ${b.unbilledAmount > 0 ? `€${b.unbilledAmount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}` : '—'}
                    </div>
                    ${b.unbilledHours > 0 ? `<div style="font-size: 10px; color: var(--text-muted);">${b.unbilledHours} hrs logged</div>` : ''}
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 6px; justify-content: flex-end;">
                      <button class="btn btn-secondary btn-sm brand-bill-btn" data-id="${b.id}" data-name="${b.name}" data-rate="${b.hourlyRate || 120}">
                        Log Hours
                      </button>
                      <button class="btn btn-ghost btn-sm brand-delete-btn" data-id="${b.id}" title="Delete Brand" style="padding: 4px 8px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
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
