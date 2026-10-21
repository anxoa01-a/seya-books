/**
 * SEYA BOOKS - AI Financial Copilot Slide-over Drawer (Pure Black & White Monochrome)
 * Powered by Groq AI with real-time financial context awareness
 */

export function renderAiChatDrawer({
  isOpen = false,
  messages = [],
  financialContext = {},
  isThinking = false
}) {
  const formatMarkdown = (content) => {
    if (!content) return '';
    // Format simple markdown into clean HTML
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n- /g, '<br>• ')
      .replace(/\n/g, '<br>');
    return formatted;
  };

  return `
    <div class="ai-drawer-overlay ${isOpen ? 'active' : ''}" id="ai-drawer-overlay"></div>

    <div class="ai-drawer ${isOpen ? 'open' : ''}" id="ai-drawer">
      <!-- Drawer Header -->
      <div class="ai-drawer-header">
        <div class="ai-drawer-title">
          <div class="ai-symbol-badge">AI</div>
          <div>
            <div style="font-weight: 700; font-size: 14.5px; color: var(--text-primary);">Seya Financial AI</div>
            <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">Groq LPU • Live Ledger Memory</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-ghost btn-sm" id="btn-clear-ai-chat" title="Clear Conversation" style="font-size: 11px;">
            Clear
          </button>
          <button class="btn btn-secondary btn-icon" id="close-ai-drawer-btn" style="width: 32px; height: 32px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Real-time Financial Ledger Context Ribbon -->
      <div style="padding: 10px 20px; background: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; font-size: 11px; font-family: var(--font-mono); color: var(--text-secondary);">
        <span>YTD Net: <strong>€${(financialContext.netRevenue || 0).toLocaleString('de-DE')}</strong></span>
        <span>Reserve: <strong>€${(financialContext.taxReserve || 0).toLocaleString('de-DE')}</strong></span>
        <span class="badge badge-outline" style="font-size: 9.5px;">${financialContext.isKleinunternehmer ? '§ 19 UStG' : 'Standard MwSt'}</span>
      </div>

      <!-- Chat History Area -->
      <div class="ai-chat-body" id="ai-messages-area">
        <!-- Quick Action & Intelligence Chips -->
        <div>
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; font-family: var(--font-mono);">
            Agent Actions & Prompts
          </div>
          <div class="ai-prompt-chips">
            <button class="ai-chip quick-prompt-btn" data-prompt="please create a expeense of 20 euro today for google play">
              - €20 Google Play (Today)
            </button>
            <button class="ai-chip quick-prompt-btn" data-prompt="add 1500 euro income from Seya Pay today">
              + €1.5k Seya Pay Income
            </button>
            <button class="ai-chip quick-prompt-btn" data-prompt="log 4 hours for Seya AI on prompt engineering at 150/hr">
              ⏱ Log 4h for Seya AI
            </button>
            <button class="ai-chip quick-prompt-btn" data-prompt="which brand earned the most revenue?">
              📊 Top Brand Revenue
            </button>
            <button class="ai-chip quick-prompt-btn" data-prompt="download tax csv">
              📥 Download Tax CSV
            </button>
            <button class="ai-chip quick-prompt-btn" data-prompt="Am I safely below the German Kleinunternehmer § 19 UStG 25.000 € limit?">
              🛡️ § 19 UStG Limit Check
            </button>
          </div>
        </div>

        ${messages.length === 0 ? `
          <div style="text-align: center; padding: 32px 10px; color: var(--text-muted);">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-xs); border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--text-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px auto;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <h4 style="font-size: 14.5px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Seya Autonomous Copilot Agent</h4>
            <p style="font-size: 12px; max-width: 320px; margin: 0 auto;">Ask any question about your live numbers or command works directly: add income, record expenses, log timesheets, download tax CSVs, and audit tax reserves.</p>
          </div>
        ` : ''}

        ${messages.map((msg, idx) => `
          <div class="ai-msg ${msg.role === 'user' ? 'user' : 'assistant'}">
            ${formatMarkdown(msg.content)}
            ${msg.action ? `
              <div class="agent-action-box">
                <div class="agent-action-head">
                  <span class="agent-action-badge">✓ ACTION EXECUTED</span>
                  <span style="font-weight: 700; font-size: 12px; color: var(--text-primary);">${msg.action.title}</span>
                </div>
                <div class="agent-action-details">${msg.action.details}</div>
              </div>
            ` : ''}
            ${msg.role === 'assistant' ? `
              <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: flex-end;">
                <button class="btn btn-ghost btn-sm copy-msg-btn" data-text="${encodeURIComponent(msg.content)}" style="font-size: 10px; padding: 2px 6px;">
                  Copy
                </button>
              </div>
            ` : ''}
          </div>
        `).join('')}

        ${isThinking ? `
          <div class="ai-msg assistant" style="display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 12px;">
            <span class="badge-dot" style="animation: pulseDot 1s infinite alternate;"></span>
            <span>Reasoning & executing agent actions...</span>
          </div>
        ` : ''}
      </div>

      <!-- Input Bar -->
      <div class="ai-input-wrap">
        <form class="ai-input-form" id="ai-input-form">
          <input 
            type="text" 
            id="ai-user-input" 
            class="input" 
            placeholder="Ask anything or command works (e.g. 'Add €1,500 income from Seya Pay', 'Download tax CSV')..." 
            autocomplete="off" 
            required 
          />
          <button type="submit" class="btn btn-primary" id="btn-send-ai-query">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  `;
}
