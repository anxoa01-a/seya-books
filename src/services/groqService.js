/**
 * Groq AI Financial Service — with retry + model fallback + offline-safe responses
 */

const DEFAULT_GROQ_API_KEY = import.meta.env?.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Model priority list — active high-speed Groq models confirmed for this key
const MODEL_FALLBACKS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'allam-2-7b'
];

export class GroqService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || localStorage.getItem('seya_groq_api_key') || DEFAULT_GROQ_API_KEY;
    const savedModel = localStorage.getItem('seya_groq_model');
    this.model = (savedModel && MODEL_FALLBACKS.includes(savedModel)) ? savedModel : MODEL_FALLBACKS[0];
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    localStorage.setItem('seya_groq_api_key', this.apiKey);
  }

  setModel(model) {
    this.model = model;
    localStorage.setItem('seya_groq_model', model);
  }

  getApiKey() { return this.apiKey; }
  getModel() { return this.model; }

  /**
   * Core API call with automatic retry + model fallback on 429 / 503 / 404 overload & model-not-found errors.
   */
  async callGroq(messages, options = {}, retryCount = 0) {
    if (!this.apiKey || !this.apiKey.trim()) {
      throw new Error('Groq API Key is not set. Please add your API key in Setup & Banks or paste it in chat.');
    }

    // Pick model — on retries or model_not_found, cascade down the fallback list
    const model = retryCount === 0 
      ? (options.model || this.model || MODEL_FALLBACKS[0])
      : (MODEL_FALLBACKS[retryCount] ?? MODEL_FALLBACKS[MODEL_FALLBACKS.length - 1]);

    const payload = {
      model,
      messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.max_tokens ?? 1200,
      ...(options.json ? { response_format: { type: 'json_object' } } : {})
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Overloaded, rate-limited, or model_not_found — retry with next fallback model
      if ((response.status === 429 || response.status === 503 || response.status === 500 || response.status === 404) && retryCount < MODEL_FALLBACKS.length - 1) {
        const waitMs = Math.min(800 * (retryCount + 1), 2500);
        await new Promise(r => setTimeout(r, waitMs));
        return this.callGroq(messages, options, retryCount + 1);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If error mentions model not found, try fallback
        if ((errorData.error?.code === 'model_not_found' || errorData.error?.message?.toLowerCase().includes('model')) && retryCount < MODEL_FALLBACKS.length - 1) {
          return this.callGroq(messages, options, retryCount + 1);
        }
        throw new Error(errorData.error?.message || `API Error ${response.status}`);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      let content = choice?.message?.content || '';
      if (!content && choice?.message?.reasoning) content = choice.message.reasoning;
      return content;

    } catch (err) {
      if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.');
      // Retry on network errors
      if (retryCount < MODEL_FALLBACKS.length - 1) {
        await new Promise(r => setTimeout(r, 1200));
        return this.callGroq(messages, options, retryCount + 1);
      }
      throw err;
    }
  }

  /** Conversational financial advisor with live business context */
  async askFinancialAdvisor(messages, ctx = {}) {
    const system = `You are "Seya AI", a concise financial & tax advisor for a self-employed professional (Freiberufler/Einzelunternehmer) in Germany.
You know German tax law: EStG, UStG, Anlage EÜR, § 19 UStG Kleinunternehmer (€100k limit from 2026), AfA, Bewirtungskosten 70/30, Home-Office-Pauschale.

LIVE FINANCIALS:
- YTD Net Revenue: €${(ctx.netRevenue||0).toLocaleString('de-DE',{minimumFractionDigits:2})}
- Deductible Expenses: €${(ctx.expenses||0).toLocaleString('de-DE',{minimumFractionDigits:2})}
- Net Profit: €${(ctx.netProfit||0).toLocaleString('de-DE',{minimumFractionDigits:2})}
- Status: ${ctx.isKleinunternehmer ? '§ 19 UStG Kleinunternehmer — VAT exempt' : 'Standard VAT 19%'}
- Type: ${ctx.isFreiberufler ? 'Freiberufler (Gewerbesteuer exempt)' : 'Gewerbetreibender'}
- Tax Reserve: €${(ctx.taxReserve||0).toLocaleString('de-DE',{minimumFractionDigits:2})}

Reply in English. Be crisp, specific, and actionable. No fluff.`;

    return this.callGroq([{ role: 'system', content: system }, ...messages], { temperature: 0.3, max_tokens: 600 });
  }

  /** AI Receipt / Invoice scanner */
  async parseReceiptText(rawText) {
    const prompt = `Parse this receipt/invoice text and return ONLY a valid JSON object:
"""
${rawText}
"""
Categories: exp_software_saas, exp_hardware_afa, exp_gwg, exp_rent_office, exp_travel, exp_meals, exp_telecom, exp_subcontractor, exp_education, exp_bank_fees, exp_office_supplies, exp_advertising, exp_other

Return exactly:
{"merchant":"string","date":"YYYY-MM-DD","amount":0.00,"vatRate":19,"category":"exp_software_saas","description":"string","confidence":0.95}`;

    const response = await this.callGroq([
      { role: 'system', content: 'You are a receipt OCR parser. Return ONLY valid JSON, no markdown.' },
      { role: 'user', content: prompt }
    ], { json: true, temperature: 0.1, max_tokens: 300 });

    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      return { merchant: 'Unknown', amount: 0, date: new Date().toISOString().split('T')[0], category: 'exp_other', vatRate: 19, confidence: 0.5 };
    }
  }

  /** AI financial insights generator */
  async generateFinancialInsights(summary, recentTxs = []) {
    const prompt = `Generate 3 financial insights for a self-employed person in Germany. Return ONLY JSON:
Data: Revenue €${summary.netRevenue}, Expenses €${summary.expenses}, Profit €${summary.netProfit}, Kleinunternehmer: ${summary.isKleinunternehmer}
{"insights":[{"id":"1","type":"tax_optimization","sentiment":"positive","title":"Short title","metric":"€ figure","description":"2 sentences.","actionLabel":"Action"}]}`;

    const response = await this.callGroq([
      { role: 'system', content: 'German tax CFO. Output strictly JSON.' },
      { role: 'user', content: prompt }
    ], { json: true, temperature: 0.3, max_tokens: 600 });

    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned).insights || [];
    } catch {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]).insights || [];
      return [];
    }
  }

  /** Revenue projection calculator */
  async projectFutureIncome(params) {
    const prompt = `Generate a 3-month revenue forecast. Return ONLY JSON:
Inputs: Revenue €${params.netRevenue}, Rate €${params.hourlyRate}/h, Clients: ${params.clientsCount||3}
{"projectedQuarterRevenue":0,"projectedAnnualRevenue":0,"projectedNetProfit":0,"estimatedAnnualTaxLiability":0,"growthRatePercent":0,"confidenceScore":85,"forecastMonthly":[{"month":"Nov 2026","projectedRevenue":0,"projectedExpense":0},{"month":"Dec 2026","projectedRevenue":0,"projectedExpense":0},{"month":"Jan 2027","projectedRevenue":0,"projectedExpense":0}],"strategicAdvice":"string"}`;

    const response = await this.callGroq([
      { role: 'system', content: 'Revenue forecasting engine. Output strictly JSON.' },
      { role: 'user', content: prompt }
    ], { json: true, temperature: 0.2, max_tokens: 500 });

    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Failed to parse projection.');
    }
  }

  /** AI Work Session & Sheet text parser */
  async parseWorkSessionText(rawText, defaultRate = 125) {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `You are an AI timesheet & billing parser. Extract work session details from this text and return ONLY valid JSON:
"""
${rawText}
"""

Return strictly this JSON format:
{
  "date": "YYYY-MM-DD",
  "hours": 4.5,
  "hourlyRate": 125,
  "businessName": "Brand or Client name (e.g. Seya Pay, Seya AI)",
  "project": "Brief title of work done",
  "notes": "Summary of deliverables or scope"
}

If date is relative (e.g. "today", "yesterday"), resolve against today's date (${today}). If hourly rate or pay is not mentioned, use ${defaultRate}.`;

    try {
      const response = await this.callGroq([
        { role: 'system', content: 'You are an intelligent timesheet JSON parser. Output only valid JSON.' },
        { role: 'user', content: prompt }
      ], { json: true, temperature: 0.1, max_tokens: 350 });

      const cleaned = response.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        date: parsed.date || today,
        hours: Number(parsed.hours) || 2,
        hourlyRate: Number(parsed.hourlyRate) || defaultRate,
        businessName: parsed.businessName || 'Seya Technologies',
        project: parsed.project || 'Project Deliverable',
        notes: parsed.notes || rawText.slice(0, 100)
      };
    } catch (err) {
      // Offline / fallback regex heuristic parsing
      let hours = 2;
      const hMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?|std|stunden)/i);
      if (hMatch) hours = parseFloat(hMatch[1]);

      let rate = defaultRate;
      const rMatch = rawText.match(/(?:€|\$|EUR)?\s*(\d+)\s*(?:\/h|\/hr|€\/h|per hour)/i);
      if (rMatch) rate = parseFloat(rMatch[1]);

      let business = 'Seya Technologies';
      const bMatch = rawText.match(/(?:for|at|brand|client)\s+([A-Za-z0-9\s&]+?)(?:on|at|\d|$|,)/i);
      if (bMatch && bMatch[1].trim()) business = bMatch[1].trim();

      return {
        date: today,
        hours,
        hourlyRate: rate,
        businessName: business,
        project: rawText.slice(0, 40) + '...',
        notes: rawText
      };
    }
  }

  /** Detailed Financial Diagnosis & Health Audit with Deep Transaction Intelligence */
  async generateDetailedAudit(summary, brands = [], transactions = [], timesheets = []) {
    const expensesList = (transactions || []).filter(t => t.type === 'expense');
    const incomeList = (transactions || []).filter(t => t.type === 'income');

    // Aggregate category spending
    const categorySpending = {};
    expensesList.forEach(t => {
      const cat = t.categoryName || 'Other';
      categorySpending[cat] = (categorySpending[cat] || 0) + (Number(t.amount) || 0);
    });
    const sortedCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amt]) => `${name} (€${amt.toFixed(2)})`);

    // Top counterparties
    const topExpenses = expensesList
      .slice()
      .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
      .slice(0, 5)
      .map(t => `${t.description || 'Expense'}: €${Number(t.amount).toFixed(2)} (${t.categoryName || 'General'})`);

    // Unbilled timesheets
    const unbilledHours = (timesheets || [])
      .filter(ts => !ts.invoiced)
      .reduce((sum, ts) => sum + (Number(ts.hours) || 0), 0);
    const unbilledValue = (timesheets || [])
      .filter(ts => !ts.invoiced)
      .reduce((sum, ts) => sum + ((Number(ts.hours) || 0) * (Number(ts.hourlyRate) || 130)), 0);

    const netRev = Number(summary.netRevenue) || 0;
    const totalExp = Number(summary.expenses) || 0;
    const profit = Number(summary.netProfit) || (netRev - totalExp);
    const margin = netRev > 0 ? Math.round((profit / netRev) * 100) : 0;
    const kuLimit = 25000;
    const kuBuffer = Math.max(0, kuLimit - netRev);

    const prompt = `Conduct a comprehensive financial health diagnosis for a self-employed tech founder running brands under "Seya Technologies" in Germany.
LIVE FINANCIAL AUDIT DATA:
- Net Revenue: €${netRev.toFixed(2)} (${incomeList.length} income transactions)
- Deductible Expenses: €${totalExp.toFixed(2)} (${expensesList.length} expense transactions)
- Net Business Profit: €${profit.toFixed(2)} (Margin: ${margin}%)
- Estimated German Tax Reserve: €${Number(summary.taxReserve || 0).toFixed(2)}
- § 19 UStG Status: ${summary.isKleinunternehmer ? `Active Kleinunternehmer (€${kuBuffer.toFixed(2)} buffer remaining before €25k)` : 'Standard 19% VAT'}
- Active Brands: ${brands.map(b => b.name).join(', ') || 'Seya Pay, Seya AI, Seya Cloud'}
- Top Expense Categories: ${sortedCategories.join(', ') || 'None recorded yet'}
- Major Expense Items: ${topExpenses.join(', ') || 'None recorded yet'}
- Unbilled Timesheet Pipeline: ${unbilledHours} hours ready to invoice (€${unbilledValue.toFixed(2)} value)

You MUST respond strictly with a valid JSON object matching this structure:
{
  "healthScore": 92,
  "verdict": "Executive summary sentence about financial state",
  "cashflowStatus": "Optimal runway | Positive operational flow | Needs attention",
  "taxSafetyStatus": "Turnover well buffered | Approaching threshold | Standard VAT",
  "whatIsHappening": {
    "headline": "Clear statement of transaction flow & velocity",
    "narrative": "Paragraph explaining spending velocity, money in vs money out, recurring patterns, and top cost drivers.",
    "spendingVelocity": "e.g. €X/month burn rate across Y active transactions",
    "topExpenseCategories": ["Category A (€X)", "Category B (€Y)"],
    "keyObservations": [
      "Observation about real transaction flow",
      "Observation about recurring software/operating costs",
      "Observation about cash collection speed"
    ]
  },
  "howItIsGoing": {
    "headline": "Business trajectory and profitability assessment",
    "profitMargin": "${margin}% net margin",
    "runwayStatus": "Clear runway status",
    "trajectory": "Expansion | Steady | Consolidation",
    "brandPerformance": [
      "Evaluation of venture monetization",
      "Timesheet conversion performance"
    ]
  },
  "whatCanBeDone": {
    "headline": "High-impact tactical action plan",
    "immediateActions": [
      "Action 1 with clear financial impact",
      "Action 2 with clear financial impact",
      "Action 3 with clear financial impact"
    ],
    "taxOptimization": [
      "German tax write-off rule (e.g. GWG under €800, 70% meals, home office €1,260)",
      "Anlage EÜR shielding tactic"
    ],
    "revenueAcceleration": [
      "How to unlock unbilled pipeline or increase billing velocity"
    ]
  }
}`;

    try {
      const response = await this.callGroq([
        { role: 'system', content: 'You are an elite German CFO, tax strategist, and financial intelligence auditor. Output strictly JSON.' },
        { role: 'user', content: prompt }
      ], { json: true, temperature: 0.2, max_tokens: 1100 });

      const cleaned = response.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Ensure all required fields exist
      if (parsed && parsed.whatIsHappening && parsed.howItIsGoing && parsed.whatCanBeDone) {
        return parsed;
      }
      return this.generateDeterministicAudit(summary, brands, transactions, timesheets);
    } catch (err) {
      console.warn('Groq audit call failed, using deterministic audit engine:', err);
      return this.generateDeterministicAudit(summary, brands, transactions, timesheets);
    }
  }

  /** Deterministic financial audit engine computed from live ledger data */
  generateDeterministicAudit(summary, brands = [], transactions = [], timesheets = []) {
    const expensesList = (transactions || []).filter(t => t.type === 'expense');
    const incomeList = (transactions || []).filter(t => t.type === 'income');
    const netRev = Number(summary.netRevenue) || 0;
    const totalExp = Number(summary.expenses) || 0;
    const profit = Number(summary.netProfit) || (netRev - totalExp);
    const margin = netRev > 0 ? Math.round((profit / netRev) * 100) : 0;
    const kuLimit = 25000;
    const kuBuffer = Math.max(0, kuLimit - netRev);

    // Compute top category
    const catMap = {};
    expensesList.forEach(t => {
      const c = t.categoryName || 'Software & Tools';
      catMap[c] = (catMap[c] || 0) + (Number(t.amount) || 0);
    });
    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const topCatName = sortedCats[0] ? sortedCats[0][0] : 'Software & Tools';
    const topCatAmt = sortedCats[0] ? sortedCats[0][1] : totalExp;

    const unbilledHours = (timesheets || [])
      .filter(ts => !ts.invoiced)
      .reduce((sum, ts) => sum + (Number(ts.hours) || 0), 0);
    const unbilledVal = (timesheets || [])
      .filter(ts => !ts.invoiced)
      .reduce((sum, ts) => sum + ((Number(ts.hours) || 0) * (Number(ts.hourlyRate) || 130)), 0);

    const healthScore = Math.min(98, Math.max(70, Math.round(75 + (margin > 40 ? 15 : margin > 20 ? 8 : 0) + (kuBuffer > 5000 ? 8 : 0))));

    return {
      healthScore,
      verdict: profit >= 0 
        ? `Healthy financial velocity with ${margin}% margin and active tax shield.`
        : `Operating expenses currently exceed recognized revenue. Focus on cash collections.`,
      cashflowStatus: totalExp > 0 ? (profit > 0 ? "Optimal operational runway" : "Tight operating margin") : "Positive liquidity",
      taxSafetyStatus: kuBuffer > 5000 ? `Safe buffer (€${kuBuffer.toLocaleString('de-DE', { minimumFractionDigits: 2 })} under § 19 UStG)` : `Approaching €25.000 limit`,
      whatIsHappening: {
        headline: `${transactions.length} total entries recorded (${incomeList.length} inflows, ${expensesList.length} expenses)`,
        narrative: `Your business has registered €${netRev.toLocaleString('de-DE', { minimumFractionDigits: 2 })} in client income against €${totalExp.toLocaleString('de-DE', { minimumFractionDigits: 2 })} in operating deductions. The primary cost driver is ${topCatName} (€${topCatAmt.toLocaleString('de-DE', { minimumFractionDigits: 2 })}), representing ${totalExp > 0 ? Math.round((topCatAmt / totalExp) * 100) : 0}% of all deductible spend.`,
        spendingVelocity: totalExp > 0 ? `€${totalExp.toLocaleString('de-DE', { minimumFractionDigits: 2 })} total deductible spend across ${expensesList.length} items` : `Zero expense burn rate registered`,
        topExpenseCategories: sortedCats.slice(0, 3).map(([c, a]) => `${c}: €${a.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`),
        keyObservations: [
          `Operating expenses shield ${netRev > 0 ? Math.round((totalExp / netRev) * 100) : 0}% of gross income from German income tax under § 4 Abs. 3 EStG.`,
          `Tax prepayment reserve target is €${Number(summary.taxReserve || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}, protecting against Q1-Q4 Vorauszahlung notices.`,
          `Brand billing rates maintain solid pricing power averaging €130-150/hr across ${brands.length} ventures.`
        ]
      },
      howItIsGoing: {
        headline: `Net profit is €${profit.toLocaleString('de-DE', { minimumFractionDigits: 2 })} with a ${margin}% operating margin`,
        profitMargin: `${margin}% Net Profit Margin`,
        runwayStatus: profit > 0 ? `Profitable unit economics` : `Runway reliant on unbilled receivables`,
        trajectory: profit > 0 ? "Expansion & Positive Retained Earnings" : "Early-Stage Investment",
        brandPerformance: [
          `Top venture portfolio: ${brands.map(b => b.name).slice(0, 3).join(', ')}.`,
          unbilledHours > 0 
            ? `${unbilledHours} billable hours logged in Sheets (€${unbilledVal.toLocaleString('de-DE', { minimumFractionDigits: 2 })} value) ready to convert to cash.`
            : `All logged hours are currently billed or up to date.`
        ]
      },
      whatCanBeDone: {
        headline: `Actionable financial optimization & German tax protection playbook`,
        immediateActions: [
          unbilledVal > 0 
            ? `Invoice ${unbilledHours}h unbilled timesheets immediately to bring in €${unbilledVal.toLocaleString('de-DE', { minimumFractionDigits: 2 })}.`
            : `Pre-record recurring software licenses to maintain smooth monthly write-off tracking.`,
          `Record business equipment purchases under €800 net for immediate 100% GWG write-off in 2026 EÜR.`,
          `Keep tax reserve of €${Number(summary.taxReserve || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} strictly in a segregated Tagesgeld or sub-account.`
        ],
        taxOptimization: [
          `Home-Office-Pauschale: Claim up to €1,260/year (€6/day for up to 210 remote work days) under § 4 Abs. 5 Nr. 6b EStG.`,
          `Bewirtungsbelege: Deduct 70% of business meal costs with documented attendee names and business discussion topics.`
        ],
        revenueAcceleration: [
          `Review venture contracts to ensure standard 14-day payment terms (Zahlungsziel) to accelerate cash collection cycles.`
        ]
      }
    };
  }
}

export const groqService = new GroqService();

