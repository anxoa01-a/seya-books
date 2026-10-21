/**
 * ELSTER Tax Preparation & Anlage EÜR Export View
 * Map income and expenses directly to German tax declaration lines (Zeilen)
 * and generate official downloadable submission PDFs.
 */

import { generateElsterEuerSummary } from '../services/elsterService.js';

export function renderElsterExportView({
  transactions = [],
  taxAssessment = {},
  settings = {}
}) {
  const euerSummary = generateElsterEuerSummary(transactions, settings.isKleinunternehmer);
  const { totals } = euerSummary;

  return `
    <div class="animate-fade-in">
      <!-- Section Header -->
      <div class="section-head">
        <div>
          <h2>
            <span>ELSTER Tax Declaration (Anlage EÜR)</span>
            <span class="badge badge-info">Tax Year ${settings.taxYear || '2026'}</span>
          </h2>
          <div class="section-subtitle">Official line-by-line categorization for filing via meinelster.de or with your Steuerberater</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-export-elster-csv">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export CSV
          </button>
          <button class="btn btn-primary btn-sm" id="btn-download-elster-pdf">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8"/><path d="M8 17h8"/></svg>
            Download Anlage EÜR PDF
          </button>
        </div>
      </div>

      <!-- ELSTER Notice & Taxpayer Details -->
      <div class="glass-card" style="margin-bottom: 20px; padding: 18px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 4px;">
              ${settings.ownerName || 'Pritam Maharjan'} — ${settings.businessTitle || 'Self-Employed Professional'}
            </div>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Steuernummer: <strong>${settings.taxNumber || '14/234/56789'}</strong> • 
              Status: <span class="badge ${settings.isKleinunternehmer ? 'badge-success' : 'badge-neutral'}">${settings.isKleinunternehmer ? 'Kleinunternehmer gem. § 19 Abs. 1 UStG' : 'Regelbesteuerung'}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-dim); font-weight: 600;">Ermittelter Gewinn (Zeile 71)</div>
            <div style="font-family: var(--font-mono); font-size: 24px; font-weight: 800; color: var(--accent-emerald);">
              €${totals.netBusinessProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <!-- ELSTER Field Table -->
      <div class="glass-card" style="margin-bottom: 24px;">
        <div class="section-head" style="margin-bottom: 14px;">
          <h3 style="font-size: 16px; font-weight: 700;">Amtliche Zeilenübersicht (Anlage EÜR)</h3>
          <span class="badge badge-neutral">BMF Formularstandard</span>
        </div>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-medium); text-align: left; color: var(--text-muted); font-size: 12px; text-transform: uppercase;">
                <th style="padding: 10px 12px; width: 120px;">ELSTER Zeile</th>
                <th style="padding: 10px 12px;">Amtliche Bezeichnung</th>
                <th style="padding: 10px 12px; text-align: right;">Steuerlich Wirksam (Netto)</th>
                <th style="padding: 10px 12px; text-align: right;">Bruttobetrag</th>
                <th style="padding: 10px 12px; text-align: center; width: 80px;">Aktion</th>
              </tr>
            </thead>
            <tbody>
              <!-- Income Section -->
              <tr style="background: rgba(16, 185, 129, 0.05); font-weight: 700; color: var(--accent-emerald);">
                <td style="padding: 10px 12px;" colspan="5">1. BETRIEBSEINNAHMEN</td>
              </tr>
              ${euerSummary.categories.filter(c => c.category.type === 'income').map(item => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 10px 12px; font-weight: 700; font-family: var(--font-mono); color: var(--accent-cyan);">${item.category.code}</td>
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 600;">${item.category.name}</div>
                    <div style="font-size: 11.5px; color: var(--text-dim);">${item.category.description}</div>
                  </td>
                  <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono); font-weight: 700; color: var(--accent-emerald);">
                    €${item.netTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono); color: var(--text-muted);">
                    €${item.grossTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style="padding: 10px 12px; text-align: center;">
                    <button class="btn btn-secondary btn-sm copy-val-btn" data-val="${item.netTotal}" title="Copy value for ELSTER">
                      Copy
                    </button>
                  </td>
                </tr>
              `).join('')}

              <!-- Expense Section -->
              <tr style="background: rgba(244, 63, 94, 0.05); font-weight: 700; color: var(--accent-rose);">
                <td style="padding: 10px 12px;" colspan="5">2. BETRIEBSAUSGABEN</td>
              </tr>
              ${euerSummary.categories.filter(c => c.category.type === 'expense').map(item => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 10px 12px; font-weight: 700; font-family: var(--font-mono); color: var(--accent-cyan);">${item.category.code}</td>
                  <td style="padding: 10px 12px;">
                    <div style="font-weight: 600;">${item.category.name}</div>
                    <div style="font-size: 11.5px; color: var(--text-dim);">${item.category.description}</div>
                  </td>
                  <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono); font-weight: 700; color: var(--accent-rose);">
                    €${item.deductibleTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style="padding: 10px 12px; text-align: right; font-family: var(--font-mono); color: var(--text-muted);">
                    €${item.grossTotal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style="padding: 10px 12px; text-align: center;">
                    <button class="btn btn-secondary btn-sm copy-val-btn" data-val="${item.deductibleTotal}" title="Copy value for ELSTER">
                      Copy
                    </button>
                  </td>
                </tr>
              `).join('')}

              <!-- Profit Calculation -->
              <tr style="background: rgba(6, 182, 212, 0.08); font-weight: 800; font-size: 14.5px; border-top: 2px solid var(--border-medium);">
                <td style="padding: 12px; font-family: var(--font-mono); color: var(--accent-cyan);">Zeile 71</td>
                <td style="padding: 12px;">
                  Steuerlicher Gewinn (§ 4 Abs. 3 EStG Einnahmenüberschuss)
                </td>
                <td style="padding: 12px; text-align: right; font-family: var(--font-mono); color: var(--accent-cyan);" colspan="2">
                  €${totals.netBusinessProfit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </td>
                <td style="padding: 12px; text-align: center;">
                  <button class="btn btn-secondary btn-sm copy-val-btn" data-val="${totals.netBusinessProfit}" title="Copy value for ELSTER">
                    Copy
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
