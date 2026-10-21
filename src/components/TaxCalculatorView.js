/**
 * German Sole Proprietorship Tax Calculator View
 * Models § 19 UStG Kleinunternehmer exemption (25k net limit),
 * progressive Einkommensteuer (2025/2026), Soli, Gewerbesteuer, and Tax Reserve allocation.
 */

export function renderTaxCalculatorView({
  taxAssessment = {},
  settings = {},
  banks = []
}) {
  const {
    netProfit = 0,
    incomeTax = 0,
    solidaritySurcharge = 0,
    gewerbesteuer = 0,
    anrechnungESt = 0,
    vatPayable = 0,
    totalTaxReserve = 0,
    effectiveTaxRate = 0,
    kleinunternehmer = {},
    upcomingPrepaymentDates = []
  } = taxAssessment;

  const reserveBank = banks.find(b => b.id === 'bank_tax_reserve') || { balance: 0, name: 'Steuerrücklage' };
  const reserveDifference = reserveBank.balance - totalTaxReserve;
  const isReserveSufficient = reserveDifference >= 0;

  return `
    <div class="animate-fade-in">
      <!-- Header -->
      <div class="section-head">
        <div>
          <h2>
            <span>German Tax Calculator & Auto-Allocation</span>
            <span class="badge ${isReserveSufficient ? 'badge-success' : 'badge-caution'}">
              <span class="badge-dot"></span>
              ${isReserveSufficient ? 'Reserve Fully Funded' : `Reserve Deficit: €${Math.abs(Math.round(reserveDifference))}`}
            </span>
          </h2>
          <div class="section-subtitle">Steuerberechnung Deutschland 2026 für Einzelunternehmer & Freiberufler</div>
        </div>
      </div>

      <!-- Quick Interactive Status Toggles -->
      <div class="glass-card" style="margin-bottom: 20px; padding: 16px;">
        <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px;">
          Tax Classification & Regime
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <!-- Kleinunternehmer Toggle -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 13.5px; font-weight: 600;">Kleinunternehmer (§ 19 UStG)</span>
              <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                <input type="checkbox" id="tax-toggle-ku" ${settings.isKleinunternehmer ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                <span class="tax-slider" style="position: absolute; cursor: pointer; inset: 0; background-color: ${settings.isKleinunternehmer ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.2)'}; border-radius: 24px; transition: .3s;">
                  <span style="position: absolute; content: ''; height: 18px; width: 18px; left: ${settings.isKleinunternehmer ? '23px' : '3px'}; bottom: 3px; background-color: white; border-radius: 50%; transition: .3s;"></span>
                </span>
              </label>
            </div>
            <p style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4;">
              VAT exempt up to <strong>25.000 € net</strong> annual revenue. No VAT on invoices, no Vorsteuer deduction.
            </p>
          </div>

          <!-- Freiberufler vs Gewerbe Toggle -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 13.5px; font-weight: 600;">Freiberufler Status</span>
              <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                <input type="checkbox" id="tax-toggle-freiberufler" ${settings.isFreiberufler ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                <span class="tax-slider" style="position: absolute; cursor: pointer; inset: 0; background-color: ${settings.isFreiberufler ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.2)'}; border-radius: 24px; transition: .3s;">
                  <span style="position: absolute; content: ''; height: 18px; width: 18px; left: ${settings.isFreiberufler ? '23px' : '3px'}; bottom: 3px; background-color: white; border-radius: 50%; transition: .3s;"></span>
                </span>
              </label>
            </div>
            <p style="font-size: 11.5px; color: var(--text-muted); line-height: 1.4;">
              ${settings.isFreiberufler ? 'Exempt from Gewerbesteuer (Trade Tax). Liberal professions / developers / consultants.' : 'Subject to Gewerbesteuer (Trade Tax) above 24.500 € profit allowance.'}
            </p>
          </div>
        </div>
      </div>

      <!-- Tax Allocation Reserve Banner -->
      <div class="glass-card" style="margin-bottom: 24px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(16, 185, 129, 0.04)); border: 1px solid rgba(245, 158, 11, 0.3);">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="color: #f59e0b;"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h3 style="font-size: 18px; font-weight: 700;">Recommended Tax Reserve (Steuerrücklage)</h3>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 520px;">
              Based on your year-to-date profit of <strong>€${netProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong>, 
              you should allocate <strong>€${totalTaxReserve.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong> into your dedicated tax reserve account.
            </p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); font-weight: 600;">Total Tax Provision</div>
            <div style="font-family: var(--font-mono); font-size: 28px; font-weight: 800; color: var(--accent-amber);">
              €${totalTaxReserve.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </div>
            <div style="font-size: 12px; color: var(--text-muted);">
              Current Reserve Balance: <strong style="color: var(--text-main);">€${(reserveBank.balance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Itemized Tax Component Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <!-- 1. Einkommensteuer -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Einkommensteuer (§ 32a EStG)</span>
            <span class="badge badge-neutral">Tarif 2026</span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
            €${incomeTax.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
            Grundfreibetrag: <strong>12.096 €</strong> (0% tax below this). Progressive marginal tax rate applied to net taxable profit.
          </div>
        </div>

        <!-- 2. Solidaritätszuschlag -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Solidaritätszuschlag</span>
            <span class="badge ${solidaritySurcharge === 0 ? 'badge-success' : 'badge-warning'}">
              ${solidaritySurcharge === 0 ? 'Freigrenze aktiv (0 €)' : 'Soli anfällig'}
            </span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
            €${solidaritySurcharge.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
            Exempt up to 18.130 € income tax liability for single taxpayers.
          </div>
        </div>

        <!-- 3. Gewerbesteuer -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Gewerbesteuer (Trade Tax)</span>
            <span class="badge ${settings.isFreiberufler ? 'badge-success' : 'badge-neutral'}">
              ${settings.isFreiberufler ? 'Freiberufler (Befreit)' : 'Gewerbe'}
            </span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
            €${gewerbesteuer.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
            ${settings.isFreiberufler ? 'Freiberufler according to § 18 EStG are legally exempt from trade tax.' : `Freibetrag: 24.500 €. Offset of €${anrechnungESt} against income tax via § 35 EStG.`}
          </div>
        </div>

        <!-- 4. Umsatzsteuer (VAT Zahllast) -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 13px; font-weight: 600; color: var(--text-muted);">Umsatzsteuer-Zahllast</span>
            <span class="badge ${settings.isKleinunternehmer ? 'badge-success' : 'badge-neutral'}">
              ${settings.isKleinunternehmer ? '§ 19 UStG Befreit' : 'Regelbesteuerung'}
            </span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 22px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">
            €${vatPayable.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>
          <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4;">
            ${settings.isKleinunternehmer ? 'No VAT collected from clients and no Vorsteuer payment required.' : `Collected USt minus deductible Vorsteuer.`}
          </div>
        </div>
      </div>

      <!-- Quarterly Prepayment Calendar (Finanzamt Vorauszahlungen) -->
      <div class="glass-card">
        <div class="section-head" style="margin-bottom: 14px;">
          <h3 style="font-size: 16px; font-weight: 700;">Finanzamt Prepayment Calendar (Vorauszahlungstermine 2026)</h3>
          <span class="badge badge-neutral">Quarterly ESt Prepayments</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
          ${upcomingPrepaymentDates.map(item => `
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="badge badge-neutral" style="font-weight: 700;">${item.quarter}</span>
                <span style="font-size: 12px; color: var(--text-muted);">${item.date}</span>
              </div>
              <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; color: var(--accent-emerald);">
                €${item.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">Recommended quarterly set-aside</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
