/**
 * SEYA BOOKS - AI Receipt & Invoice Scanner Modal (Pure Black & White Monochrome)
 */

export function renderAiScanModal({
  isOpen = false,
  isScanning = false,
  parsedResult = null,
  rawText = ''
}) {
  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="ai-scan-modal">
      <div class="modal-box">
        <div class="modal-head">
          <h3>
            <div class="brand-symbol" style="width: 26px; height: 26px; font-size: 13px;">AI</div>
            <span>AI Receipt & Invoice OCR Scanner</span>
          </h3>
          <button class="btn btn-ghost btn-icon close-modal-btn" data-modal="ai-scan-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Drop Receipt or Paste Invoice Text</label>
            <div id="ai-scan-dropzone" style="border: 2px dashed var(--border-medium); border-radius: var(--radius-sm); padding: 22px; text-align: center; cursor: pointer; margin-bottom: 12px; background: var(--bg-surface);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              <div style="font-size: 13px; font-weight: 700;">Choose receipt photo, PDF, or drag here</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Image, scan, or digital bill</div>
              <input type="file" id="scan-file-input" accept="image/*,application/pdf,text/*" style="display: none;" />
            </div>

            <textarea 
              id="scan-text-input" 
              class="textarea" 
              rows="3" 
              placeholder="Or paste invoice text (e.g. 'Apple Store Kurfürstendamm, Magic Keyboard 149.00 EUR incl 19% VAT')..."
            >${rawText}</textarea>
          </div>

          <div style="text-align: right; margin-bottom: 16px;">
            <button class="btn btn-primary btn-sm" id="btn-run-ai-scan" ${isScanning ? 'disabled' : ''}>
              ${isScanning ? 'Reasoning with Groq AI...' : 'Scan with Groq AI'}
            </button>
          </div>

          ${parsedResult ? `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="badge badge-filled">Groq AI Extraction</span>
                <span class="badge badge-outline">Ready</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; margin-bottom: 12px;">
                <div>Merchant: <strong style="color: var(--text-primary);">${parsedResult.merchant || 'Recognized Vendor'}</strong></div>
                <div>Amount: <strong class="text-mono" style="color: var(--text-primary);">€${Number(parsedResult.grossAmount || 0).toFixed(2)}</strong></div>
                <div>VAT Rate: <strong class="text-mono">${parsedResult.vatRate ?? 19}%</strong></div>
                <div>Date: <strong class="text-mono">${parsedResult.date || 'Today'}</strong></div>
              </div>
              <button class="btn btn-primary btn-sm" id="btn-apply-scan-to-tx" style="width: 100%;">
                Import as Ledger Transaction &rarr;
              </button>
            </div>
          ` : ''}
        </div>

        <div class="modal-foot">
          <button type="button" class="btn btn-secondary btn-sm close-modal-btn" data-modal="ai-scan-modal">Cancel</button>
        </div>
      </div>
    </div>
  `;
}
