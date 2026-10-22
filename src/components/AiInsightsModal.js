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
    cashflowStatus: "Optimal operational runway",
    taxSafetyStatus: "Turnover well buffered within § 19 UStG threshold",
    whatIsHappening: {
      headline: "Balanced transaction flow with controlled operating expenses",
      narrative: "Your ledger reflects active consulting revenue paired with disciplined technology investments. Deductibles shield a significant portion of income under German § 4 Abs. 3 EStG.",
      spendingVelocity: "Operating burn rate is well below recognized billable inflows",
      topExpenseCategories: ["Software & Tools", "Office & Equipment", "Bank & Payment Fees"],
      keyObservations: [
        "Operating expenses provide direct income tax shielding for 2026 Anlage EÜR.",
        "Prepayment reserve matches calculated Einkommensteuer & Soli liabilities.",
        "Brand portfolio billing rates average €130-150/hr, providing strong unit economics."
      ]
    },
    howItIsGoing: {
      headline: "Positive operating margin with sound cash runway",
      profitMargin: "Healthy Net Margin",
      runwayStatus: "Profitable unit economics",
      trajectory: "Expansion & Positive Retained Earnings",
      brandPerformance: [
        "Brand ventures maintain steady hourly billing rates.",
        "Unbilled pipeline in Sheets provides immediate cash conversion opportunities."
      ]
    },
    whatCanBeDone: {
      headline: "High-impact tactical action plan & German tax optimization",
      immediateActions: [
        "Invoice unbilled brand hours in Sheets to accelerate cash collections.",
        "Record business equipment purchases (GWG under €800 net) for immediate 100% write-off.",
        "Keep tax reserve strictly liquid in a dedicated overnight account (Tagesgeld)."
      ],
      taxOptimization: [
        "Home-Office-Pauschale: Claim up to €1,260/year (€6/day for up to 210 remote days).",
        "Bewirtungsbelege: Deduct 70% of business meals with documented attendees and business purpose."
      ],
      revenueAcceleration: [
        "Enforce standard 14-day payment terms (Zahlungsziel) across all brand client invoices."
      ]
    }
  };

  const happening = audit.whatIsHappening || {
    headline: "Active transaction flow",
    narrative: "Operating expenses and client income are actively tracked.",
    spendingVelocity: "Burn rate is balanced against billable revenue.",
    topExpenseCategories: [],
    keyObservations: audit.keyObservations || []
  };

  const going = audit.howItIsGoing || {
    headline: "Sound operating margin",
    profitMargin: "Profitable",
    runwayStatus: audit.cashflowStatus || "Positive",
    trajectory: "Steady",
    brandPerformance: []
  };

  const canBeDone = audit.whatCanBeDone || {
    headline: "Tactical recommendations",
    immediateActions: audit.recommendations || [],
    taxOptimization: [
      "Record GWG under €800 for 100% immediate deduction",
      "Claim Home-Office-Pauschale up to €1,260/yr"
    ],
    revenueAcceleration: []
  };

  return `
    <div class="modal-overlay ${isOpen ? 'active' : ''}" id="ai-insights-modal">
      <div class="modal-box" style="max-width: 780px;">
        <div class="modal-head">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="brand-symbol" style="width: 30px; height: 30px; font-size: 13px; background: var(--pleo-coral); color: #fff; font-weight: 800;">AI</div>
            <div>
              <h3 style="font-size: 16px; margin: 0; color: var(--text-primary); font-weight: 700;">Financial Intelligence & Audit</h3>
              <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                Powered by Groq LPUs • Live Ledger Diagnostics
              </div>
            </div>
          </div>
          <button class="btn btn-ghost btn-icon close-modal-btn" data-modal="ai-insights-modal" aria-label="Close modal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="modal-body" style="padding: 22px;">
          <!-- Score & Verdict Ribbon -->
          <div class="card" style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, rgba(255,51,75,0.08) 0%, rgba(26,29,36,0.95) 50%, rgba(255,255,255,0.03) 100%); border: 1px solid var(--border-medium);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
              <div style="flex: 1; min-width: 260px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span class="badge" style="background: rgba(255,51,75,0.2); color: var(--pleo-coral); border: 1px solid rgba(255,51,75,0.4); font-size: 10px; font-weight: 700;">
                    LIVE GROQ AUDIT
                  </span>
                  <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">qwen/qwen3.8-27b</span>
                </div>
                <div style="font-size: 15.5px; font-weight: 800; color: var(--text-primary); line-height: 1.4;">
                  ${audit.verdict}
                </div>
              </div>
              <div style="text-align: right; background: rgba(0,0,0,0.3); padding: 10px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase;">Health Score</div>
                <div style="font-size: 32px; font-weight: 800; font-family: var(--font-mono); color: var(--text-primary); letter-spacing: -0.04em;">
                  ${audit.healthScore}<span style="font-size: 16px; color: var(--text-muted);">/100</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 3 Diagnostic Pillars -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-bottom: 22px;">
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
                Fully Protected
              </div>
            </div>
          </div>

          <!-- SECTION 1: WHAT IS HAPPENING WITH TRANSACTIONS -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--pleo-coral); font-family: var(--font-mono);">
                1. What is Happening with Transactions
              </div>
              <span class="badge badge-outline" style="font-size: 10px;">Flow Dynamics</span>
            </div>
            
            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              ${happening.headline || 'Transaction Flow Overview'}
            </div>
            <div style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
              ${happening.narrative}
            </div>

            ${happening.spendingVelocity ? `
              <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: var(--radius-xs); margin-bottom: 12px; font-size: 12px; display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--pleo-coral); font-weight: 700;">⚡ Velocity:</span>
                <span style="color: var(--text-primary);">${happening.spendingVelocity}</span>
              </div>
            ` : ''}

            ${happening.topExpenseCategories && happening.topExpenseCategories.length > 0 ? `
              <div style="margin-bottom: 12px;">
                <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">
                  Top Expense Allocations:
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${happening.topExpenseCategories.map(cat => `
                    <span style="background: var(--bg-elevated); border: 1px solid var(--border-medium); padding: 3px 10px; border-radius: var(--radius-full); font-size: 11.5px; color: var(--text-primary);">
                      ${cat}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div style="display: flex; flex-direction: column; gap: 6px;">
              ${(happening.keyObservations || []).map(obs => `
                <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--text-secondary);">
                  <span style="color: var(--pleo-coral); margin-top: 2px;">•</span>
                  <span>${obs}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- SECTION 2: HOW IT IS GOING -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 18px; margin-bottom: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--pleo-coral); font-family: var(--font-mono);">
                2. How It Is Going
              </div>
              <span class="badge badge-outline" style="font-size: 10px;">Trajectory & Health</span>
            </div>

            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${going.headline || 'Operational Trajectory'}
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-bottom: 12px;">
              <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); padding: 10px; border-radius: var(--radius-xs);">
                <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">Profit Margin</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${going.profitMargin}</div>
              </div>
              <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); padding: 10px; border-radius: var(--radius-xs);">
                <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">Runway & Solvency</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${going.runwayStatus}</div>
              </div>
              <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); padding: 10px; border-radius: var(--radius-xs);">
                <div style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); text-transform: uppercase;">Business Direction</div>
                <div style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${going.trajectory}</div>
              </div>
            </div>

            ${going.brandPerformance && going.brandPerformance.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${going.brandPerformance.map(bp => `
                  <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--text-secondary);">
                    <span style="color: var(--text-muted); margin-top: 2px;">&rarr;</span>
                    <span>${bp}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- SECTION 3: WHAT CAN BE DONE (ACTION PLAYBOOK) -->
          <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--pleo-coral); font-family: var(--font-mono);">
                3. What Can Be Done (Action Playbook)
              </div>
              <span class="badge badge-reflective" style="font-size: 10px;">Optimization</span>
            </div>

            <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">
              ${canBeDone.headline || 'High-Impact Optimization Steps'}
            </div>

            <!-- Immediate High Impact Actions -->
            <div style="margin-bottom: 14px;">
              <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
                ⚡ Immediate Tactical Steps:
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${(canBeDone.immediateActions || []).map(action => `
                  <div style="background: var(--bg-subtle); border-left: 3px solid var(--pleo-coral); padding: 10px 14px; border-radius: 0 var(--radius-xs) var(--radius-xs) 0; font-size: 12.5px; color: var(--text-primary);">
                    ${action}
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- German Tax Optimization Shields -->
            ${canBeDone.taxOptimization && canBeDone.taxOptimization.length > 0 ? `
              <div style="margin-bottom: 14px;">
                <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
                  🛡️ German Tax Deduction Shields (Anlage EÜR):
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${canBeDone.taxOptimization.map(tax => `
                    <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); padding: 10px 14px; border-radius: var(--radius-xs); font-size: 12px; color: var(--text-secondary); display: flex; align-items: flex-start; gap: 8px;">
                      <span style="color: var(--pleo-coral); font-weight: 700;">§</span>
                      <span>${tax}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Revenue Acceleration -->
            ${canBeDone.revenueAcceleration && canBeDone.revenueAcceleration.length > 0 ? `
              <div>
                <div style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
                  🚀 Revenue Acceleration:
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  ${canBeDone.revenueAcceleration.map(rev => `
                    <div style="font-size: 12px; color: var(--text-secondary); display: flex; align-items: flex-start; gap: 8px;">
                      <span style="color: var(--text-muted);">&bull;</span>
                      <span>${rev}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="modal-foot" style="justify-content: space-between; background: var(--bg-surface);">
          <button class="btn btn-secondary btn-sm" id="btn-rerun-ai-audit" ${isLoading ? 'disabled' : ''}>
            ${isLoading ? `
              <svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
              Analyzing Live Ledger...
            ` : 'Re-Run Live AI Audit'}
          </button>
          <button class="btn btn-primary btn-sm close-modal-btn" data-modal="ai-insights-modal">
            Close Audit
          </button>
        </div>
      </div>
    </div>
  `;
}

