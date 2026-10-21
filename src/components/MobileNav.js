/**
 * SEYA BOOKS - Mobile Bottom Navigation Bar (Pure Black & White with Reflective Accents)
 * 5 Slots: Overview, Brands, Center '+', P&L, Sheets
 */

export function renderMobileNav({ activeTab = 'dashboard' }) {
  return `
    <nav class="mob-nav-bar" id="mobile-nav-bar">
      <!-- 1. Dashboard -->
      <button class="mob-nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        <span>Overview</span>
      </button>

      <!-- 2. Brands under Seya Technologies -->
      <button class="mob-nav-item ${activeTab === 'brands' ? 'active' : ''}" data-tab="brands">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
        <span>Brands</span>
      </button>

      <!-- 3. Center '+' Action Button -->
      <button class="mob-fab-btn" id="fab-plus-btn" title="Quick Add">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <!-- 4. P&L -->
      <button class="mob-nav-item ${activeTab === 'pnl' ? 'active' : ''}" data-tab="pnl">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
        <span>P&L</span>
      </button>

      <!-- 5. Sheets / Setup -->
      <button class="mob-nav-item ${activeTab === 'sheets' || activeTab === 'setup' ? 'active' : ''}" data-tab="sheets">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
        <span>Sheets</span>
      </button>
    </nav>
  `;
}
