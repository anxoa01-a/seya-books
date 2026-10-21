/**
 * Settings & Configuration Modal
 * Profile, Tax Parameters, Groq AI API Key, and Database Backups.
 */

export function renderSettingsModal({
  isOpen = false,
  settings = {},
  groqStatus = 'idle' // 'idle', 'testing', 'success', 'error'
}) {
  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="settings-modal">
      <div class="modal-content" style="max-width: 620px;">
        <div class="modal-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--accent-emerald);"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>App Settings & Tax Configuration</span>
          </h3>
          <button class="icon-btn close-modal-btn" data-modal="settings-modal" style="width: 32px; height: 32px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- 1. Groq AI API Key Section -->
          <div style="background: rgba(6, 182, 212, 0.05); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-size: 13.5px; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; gap: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                <span>Groq AI Integration</span>
              </div>
              <span class="badge ${groqStatus === 'success' ? 'badge-success' : (groqStatus === 'error' ? 'badge-danger' : 'badge-neutral')}">
                ${groqStatus === 'success' ? 'Connected' : (groqStatus === 'testing' ? 'Testing...' : 'Ready')}
              </span>
            </div>
            
            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label">Groq API Key</label>
              <input 
                type="password" 
                id="settings-groq-key" 
                class="input text-mono" 
                value="${settings.groqApiKey || ''}" 
                placeholder="gsk_..."
              />
            </div>

            <div style="display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: flex-end;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">Groq Model</label>
                <select id="settings-groq-model" class="select">
                  <option value="qwen/qwen3.8-27b" ${settings.groqModel === 'qwen/qwen3.8-27b' ? 'selected' : ''}>qwen/qwen3.8-27b (Fast & Precise)</option>
                  <option value="openai/gpt-oss-120b" ${settings.groqModel === 'openai/gpt-oss-120b' ? 'selected' : ''}>openai/gpt-oss-120b (Deep Reasoning)</option>
                  <option value="openai/gpt-oss-20b" ${settings.groqModel === 'openai/gpt-oss-20b' ? 'selected' : ''}>openai/gpt-oss-20b (Ultra Lightweight)</option>
                </select>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-test-groq" style="height: 42px;">
                Test Connection
              </button>
            </div>
          </div>

          <!-- 2. Taxpayer Information -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 10px;">
              Taxpayer & Sole Proprietor Profile
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="settings-owner-name" class="input" value="${settings.ownerName || 'Pritam Maharjan'}" />
              </div>
              <div class="form-group">
                <label class="form-label">Steuernummer (Tax ID)</label>
                <input type="text" id="settings-tax-number" class="input" value="${settings.taxNumber || '14/234/56789'}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Business Title / Trade Description</label>
              <input type="text" id="settings-business-title" class="input" value="${settings.businessTitle || 'Independent Software Consultant'}" />
            </div>
          </div>

          <!-- 3. Backup, Export & Reset -->
          <div>
            <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 10px;">
              Database & Local Storage
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" id="btn-export-backup-json">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Export JSON Backup
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-load-sample-data">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Reload Sample Data
              </button>
              <button class="btn btn-danger btn-sm" id="btn-wipe-data">
                Wipe All Data
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary btn-sm close-modal-btn" data-modal="settings-modal">Close</button>
          <button class="btn btn-primary btn-sm" id="btn-save-settings">Save Settings</button>
        </div>
      </div>
    </div>
  `;
}
