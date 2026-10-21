/**
 * Files Vault View
 * Local, secure, client-side document storage in IndexedDB for invoices,
 * receipts, contracts, and tax assessment notices.
 */

export function renderFilesVaultView({
  files = [],
  activeFilter = 'all'
}) {
  const filteredFiles = files.filter(f => {
    if (activeFilter === 'all') return true;
    return f.type?.toLowerCase() === activeFilter.toLowerCase();
  });

  return `
    <div class="animate-fade-in">
      <!-- Section Header -->
      <div class="section-head">
        <div>
          <h2>
            <span>Files & Document Vault</span>
            <span class="badge badge-neutral">${files.length} Stored Documents</span>
          </h2>
          <div class="section-subtitle">Secure, local-first storage for business receipts, contracts, and tax notices</div>
        </div>
        <div>
          <label class="btn btn-primary btn-sm" style="cursor: pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            <span>Upload Document</span>
            <input type="file" id="vault-file-input" style="display: none;" multiple />
          </label>
        </div>
      </div>

      <!-- Drag & Drop Upload Zone -->
      <div class="glass-card" id="vault-dropzone" style="border: 2px dashed var(--border-medium); text-align: center; padding: 28px 20px; margin-bottom: 20px; cursor: pointer; transition: all var(--transition-fast);">
        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px auto;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
        </div>
        <h4 style="font-size: 14.5px; font-weight: 600; margin-bottom: 4px;">Drag and drop receipts or contracts here</h4>
        <p style="font-size: 12px; color: var(--text-muted);">PDF, PNG, JPG, or scans • Saved privately into your device's IndexedDB</p>
      </div>

      <!-- Document Type Filter Pills -->
      <div style="display: flex; gap: 8px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 4px;">
        <button class="btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm filter-vault-btn" data-filter="all">All Documents</button>
        <button class="btn ${activeFilter === 'receipt' ? 'btn-primary' : 'btn-secondary'} btn-sm filter-vault-btn" data-filter="receipt">Receipts (Belege)</button>
        <button class="btn ${activeFilter === 'invoice' ? 'btn-primary' : 'btn-secondary'} btn-sm filter-vault-btn" data-filter="invoice">Invoices</button>
        <button class="btn ${activeFilter === 'contract' ? 'btn-primary' : 'btn-secondary'} btn-sm filter-vault-btn" data-filter="contract">Contracts</button>
        <button class="btn ${activeFilter === 'tax document' ? 'btn-primary' : 'btn-secondary'} btn-sm filter-vault-btn" data-filter="tax document">Tax Notices</button>
      </div>

      <!-- Files Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        ${filteredFiles.length > 0 ? filteredFiles.map(file => `
          <div class="glass-card" style="padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px;">
                <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span class="badge badge-neutral" style="font-size: 10px;">${file.type || 'Document'}</span>
              </div>
              <h4 style="font-size: 13.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px; word-break: break-all;">
                ${file.name}
              </h4>
              <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 10px;">
                ${file.notes || 'Business documentation archive'}
              </p>
              <div style="font-size: 11px; color: var(--text-dim); display: flex; gap: 8px;">
                <span>${file.uploadDate}</span>
                <span>•</span>
                <span>${Math.round((file.size || 0) / 1024)} KB</span>
              </div>
            </div>

            <div style="display: flex; gap: 6px; margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-subtle);">
              <button class="btn btn-secondary btn-sm vault-download-btn" data-id="${file.id}" style="flex: 1; font-size: 11.5px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                Download
              </button>
              <button class="btn btn-danger btn-sm vault-delete-btn" data-id="${file.id}" title="Delete" style="padding: 6px 10px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
              </button>
            </div>
          </div>
        `).join('') : `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
            <p style="color: var(--text-muted); font-size: 13px;">No documents found in this filter.</p>
          </div>
        `}
      </div>
    </div>
  `;
}
