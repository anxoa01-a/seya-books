/**
 * SEYA BOOKS - Financial Copilot Agent Engine (Plain Black & White)
 * Understands natural user commands with deep NLP entity extraction.
 * Examples:
 * - "please create a expeense of 20 euro today for google play" -> Item: "Google Play", €20.00, today, Category: Software & Tools
 * - "add 1500 euro income from Seya Pay today" -> Item: "Seya Pay", €1,500.00, today, Category: Client Services
 * - "download tax csv" -> Downloads clean CSV
 * - "which brand earned the most?" -> Dynamic portfolio breakdown
 */

export class SeyaFinancialAgent {
  constructor(groqService) {
    this.groqService = groqService;
  }

  /**
   * Main entry point for user prompts
   */
  async processUserPrompt(promptText, appState, appActions) {
    const trimmed = (promptText || '').trim();
    if (!trimmed) {
      return {
        response: 'Hi! I am your Seya Financial Copilot. You can ask me questions about your ledger or give me commands like: \n\n• *"Please create an expense of 20 euro today for Google Play"*\n• *"Add €1,500 income from Seya Pay"*\n• *"Log 4 hours for Seya AI at 150/hr"*\n• *"Which brand earned the most?"*\n• *"Download tax CSV"*',
        actionExecuted: null
      };
    }

    // 1. Try local deterministic agent intent parser first
    const localResult = this.evaluateLocalIntent(trimmed, appState, appActions);
    if (localResult && localResult.handled) {
      return {
        response: localResult.response,
        actionExecuted: localResult.actionExecuted || null
      };
    }

    // 2. If Groq API key is present, attempt LLM reasoning with full ledger context
    if (this.groqService && this.groqService.apiKey) {
      try {
        const llmResult = await this.askGroqWithContext(trimmed, appState);
        if (llmResult) {
          return {
            response: llmResult,
            actionExecuted: null
          };
        }
      } catch (err) {
        console.warn('Groq advisory fallback to local agent:', err);
      }
    }

    // 3. Fallback to conversational local intelligence engine
    return this.generateDynamicAdvisory(trimmed, appState);
  }

  /**
   * Evaluates if prompt is an action command or specific app-data query
   */
  evaluateLocalIntent(prompt, appState, appActions) {
    const p = prompt.toLowerCase();
    const { transactions = [], brands = [], timesheets = [], banks = [], euerSummary, taxAssessment, settings } = appState;
    const totals = euerSummary?.totals || {};

    // -------------------------------------------------------------------------
    // ACTION 1: EXPORT / DOWNLOAD TAX CSV
    // -------------------------------------------------------------------------
    if (
      p.includes('csv') || (p.includes('download') && (p.includes('tax') || p.includes('transaction'))) ||
      (p.includes('export') && (p.includes('tax') || p.includes('transaction')))
    ) {
      if (appActions.exportTaxCsv) {
        appActions.exportTaxCsv();
      }
      return {
        handled: true,
        response: `I've generated and downloaded your clean **Tax Transactions CSV** (\`seya-technologies-tax-transactions-2026.csv\`) with all ${transactions.length} records formatted for German tax filing and Anlage EÜR.`,
        actionExecuted: {
          type: 'export_csv',
          title: 'Exported Clean Tax CSV',
          details: `${transactions.length} entries exported to seya-technologies-tax-transactions-2026.csv`
        }
      };
    }

    // -------------------------------------------------------------------------
    // ACTION 2: NAVIGATION (Switch Tabs)
    // -------------------------------------------------------------------------
    if (
      p.startsWith('go to ') || p.startsWith('open ') || p.startsWith('show ') ||
      p.startsWith('view ') || p.startsWith('switch to ')
    ) {
      let targetTab = null;
      let tabName = '';

      if (p.includes('brand')) { targetTab = 'brands'; tabName = 'Brands'; }
      else if (p.includes('pnl') || p.includes('profit') || p.includes('loss') || p.includes('eür') || p.includes('euer')) { targetTab = 'pnl'; tabName = 'Profit & Loss (P&L)'; }
      else if (p.includes('sheet') || p.includes('time') || p.includes('hour')) { targetTab = 'sheets'; tabName = 'Sheets & Timesheets'; }
      else if (p.includes('dash') || p.includes('overview') || p.includes('home')) { targetTab = 'dashboard'; tabName = 'Dashboard'; }
      else if (p.includes('setting') || p.includes('setup') || p.includes('bank') || p.includes('pocket')) { targetTab = 'setup'; tabName = 'Setup & Banks'; }

      if (targetTab && appActions.switchTab) {
        appActions.switchTab(targetTab);
        return {
          handled: true,
          response: `I've opened the **${tabName}** view for you.`,
          actionExecuted: {
            type: 'navigate',
            title: `Navigated to ${tabName}`,
            details: `Active view switched to #${targetTab}`
          }
        };
      }
    }

    // -------------------------------------------------------------------------
    // ACTION 3: ADD EXPENSE (e.g. "please create a expeense of 20 euro today for google play")
    // -------------------------------------------------------------------------
    const isExpenseIntent = 
      p.includes('expense') || p.includes('expeense') || p.includes('ausgabe') ||
      p.includes('spent') || p.includes('bought') || p.includes('paid for') ||
      (p.startsWith('-') && this.extractAmount(prompt) > 0);

    if (isExpenseIntent) {
      const amount = this.extractAmount(prompt);
      if (amount > 0) {
        const date = this.extractDate(prompt);
        const entityName = this.extractEntityName(prompt, 'expense') || 'Operating Expense';
        const catInfo = this.categorizeExpense(entityName);
        const defaultBank = banks[0] || { id: 'bank_n26', name: 'N26 Business Account' };

        const newTx = {
          id: 'tx_' + Date.now(),
          type: 'expense',
          date,
          amount,
          vatRate: 19,
          category: catInfo.categoryId,
          categoryName: catInfo.label,
          bankId: defaultBank.id,
          bankName: defaultBank.name,
          description: entityName,
          taxDeductiblePercent: catInfo.taxDeductiblePercent
        };

        if (appActions.addTransaction) {
          appActions.addTransaction(newTx);
        }

        return {
          handled: true,
          response: `Done! I've recorded the expense of **€${amount.toFixed(2)}** for **${entityName}** under **${catInfo.label}** on ${date === new Date().toISOString().split('T')[0] ? 'today' : date}.`,
          actionExecuted: {
            type: 'add_expense',
            title: `Expense Added: ${entityName}`,
            details: `€${amount.toFixed(2)} • ${catInfo.label} • ${date} • ${defaultBank.name}`
          }
        };
      }
    }

    // -------------------------------------------------------------------------
    // ACTION 4: ADD INCOME (e.g. "add 1500 euro income from seya pay today")
    // -------------------------------------------------------------------------
    const isIncomeIntent = 
      p.includes('income') || p.includes('einnahme') || p.includes('revenue') ||
      p.includes('payment') || p.includes('paid by') || p.includes('received') ||
      (p.startsWith('+') && this.extractAmount(prompt) > 0);

    if (isIncomeIntent) {
      const amount = this.extractAmount(prompt);
      if (amount > 0) {
        const date = this.extractDate(prompt);
        const matchedBrand = this.findMatchingBrand(prompt, brands);
        const brandName = matchedBrand ? matchedBrand.name : (this.extractEntityName(prompt, 'income') || (brands[0]?.name || 'Seya Pay'));
        const brandId = matchedBrand ? matchedBrand.id : (brands[0]?.id || 'brand_seya_pay');
        const defaultBank = banks[0] || { id: 'bank_n26', name: 'N26 Business Account' };

        const newTx = {
          id: 'tx_' + Date.now(),
          type: 'income',
          date,
          amount,
          vatRate: settings?.isKleinunternehmer ? 0 : 19,
          category: 'cat_client_services',
          categoryName: 'Client Services',
          bankId: defaultBank.id,
          bankName: defaultBank.name,
          clientId: brandId,
          clientName: brandName,
          businessName: brandName,
          description: `Revenue: ${brandName}`,
          taxDeductiblePercent: 100
        };

        if (appActions.addTransaction) {
          appActions.addTransaction(newTx);
        }

        const newGrossRev = (totals.totalIncomeNet || 0) + amount;
        return {
          handled: true,
          response: `Recorded! Added **€${amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}** income attributed to **${brandName}**. Your updated YTD net revenue is now **€${newGrossRev.toLocaleString('de-DE', { minimumFractionDigits: 2 })}**.`,
          actionExecuted: {
            type: 'add_income',
            title: `Income Added: ${brandName}`,
            details: `€${amount.toFixed(2)} • Client Services • ${date} • ${defaultBank.name}`
          }
        };
      }
    }

    // -------------------------------------------------------------------------
    // ACTION 5: LOG WORK SESSION / TIMESHEET
    // -------------------------------------------------------------------------
    if (
      (p.includes('log') && (p.includes('hour') || p.includes('hr') || p.includes('time') || p.includes('session'))) ||
      (p.includes('worked') && (p.includes('hour') || p.includes('hr')))
    ) {
      const hours = this.extractHours(prompt);
      if (hours > 0) {
        const matchedBrand = this.findMatchingBrand(prompt, brands);
        const brandName = matchedBrand ? matchedBrand.name : (brands[0]?.name || 'Seya Pay');
        const rate = this.extractRate(prompt) || (matchedBrand?.hourlyRate || 130);
        const date = this.extractDate(prompt);
        const scope = this.extractWorkScope(prompt) || 'Sprint Engineering & Advisory';

        const newTs = {
          id: 'ts_' + Date.now(),
          businessName: brandName,
          clientName: brandName,
          date,
          hours,
          hourlyRate: rate,
          project: scope,
          notes: `Logged via Copilot Agent on ${new Date().toLocaleDateString('de-DE')}`,
          invoiced: false
        };

        if (appActions.addTimesheet) {
          appActions.addTimesheet(newTs);
        }

        const totalEarned = hours * rate;
        return {
          handled: true,
          response: `Logged **${hours} hours** for **${brandName}** (€${totalEarned.toFixed(2)} value at €${rate}/hr) for *${scope}*. It is now ready to bill in Sheets.`,
          actionExecuted: {
            type: 'log_timesheet',
            title: `Logged ${hours}h for ${brandName}`,
            details: `Value: €${totalEarned.toFixed(2)} • Ready to invoice`
          }
        };
      }
    }

    // -------------------------------------------------------------------------
    // ACTION 6: CREATE BRAND
    // -------------------------------------------------------------------------
    if (p.includes('create brand') || p.includes('add brand') || p.includes('new brand') || p.includes('add venture')) {
      const brandName = this.extractBrandName(prompt) || 'Seya Venture';
      const newBrand = {
        id: 'brand_' + Date.now(),
        name: brandName,
        company: `Seya Technologies - ${brandName}`,
        contactPerson: 'Pritam Maharjan',
        email: `${brandName.toLowerCase().replace(/\s+/g, '')}@seyatechnologies.com`,
        paymentTerms: '14 Days',
        projects: ['Software & Engineering'],
        hourlyRate: 130
      };

      if (appActions.createBrand) {
        appActions.createBrand(newBrand);
      }

      return {
        handled: true,
        response: `Created brand **${brandName}** under Seya Technologies. You can now tag transactions, timesheets, and invoices directly to it.`,
        actionExecuted: {
          type: 'create_brand',
          title: `Created Brand "${brandName}"`,
          details: `Registered under Seya Technologies`
        }
      };
    }

    // -------------------------------------------------------------------------
    // FINANCIAL QUERY INTENTS (Specific app data with live calculations)
    // -------------------------------------------------------------------------

    // A. Brand Earnings
    if (
      (p.includes('brand') && (p.includes('earn') || p.includes('most') || p.includes('revenue') || p.includes('top') || p.includes('list') || p.includes('best'))) ||
      p.includes('which brand') || p.includes('top brand')
    ) {
      return {
        handled: true,
        response: this.generateBrandsReport(brands, transactions, timesheets),
        actionExecuted: null
      };
    }

    // B. Net Profit & P&L
    if (
      p.includes('profit') || p.includes('p&l') || p.includes('pnl') || p.includes('net income') ||
      p.includes('how much did i make') || p.includes('margin')
    ) {
      return {
        handled: true,
        response: this.generateProfitReport(totals, taxAssessment),
        actionExecuted: null
      };
    }

    // C. Kleinunternehmer § 19 UStG Limit
    if (
      p.includes('19') || p.includes('kleinunternehmer') || p.includes('threshold') ||
      p.includes('limit') || p.includes('vat exempt') || p.includes('ust')
    ) {
      return {
        handled: true,
        response: this.generateKuReport(totals.totalIncomeNet || 0, settings),
        actionExecuted: null
      };
    }

    // D. Tax Reserve & Prepayments
    if (
      p.includes('tax reserve') || p.includes('reserve') || p.includes('set aside') ||
      p.includes('vorauszahlung') || p.includes('steuerrücklage') || p.includes('finanzamt')
    ) {
      return {
        handled: true,
        response: this.generateTaxReserveReport(taxAssessment, totals),
        actionExecuted: null
      };
    }

    // E. Tax Deadlines
    if (p.includes('deadline') || p.includes('calendar') || p.includes('due') || p.includes('dates') || p.includes('frist')) {
      return {
        handled: true,
        response: this.generateTaxCalendarReport(),
        actionExecuted: null
      };
    }

    // F. Expenses Breakdown
    if (p.includes('expense') || p.includes('spending') || p.includes('where is my money') || p.includes('breakdown')) {
      return {
        handled: true,
        response: this.generateExpenseBreakdownReport(transactions, totals),
        actionExecuted: null
      };
    }

    return { handled: false };
  }

  // ---------------------------------------------------------------------------
  // NLP EXTRACTION UTILITIES
  // ---------------------------------------------------------------------------

  /** Extracts amount from strings like '20 euro', '€20', '20.50', '20,00' */
  extractAmount(text) {
    // Look for numbers near currency indicators or standalone numbers in command
    const match = text.match(/(?:€|\$|EUR)?\s*(\d+(?:[.,]\d{1,2})?)\s*(?:€|\$|EUR|euro|euros)?/i);
    if (!match) return 0;
    const num = parseFloat(match[1].replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }

  /** Extracts date like 'today', 'yesterday', 'tomorrow', or explicit YYYY-MM-DD */
  extractDate(text) {
    const lower = text.toLowerCase();
    const today = new Date();

    if (lower.includes('yesterday')) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }
    if (lower.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    const isoMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (isoMatch) return isoMatch[1];

    return today.toISOString().split('T')[0];
  }

  /**
   * Intelligently extracts the clean counterparty / entity name (e.g. "Google Play", "AWS", "Figma")
   * Input: "please create a expeense of 20 euro today for google play" -> Output: "Google Play"
   */
  extractEntityName(text, type = 'expense') {
    // Check if there is an explicit target after "for", "from", "at", "to", "on"
    const targetMatch = text.match(/(?:for|from|at|to)\s+([^.,;!?\n]+)/i);
    let rawTarget = targetMatch ? targetMatch[1].trim() : '';

    // If no "for ...", remove known boilerplate words
    if (!rawTarget) {
      rawTarget = text
        .replace(/please|can you|could you|kindly/gi, '')
        .replace(/create|make|record|add|track|log/gi, '')
        .replace(/\b(?:an?|the|new|of)\b/gi, '')
        .replace(/expense|expeense|ausgabe|income|einnahme|payment|transaction/gi, '')
        .replace(/(?:€|\$|EUR)?\s*\d+(?:[.,]\d{1,2})?\s*(?:€|\$|EUR|euro|euros)?/gi, '')
        .replace(/\b(?:today|yesterday|tomorrow)\b/gi, '')
        .replace(/\b(?:for|from|at|to|on)\b/gi, '')
        .trim();
    } else {
      // Clean trailing words like "today", "yesterday", "euro" from captured target
      rawTarget = rawTarget
        .replace(/\b(?:today|yesterday|tomorrow)\b/gi, '')
        .replace(/\b(?:euro|eur|euros|€)\b/gi, '')
        .replace(/(?:€|\$|EUR)?\s*\d+(?:[.,]\d{1,2})?\s*(?:€|\$|EUR|euro|euros)?/gi, '')
        .trim();
    }

    if (!rawTarget) return type === 'expense' ? 'General Expense' : 'General Income';

    // Format Title Case (e.g. "google play" -> "Google Play")
    return rawTarget
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  extractHours(text) {
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?|stunden?)/i);
    if (match) return parseFloat(match[1]);
    const numMatch = text.match(/\b(\d+(?:\.\d+)?)\b/);
    return numMatch ? parseFloat(numMatch[1]) : 0;
  }

  extractRate(text) {
    const match = text.match(/(?:at|@|rate)?\s*(\d+)\s*(?:\/h|\/hr|€\/h|per hour)/i);
    return match ? parseFloat(match[1]) : 0;
  }

  extractBrandName(text) {
    const nameMatch = text.match(/(?:brand|venture)\s+["']?([^"',]+?)["']?(?:\s+with|\s+for|\s+at|$)/i);
    return nameMatch ? nameMatch[1].trim() : '';
  }

  extractWorkScope(text) {
    const match = text.match(/(?:on|for)\s+([^.,;!?\n]+?)(?:\s+at|\s+at\s+\d+|$)/i);
    return match ? match[1].trim() : 'Software Engineering & Advisory';
  }

  findMatchingBrand(text, brands = []) {
    const lower = text.toLowerCase();
    for (const b of brands) {
      if (lower.includes(b.name.toLowerCase())) return b;
    }
    for (const b of brands) {
      const parts = b.name.toLowerCase().split(/\s+/);
      for (const p of parts) {
        if (p.length > 2 && lower.includes(p)) return b;
      }
    }
    return null;
  }

  categorizeExpense(entityName) {
    const lower = entityName.toLowerCase();
    if (lower.match(/google play|app store|figma|aws|github|chatgpt|openai|anthropic|groq|cursor|jetbrains|adobe|cloud|hosting|domain|software|saas|subscription|apple developer/)) {
      return { categoryId: 'cat_software_tools', label: 'Software & Tools', taxDeductiblePercent: 100 };
    }
    if (lower.match(/dell|macbook|apple|monitor|keyboard|mouse|laptop|hardware|screen|computer/)) {
      return { categoryId: 'cat_equipment', label: 'Equipment & Hardware', taxDeductiblePercent: 100 };
    }
    if (lower.match(/office|rent|desk|coworking|wework|telekom|vodafone|internet|fiber|phone|mobile/)) {
      return { categoryId: 'cat_office', label: 'Office & Workspace', taxDeductiblePercent: 100 };
    }
    if (lower.match(/uber|taxi|ice|db|deutsche bahn|train|flight|hotel|travel|ticket/)) {
      return { categoryId: 'cat_travel', label: 'Travel & Transport', taxDeductiblePercent: 100 };
    }
    if (lower.match(/dinner|lunch|coffee|meal|restaurant|cafe|food/)) {
      return { categoryId: 'cat_meals', label: 'Meals & Dining', taxDeductiblePercent: 70 };
    }
    if (lower.match(/stripe|n26|paypal|bank|fee|charge/)) {
      return { categoryId: 'cat_bank_fees', label: 'Bank & Payment Fees', taxDeductiblePercent: 100 };
    }
    if (lower.match(/tax|steuerberater|lawyer|notary|advisory|consulting/)) {
      return { categoryId: 'cat_legal_accounting', label: 'Legal & Accounting', taxDeductiblePercent: 100 };
    }
    if (lower.match(/ad|marketing|google ads|meta ads|linkedin/)) {
      return { categoryId: 'cat_marketing', label: 'Marketing & Ads', taxDeductiblePercent: 100 };
    }
    return { categoryId: 'cat_other_expense', label: 'Other Operating Expense', taxDeductiblePercent: 100 };
  }

  // ---------------------------------------------------------------------------
  // FINANCIAL REPORTS (Dynamic Live Calculations)
  // ---------------------------------------------------------------------------

  generateBrandsReport(brands = [], transactions = [], timesheets = []) {
    const brandStats = brands.map(b => {
      const brandTx = transactions.filter(t => t.clientId === b.id || t.clientName === b.name || (t.businessName && t.businessName.toLowerCase() === b.name.toLowerCase()));
      const totalEarned = brandTx.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const brandTs = timesheets.filter(ts => ts.clientId === b.id || ts.clientName === b.name || (ts.businessName && ts.businessName.toLowerCase() === b.name.toLowerCase()));
      const unbilled = brandTs.filter(ts => !ts.invoiced).reduce((acc, ts) => acc + ((Number(ts.hours) || 0) * (Number(ts.hourlyRate) || 130)), 0);
      return { name: b.name, totalEarned, unbilled };
    }).sort((a, b) => b.totalEarned - a.totalEarned);

    const totalPortfolio = brandStats.reduce((acc, b) => acc + b.totalEarned, 0);

    let text = `Here is your **Brand Performance Breakdown** across ${brands.length} ventures (Total: **€${totalPortfolio.toLocaleString('de-DE', { minimumFractionDigits: 2 })}**):\n\n`;

    brandStats.forEach((b, idx) => {
      const share = totalPortfolio > 0 ? ((b.totalEarned / totalPortfolio) * 100).toFixed(1) : '0.0';
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•';
      text += `${medal} **${b.name}**: **€${b.totalEarned.toLocaleString('de-DE', { minimumFractionDigits: 2 })}** (${share}% share)`;
      if (b.unbilled > 0) {
        text += ` • €${b.unbilled.toLocaleString('de-DE', { minimumFractionDigits: 2 })} unbilled`;
      }
      text += `\n`;
    });

    if (brandStats[0]) {
      text += `\n**Top Earner:** **${brandStats[0].name}** leads your business portfolio.`;
    }
    return text;
  }

  generateProfitReport(totals = {}, taxAssessment = {}) {
    const rev = totals.totalIncomeNet || 0;
    const exp = totals.totalDeductibleExpense || 0;
    const profit = totals.netBusinessProfit || (rev - exp);
    const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;
    const reserve = taxAssessment.totalTaxReserve || (profit * 0.22);

    return `Here is your current **Profit & Loss Overview**:\n\n` +
      `• **Total Net Revenue:** €${rev.toLocaleString('de-DE', { minimumFractionDigits: 2 })}\n` +
      `• **Deductible Operating Expenses:** €${exp.toLocaleString('de-DE', { minimumFractionDigits: 2 })}\n` +
      `• **Net Business Profit:** **€${profit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}**\n` +
      `• **Operating Margin:** **${margin}%**\n` +
      `• **Recommended Tax Buffer:** **€${Math.round(reserve).toLocaleString('de-DE')}**`;
  }

  generateKuReport(currentRev, settings = {}) {
    const limit = 25000;
    const remaining = Math.max(0, limit - currentRev);
    const pct = Math.min(100, (currentRev / limit) * 100).toFixed(1);

    return `**Kleinunternehmer Status (§ 19 UStG):**\n\n` +
      `• **Current Year Turnover:** €${currentRev.toLocaleString('de-DE', { minimumFractionDigits: 2 })}\n` +
      `• **Statutory German Limit:** €${limit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}\n` +
      `• **Remaining Shield:** **€${remaining.toLocaleString('de-DE', { minimumFractionDigits: 2 })}** (${pct}% utilized)\n\n` +
      (remaining > 5000 
        ? `✅ You are well below the limit and do not need to charge 19% VAT.`
        : `⚠️ You are approaching the threshold. If you exceed €25.000 in 2026, standard VAT will apply starting 2027.`);
  }

  generateTaxReserveReport(taxAssessment = {}, totals = {}) {
    const totalReserve = Math.round(taxAssessment.totalTaxReserve || 0);
    const profit = totals.netBusinessProfit || 0;
    const quarterly = Math.round(totalReserve / 4);

    return `**Recommended Tax Reserve:**\n\n` +
      `• **Total Set-Aside:** **€${totalReserve.toLocaleString('de-DE')}** based on profit of €${profit.toLocaleString('de-DE', { minimumFractionDigits: 2 })}\n` +
      `• **Quarterly Buffer:** **€${quarterly.toLocaleString('de-DE')}** per quarter\n\n` +
      `Keep this in a dedicated sub-account or pocket to stay liquid when the Finanzamt issues prepayments.`;
  }

  generateTaxCalendarReport() {
    return `**Official German Tax Prepayment Deadlines 2026:**\n\n` +
      `• **10. März 2026:** Q1 Prepayment\n` +
      `• **10. Juni 2026:** Q2 Prepayment\n` +
      `• **10. September 2026:** Q3 Prepayment\n` +
      `• **10. Dezember 2026:** Q4 Prepayment\n` +
      `• **31. Juli 2027:** Annual Tax Return (Anlage EÜR / ESt) deadline.`;
  }

  generateExpenseBreakdownReport(transactions = [], totals = {}) {
    const expenses = transactions.filter(t => t.type === 'expense');
    let text = `You have recorded **${expenses.length} expenses** totaling **€${(totals.totalDeductibleExpense || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}**:\n\n`;

    const topItems = expenses.slice(0, 5);
    topItems.forEach(t => {
      text += `• **${t.description}**: €${Number(t.amount).toFixed(2)} (${t.date})\n`;
    });
    return text;
  }

  async askGroqWithContext(prompt, appState) {
    const { euerSummary, taxAssessment, brands = [] } = appState;
    const totals = euerSummary?.totals || {};

    const systemPrompt = `You are "Seya Copilot", a crisp personal financial assistant for Seya Technologies in Germany.
LIVE DATA:
- Net Revenue: €${(totals.totalIncomeNet || 0).toFixed(2)}
- Expenses: €${(totals.totalDeductibleExpense || 0).toFixed(2)}
- Net Profit: €${(totals.netBusinessProfit || 0).toFixed(2)}
- Tax Reserve: €${Math.round(taxAssessment?.totalTaxReserve || 0)}
- Brands: ${brands.map(b => b.name).join(', ')}

Answer conversationally in plain, concise English with clean markdown bullet points. No filler.`;

    return await this.groqService.callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ], { temperature: 0.3, max_tokens: 600 });
  }

  generateDynamicAdvisory(prompt, appState) {
    const { euerSummary, taxAssessment, brands = [] } = appState;
    const totals = euerSummary?.totals || {};
    return {
      handled: true,
      response: `I've reviewed your request: *"${prompt}"*\n\n` +
        `**Live Status:**\n` +
        `• **YTD Net Revenue:** €${(totals.totalIncomeNet || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}\n` +
        `• **Net Profit:** €${(totals.netBusinessProfit || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}\n` +
        `• **Tax Reserve:** €${Math.round(taxAssessment?.totalTaxReserve || 0).toLocaleString('de-DE')}\n` +
        `• **Brands:** ${brands.map(b => b.name).join(', ')}\n\n` +
        `You can tell me to do works anytime, e.g.:\n` +
        `• *"Please create an expense of 20 euro today for Google Play"*\n` +
        `• *"Add €1,500 income from Seya Pay"*\n` +
        `• *"Download tax CSV"*`,
      actionExecuted: null
    };
  }
}
