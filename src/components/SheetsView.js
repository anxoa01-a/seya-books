/**
 * SEYA BOOKS - Sheets View (Banking, Taxes, Vault, Timesheet with AI Auto-Sheet Parser)
 * Pure Black & White with Reflective Accents & Clean CSV Export
 */

import { generateElsterEuerSummary, getCategoryById } from '../services/elsterService.js';

export function renderSheetsView({
  activeSubSheet = 'banking',
  banks = [],
  transactions = [],
  taxAssessment = {},
  settings = {},
  files = [],
  timesheets = [],
  brands = [],
  timerRunning = false,
  timerSeconds = 0,
  hourlyRate = 125,
  aiParsedSession = null,
  isParsingSession = false
}) {
  const isKu = settings.isKleinunternehmer !== false;
  const euerSummary = generateElsterEuerSummary(transactions, isKu);

  let sheetContent = '';

  // 1. BANKING & FEEDS SUB-SHEET
  if (activeSubSheet === 'banking') {
    sheetContent = `
      <div>
        <!-- Bank Accounts Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
          ${banks.map(bank => `
            <div class="card" style="padding: 18px 20px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <div style="font-weight: 800; font-size: 15px; color: var(--text-primary);">${bank.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">
                    ${bank.iban || 'DE89 3704 0044 0532 0130 00'}
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="badge ${bank.type === 'tax_reserve' ? 'badge-reflective' : 'badge-outline'}">
                    ${bank.type === 'tax_reserve' ? 'Tax Reserve Account' : 'Operating Account'}
                  </span>
                  <button class="btn btn-ghost btn-sm delete-bank-btn" data-id="${bank.id}" title="Delete Bank Account" style="padding: 3px 6px; font-size: 11px; color: var(--text-muted);">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                  </button>
                </div>
              </div>
              <div style="font-family: var(--font-mono); font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
                €${Number(bank.balance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </div>
              <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
                <span>Live Feed Connected</span>
                <span class="badge-dot" title="Active Feed Sync"></span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Ledger with Clean Tax CSV Download Button -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div>
              <div class="card-title">Transactions Ledger</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Clean structured entries for German tax preparation</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm" id="btn-download-tax-csv-sheets">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download Clean Tax CSV
              </button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Account</th>
                  <th>Description / Name</th>
                  <th>Category</th>
                  <th style="text-align: right;">Amount (€)</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
                      No transactions recorded yet. Click <strong>+</strong> or use the AI Copilot to record your first income or expense.
                    </td>
                  </tr>
                ` : transactions.map(t => {
                  const cat = getCategoryById(t.category);
                  const isInc = t.type === 'income';
                  return `
                    <tr>
                      <td style="font-family: var(--font-mono); font-size: 12px;">${t.date}</td>
                      <td>
                        <span class="badge ${isInc ? 'badge-filled' : 'badge-outline'}" style="font-size: 9.5px;">
                          ${isInc ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td><span style="color: var(--text-secondary); font-size: 12px;">${t.bankName || 'Business Checking'}</span></td>
                      <td style="font-weight: 600;">${t.description}</td>
                      <td><span style="color: var(--text-muted); font-size: 11.5px;">${cat.shortName || 'General'}</span></td>
                      <td style="text-align: right; font-family: var(--font-mono); font-weight: 700;">
                        ${isInc ? '+' : '-'}€${Number(t.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                      </td>
                      <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm edit-tx-btn" data-id="${t.id}" style="padding: 3px 8px; font-size: 11px;">
                          Edit
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // 2. TAX & ELSTER SUB-SHEET
  else if (activeSubSheet === 'taxes') {
    const { incomeTax = 0, solidaritySurcharge = 0, gewerbesteuer = 0, totalTaxReserve = 0, effectiveTaxRate = 0 } = taxAssessment;
    sheetContent = `
      <div>
        <div class="metrics-row">
          <div class="metric-card">
            <div class="metric-top">
              <span>Einkommensteuer</span>
              <span class="badge badge-outline">ESt 2026</span>
            </div>
            <div class="metric-num">€${Math.round(incomeTax).toLocaleString('de-DE')}</div>
            <div class="metric-sub">Progressive income tax</div>
          </div>

          <div class="metric-card">
            <div class="metric-top">
              <span>Solidaritätszuschlag</span>
              <span class="badge badge-outline">Soli</span>
            </div>
            <div class="metric-num">€${Math.round(solidaritySurcharge).toLocaleString('de-DE')}</div>
            <div class="metric-sub">Null below statutory threshold</div>
          </div>

          <div class="metric-card">
            <div class="metric-top">
              <span>Gewerbesteuer</span>
              <span class="badge badge-outline">GewSt</span>
            </div>
            <div class="metric-num">€${Math.round(gewerbesteuer).toLocaleString('de-DE')}</div>
            <div class="metric-sub">${settings.isFreiberufler ? 'Freiberufler (Exempt)' : 'Gewerbe'}</div>
          </div>

          <div class="metric-card">
            <div class="metric-top">
              <span>Total Reserve</span>
              <span class="badge badge-reflective">Target</span>
            </div>
            <div class="metric-num">€${Math.round(totalTaxReserve).toLocaleString('de-DE')}</div>
            <div class="metric-sub">Effective rate: ${effectiveTaxRate.toFixed(1)}%</div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <div class="card-header">
            <div>
              <div class="card-title">ELSTER Official Tax Filing Prep</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Anlage EÜR form & Kennzahlen summary</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" id="btn-export-elster-csv">
                Export CSV
              </button>
              <button class="btn btn-primary btn-sm" id="btn-download-elster-pdf">
                Download Anlage EÜR PDF
              </button>
            </div>
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
            All financial entries have been automatically categorized into their respective official German tax lines (Kennzahlen 100 to 250). You can export the submission CSV directly for upload into MeinELSTER or generate a standardized submission PDF for your Steuerberater.
          </div>
        </div>
      </div>
    `;
  }

  // 3. DOCUMENT VAULT SUB-SHEET
  else if (activeSubSheet === 'vault') {
    sheetContent = `
      <div>
        <div class="card" id="vault-dropzone" style="border: 2px dashed var(--border-medium); text-align: center; padding: 36px 20px; margin-bottom: 24px; cursor: pointer;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-xs); background: var(--text-primary); color: var(--text-inverse); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 4px;">Upload Receipts, Invoices & Tax Documents</h4>
          <p style="font-size: 12px; color: var(--text-muted); max-width: 400px; margin: 0 auto;">Drag & drop PDF, JPG, PNG or click to browse. Stored locally on your device in IndexedDB.</p>
          <input type="file" id="vault-file-input" style="display: none;" multiple />
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between;">
            <div class="card-title">Stored Documents (${files.length})</div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${files.map(f => `
                  <tr>
                    <td><div style="font-weight: 600; color: var(--text-primary);">${f.name}</div></td>
                    <td><span class="badge badge-outline" style="text-transform: capitalize;">${f.type || 'Receipt'}</span></td>
                    <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">${f.date}</td>
                    <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">${f.size || '340 KB'}</td>
                    <td style="text-align: right;">
                      <button class="btn btn-ghost btn-sm vault-delete-btn" data-id="${f.id}" title="Delete Document">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                      </button>
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

  // 4. TIMESHEET & TIMER WITH AI WORK SESSION AUTO-SHEET GENERATOR
  else if (activeSubSheet === 'timesheets') {
    const totalHours = timesheets.reduce((acc, ts) => acc + (Number(ts.hours) || 0), 0);
    const unbilledHours = timesheets.filter(ts => !ts.invoiced).reduce((acc, ts) => acc + (Number(ts.hours) || 0), 0);
    const timerH = String(Math.floor(timerSeconds / 3600)).padStart(2, '0');
    const timerM = String(Math.floor((timerSeconds % 3600) / 60)).padStart(2, '0');
    const timerS = String(timerSeconds % 60).padStart(2, '0');
    const accrued = ((timerSeconds / 3600) * hourlyRate).toFixed(2);

    sheetContent = `
      <div>
        <!-- AI WORK SESSION AUTO-SHEET GENERATOR (Paste Text -> Auto-creates Sheet) -->
        <div class="card" style="margin-bottom: 24px; padding: 22px; background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border: 1px solid var(--border-medium);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="brand-symbol" style="width: 28px; height: 28px; font-size: 13px;">AI</div>
              <div>
                <div style="font-weight: 800; font-size: 14.5px;">AI Work Session Auto-Sheet</div>
                <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                  Upload or paste text notes &rarr; AI extracts Date, Hours, Pay & Brand for the sheet
                </div>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-open-full-ai-sheet-modal">
              Advanced Modal &rarr;
            </button>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap;">
            <input 
              type="text" 
              id="sheet-quick-ai-text" 
              class="input" 
              style="flex: 1; min-width: 280px;" 
              placeholder="e.g. 'Worked 4.5 hrs yesterday for Seya Pay on Stripe webhook at 130/hr'..." 
            />
            <button class="btn btn-primary" id="btn-parse-sheet-text-inline" ${isParsingSession ? 'disabled' : ''}>
              ${isParsingSession ? 'Parsing...' : 'Generate Sheet Entry'}
            </button>
          </div>

          ${aiParsedSession ? `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-strong); border-radius: var(--radius-sm); padding: 16px; margin-top: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="badge badge-filled">Review & Adjust Auto-Sheet Values</span>
                <span style="font-size: 11px; color: var(--text-muted);">Adjust directly before committing</span>
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 12px;">
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Brand / Business</label>
                  <input type="text" id="inline-edit-brand" class="input" value="${aiParsedSession.businessName || 'Seya Pay'}" />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Date</label>
                  <input type="date" id="inline-edit-date" class="input text-mono" value="${aiParsedSession.date}" />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Hours</label>
                  <input type="number" step="0.25" id="inline-edit-hours" class="input text-mono" value="${aiParsedSession.hours}" />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Pay (€/h)</label>
                  <input type="number" step="1" id="inline-edit-rate" class="input text-mono" value="${aiParsedSession.hourlyRate}" />
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                  <label class="form-label">Total Pay</label>
                  <div style="font-family: var(--font-mono); font-size: 16px; font-weight: 700; padding: 10px 0; color: var(--text-primary);">
                    €${(aiParsedSession.hours * aiParsedSession.hourlyRate).toFixed(2)}
                  </div>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button class="btn btn-secondary btn-sm" id="btn-cancel-inline-sheet">Discard</button>
                <button class="btn btn-primary btn-sm" id="btn-commit-inline-sheet">Save to Timesheet Table &rarr;</button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Live Work Timer Card -->
        <div class="card" style="margin-bottom: 24px; padding: 22px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); font-family: var(--font-mono);">
              Active Live Work Session • €${hourlyRate}/hr
            </div>
            <div id="sheets-live-timer" style="font-family: var(--font-mono); font-size: 38px; font-weight: 800; letter-spacing: -0.04em; color: var(--text-primary); margin: 4px 0;">
              ${timerH}:${timerM}:${timerS}
            </div>
            <div id="sheets-live-accrued" style="font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono);">
              €${accrued} accrued this session
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn ${timerRunning ? 'btn-secondary' : 'btn-primary'}" id="sheets-btn-timer-toggle">
              ${timerRunning ? 'Pause Timer' : 'Start Timer'}
            </button>
            <button class="btn btn-secondary" id="sheets-btn-timer-commit" ${timerSeconds < 60 ? 'disabled' : ''}>
              Commit Session
            </button>
          </div>
        </div>

        <!-- Timesheet Ledger Table -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div>
              <div class="card-title">Timesheet Ledger</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Total: ${totalHours} hrs • Unbilled: ${unbilledHours} hrs</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm" id="btn-add-timesheet-modal">
                Log Session Manually
              </button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Brand / Client</th>
                  <th>Deliverable / Task</th>
                  <th>Hours</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th style="text-align: right;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${timesheets.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
                      No billable work sessions logged yet. Use the Live Timer or paste text notes above to create entries.
                    </td>
                  </tr>
                ` : timesheets.map(ts => `
                  <tr>
                    <td style="font-family: var(--font-mono); font-size: 12px;">${ts.date}</td>
                    <td style="font-weight: 700;">${ts.businessName || ts.clientName}</td>
                    <td style="color: var(--text-secondary);">${ts.project || 'General Scope'}</td>
                    <td style="font-family: var(--font-mono); font-weight: 600;">${ts.hours} hrs</td>
                    <td style="font-family: var(--font-mono); color: var(--text-muted);">€${ts.hourlyRate}/h</td>
                    <td style="font-family: var(--font-mono); font-weight: 700;">€${(ts.hours * ts.hourlyRate).toFixed(2)}</td>
                    <td style="text-align: right;">
                      <button class="btn btn-sm ${ts.invoiced ? 'btn-ghost' : 'btn-secondary'} ts-invoice-toggle-btn" data-id="${ts.id}">
                        ${ts.invoiced ? 'Invoiced' : 'Mark Invoiced'}
                      </button>
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

  return `
    <div>
      <div class="section-title-row">
        <div>
          <h2 class="section-title">
            <span>Financial Sheets & Operations</span>
            <span class="badge badge-reflective">Seya OS</span>
          </h2>
          <div class="section-desc">Banking feeds, German Taxes, Document Vault & AI Timesheets</div>
        </div>
      </div>

      <!-- Sub-Sheets Tabs -->
      <div class="subtabs-bar">
        <button class="subtab-btn ${activeSubSheet === 'banking' ? 'active' : ''}" data-subsheet="banking">
          Banking & Feeds
        </button>
        <button class="subtab-btn ${activeSubSheet === 'taxes' ? 'active' : ''}" data-subsheet="taxes">
          Tax & ELSTER
        </button>
        <button class="subtab-btn ${activeSubSheet === 'vault' ? 'active' : ''}" data-subsheet="vault">
          Document Vault
        </button>
        <button class="subtab-btn ${activeSubSheet === 'timesheets' ? 'active' : ''}" data-subsheet="timesheets">
          Timesheets & AI Timer
        </button>
      </div>

      <!-- Active Sub-sheet Container -->
      ${sheetContent}
    </div>
  `;
}
