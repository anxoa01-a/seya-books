/**
 * SEYA BOOKS - Setup View (Plain Black & White Monochrome)
 * Solopreneur Profile, German Tax Registration, Bank Accounts & Pockets, Groq AI API Key & Data Backups
 */

export function renderSetupView({
  settings = {},
  groqStatus = 'idle',
  banks = []
}) {
  return `
    <div>
      <div class="section-title-row">
        <div>
          <h2 class="section-title">Business Setup & Preferences</h2>
          <div class="section-desc">Configure business profile, German tax status, bank accounts & pockets, Groq AI key & data backups</div>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-save-setup">
          Save Configuration
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
        <!-- 1. Profile & Business Identification -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">1. Business Profile & Identification</div>
            <span class="badge badge-outline">Tax Entity</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px;">
            <div class="form-group">
              <label class="form-label">Full Name / Owner</label>
              <input type="text" id="setup-owner-name" class="input" value="${settings.ownerName || 'Pritam Maharjan'}" />
            </div>

            <div class="form-group">
              <label class="form-label">Business Title / Profession</label>
              <input type="text" id="setup-business-title" class="input" value="${settings.businessTitle || 'Freelance Consultant & Designer'}" />
            </div>

            <div class="form-group">
              <label class="form-label">Steuernummer (Tax Number)</label>
              <input type="text" id="setup-tax-number" class="input text-mono" value="${settings.taxNumber || '14/234/56789'}" />
            </div>

            <div class="form-group">
              <label class="form-label">USt-IdNr (VAT ID - Optional)</label>
              <input type="text" id="setup-vat-id" class="input text-mono" value="${settings.vatId || 'DE345678901'}" />
            </div>
          </div>
        </div>

        <!-- 2. Bank Accounts & Pockets / Spaces -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">2. Bank Accounts, Pockets & Spaces</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Create sub-accounts, tax reserves, or payment gateways</div>
            </div>
            <span class="badge badge-outline">${banks.length} Connected</span>
          </div>

          <!-- Existing Accounts List -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 18px;">
            ${banks.map(b => `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 14px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${b.name}</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px; font-family: var(--font-mono);">${b.type || 'Checking'} ${b.ibanLast4 ? `• ****${b.ibanLast4}` : ''}</div>
                  <div style="font-family: var(--font-mono); font-weight: 700; font-size: 15px; margin-top: 8px; color: var(--text-primary);">
                    €${Number(b.balance || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm delete-bank-btn" data-id="${b.id}" title="Remove Account / Pocket" style="padding: 4px 6px; font-size: 10px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
                </button>
              </div>
            `).join('')}
          </div>

          <!-- Add Account / Pocket Inline Form -->
          <div style="background: var(--bg-subtle); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px;">
            <div style="font-weight: 700; font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 12px; font-family: var(--font-mono);">
              + Create Bank Account or Sub-Account Pocket
            </div>
            <form id="add-bank-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) auto; gap: 10px; align-items: flex-end;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Account / Pocket Name *</label>
                <input type="text" id="new-bank-name" class="input" placeholder="e.g. Tax Reserve Pocket, Revolut" required />
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Type</label>
                <select id="new-bank-type" class="select">
                  <option value="Checking">Checking Account</option>
                  <option value="Savings/Pocket">Savings / Sub-Account Pocket</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Payment Gateway">Payment Gateway / Stripe</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Initial Balance (€)</label>
                <input type="number" step="0.01" id="new-bank-balance" class="input text-mono" placeholder="0.00" value="0.00" />
              </div>
              <button type="submit" class="btn btn-primary" style="height: 40px; white-space: nowrap;">
                Add Pocket / Bank
              </button>
            </form>
          </div>
        </div>

        <!-- 3. German Tax Classification & Status -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">3. German Tax Classification (§ 19 UStG)</div>
            <span class="badge badge-outline">Compliance</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 700; font-size: 14px;">§ 19 UStG Kleinunternehmer</div>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Exempt from charging 19% VAT up to 25.000 € annual net turnover.</div>
              </div>
              <input type="checkbox" id="setup-is-ku" style="width: 20px; height: 20px; accent-color: var(--text-primary); cursor: pointer;" ${settings.isKleinunternehmer !== false ? 'checked' : ''} />
            </div>

            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 16px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-weight: 700; font-size: 14px;">Freiberufler Status</div>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">Exempt from Gewerbesteuer (Trade Tax) & IHK contributions under § 18 EStG.</div>
              </div>
              <input type="checkbox" id="setup-is-freiberufler" style="width: 20px; height: 20px; accent-color: var(--text-primary); cursor: pointer;" ${settings.isFreiberufler !== false ? 'checked' : ''} />
            </div>
          </div>
        </div>

        <!-- 4. Groq AI Integration -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">4. Groq AI Engine</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Ultra-fast financial reasoning & receipt parsing</div>
            </div>
            <span class="badge ${groqStatus === 'success' ? 'badge-filled' : 'badge-outline'}">
              ${groqStatus === 'success' ? 'Connected' : (groqStatus === 'testing' ? 'Testing...' : 'Ready')}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 14px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Groq API Key</label>
              <input 
                type="password" 
                id="setup-groq-key" 
                class="input text-mono" 
                value="${settings.groqApiKey || ''}" 
                placeholder="gsk_..."
              />
            </div>

            <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: flex-end;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Active Model</label>
                <select id="setup-groq-model" class="select">
                  <option value="llama-3.3-70b-versatile" ${settings.groqModel === 'llama-3.3-70b-versatile' ? 'selected' : ''}>llama-3.3-70b-versatile (Deep Financial Reasoning)</option>
                  <option value="llama-3.1-8b-instant" ${settings.groqModel === 'llama-3.1-8b-instant' ? 'selected' : ''}>llama-3.1-8b-instant (Ultra Fast)</option>
                  <option value="gemma2-9b-it" ${settings.groqModel === 'gemma2-9b-it' ? 'selected' : ''}>gemma2-9b-it (Google Gemma 2)</option>
                </select>
              </div>
              <button class="btn btn-secondary" id="btn-test-groq-setup" style="height: 42px;">
                Test API Key
              </button>
            </div>
          </div>
        </div>

        <!-- 5. Data Management & Backups -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">5. Data Backups & Reset</div>
            <span class="badge badge-outline">IndexedDB Local</span>
          </div>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-export-backup-json">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export JSON Backup
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-reset-sample-data">
              Reload Demo Data
            </button>
            <button class="btn btn-ghost btn-sm" id="btn-wipe-database" style="color: var(--text-muted);">
              Wipe Database
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
