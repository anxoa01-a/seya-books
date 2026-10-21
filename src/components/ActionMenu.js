/**
 * SEYA BOOKS - Action Menu Sheet for '+' Button
 * Fast access to Add Income, Add Expense, New Brand, AI Auto-Sheet & AI Scan
 */

export function renderActionMenu() {
  return `
    <div class="sheet-backdrop" id="sheet-backdrop"></div>

    <div class="action-sheet" id="action-sheet">
      <div class="sheet-header-label">Quick Actions</div>

      <div class="sheet-tiles-grid">
        <!-- 1. Add Income -->
        <button class="sheet-tile" id="action-btn-income">
          <div class="sheet-tile-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14"/><path d="m19 12-7-7-7 7"/></svg>
          </div>
          <div class="sheet-tile-text">
            <h4>Add Income</h4>
            <p>Fee or Invoice payment</p>
          </div>
        </button>

        <!-- 2. Add Expense -->
        <button class="sheet-tile" id="action-btn-expense">
          <div class="sheet-tile-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
          </div>
          <div class="sheet-tile-text">
            <h4>Add Expense</h4>
            <p>Deductible write-off</p>
          </div>
        </button>

        <!-- 3. New Brand under Seya Technologies -->
        <button class="sheet-tile" id="action-btn-brand">
          <div class="sheet-tile-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
          </div>
          <div class="sheet-tile-text">
            <h4>New Brand</h4>
            <p>Under Seya Technologies</p>
          </div>
        </button>

        <!-- 4. AI Scan Receipt -->
        <button class="sheet-tile" id="action-btn-scan">
          <div class="sheet-tile-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/><path d="m16 16 1.5 1.5"/></svg>
          </div>
          <div class="sheet-tile-text">
            <h4>AI Scan Beleg</h4>
            <p>Groq OCR parsing</p>
          </div>
        </button>

        <!-- 5. AI Work Session Auto-Sheet (Full span) -->
        <button class="sheet-tile" id="action-btn-ai-sheet" style="grid-column: span 2;">
          <div class="sheet-tile-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <div class="sheet-tile-text">
            <h4>AI Auto-Sheet Generator</h4>
            <p>Paste notes, hours, pay & brand &rarr; auto-generates sheet entry</p>
          </div>
        </button>
      </div>
    </div>
  `;
}
