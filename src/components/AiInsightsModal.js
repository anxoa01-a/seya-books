/**
 * SEYA BOOKS - AI Financial Diagnosis & Detailed Audit Modal
 * Comprehensive financial intelligence, tax safety, and brand monetization analysis
 */

export function renderAiInsightsModal({
  isOpen = false,
  auditData = null,
  financialSummary = {},
  isLoading = false
}) {
  const audit = auditData || {
    healthScore: 92,
    verdict: "Strong financial velocity with healthy margin buffer and compliant tax shields.",
    cashflowStatus: "Positive operational runway",
    taxSafetyStatus: "Turnover well buffered within § 19 UStG threshold",
    keyObservations: [
      "Operating expenses shield ~28% of net revenue from taxable income under § 4 Abs. 3 EStG.",
      "Prepayment reserve matches calculated Einkommensteuer & Soli liabilities for 2026.",
      "Brand portfolio billing rates average €125/hr, providing strong unit economics."
    ],
    recommendations: [
      "Purchase planned hardware (GWG under €800 net) before Dec 31 to fully deduct in 2026.",
      "Accelerate unbilled brand invoices to maintain sub-14-day cash collection cycles.",
      "Maintain segregation: keep tax allocations strictly in the designated Tax Reserve account."
    ]
  };

  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="ai-insights-modal">
      <div class="modal-box" style="max-width: 680px;">
        <div class="modal-head">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="brand-symbol" style="width: 28px; height: 28px; font-size: 14px;">AI</div>
            <div>
              <h3 style="font-size: 16px; margin: 0;">Comprehensive Financial Health Audit</h3>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                Algorithmic Diagnosis by Seya Groq Copilot
              </div>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon close-modal-btn" data-modal="ai-insights-modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-body" style="padding: 22px;">
          <!-- Score & Verdict Ribbon -->
          <div class="card" style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border: 1px solid var(--border-medium);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div>
                <span class="badge badge-reflective" style="font-size: 10.5px; margin-bottom: 6px;">Executive Diagnosis</span>
                <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-top: 4px;">
                  ${audit.verdict}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Financial Health</div>
                <div style="font-size: 32px; font-weight: 800; font-family: var(--font-mono); color: var(--text-primary); letter-spacing: -0.04em;">
                  ${audit.healthScore}<span style="font-size: 16px; color: var(--text-muted);">/100</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3 Diagnostic Pillars -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--radius-sm);">
              <div style="font-size: 10.5px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Cashflow Status</div>
              <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">
                ${audit.cashflowStatus}
              </div>
            </div>

            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--radius-sm);">
              <div style="font-size: 10.5px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">§ 19 UStG Safety</div>
              <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">
                ${audit.taxSafetyStatus}
              </div>
            </div>

            <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 14px; border-radius: var(--radius-sm);">
              <div style="font-size: 10.5px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Tax Reserve Ratio</div>
              <div style="font-size: 13.5px; font-weight: 700; color: var(--text-primary); margin-top: 4px;">
                Fully Allocated
              </div>
            </div>
          </div>

          <!-- Key Diagnostic Observations -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">
              Key Financial Observations
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${audit.keyObservations.map(obs => `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: var(--radius-xs); display: flex; align-items: flex-start; gap: 10px; font-size: 12.5px;">
                  <span class="badge-dot" style="margin-top: 6px; flex-shrink: 0;"></span>
                  <span>${obs}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Actionable Optimization Steps -->
          <div>
            <div style="font-size: 11px; font-weight: 700; font-family: var(--font-mono); text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">
              Actionable Recommendations
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${audit.recommendations.map(rec => `
                <div style="background: var(--bg-subtle); border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: var(--radius-xs); display: flex; align-items: flex-start; gap: 10px; font-size: 12.5px;">
                  <span style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary); flex-shrink: 0;">&rarr;</span>
                  <span>${rec}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="modal-foot" style="justify-content: space-between;">
          <button class="btn btn-secondary btn-sm" id="btn-rerun-ai-audit" ${isLoading ? 'disabled' : ''}>
            ${isLoading ? 'Analyzing...' : 'Re-Run Live Audit'}
          </button>
          <button class="btn btn-primary btn-sm close-modal-btn" data-modal="ai-insights-modal">
            Close Audit
          </button>
        </div>
      </div>
    </div>
  `;
}
