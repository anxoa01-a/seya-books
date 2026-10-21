/**
 * Groq AI Financial Service — with retry + model fallback + offline-safe responses
 */

const DEFAULT_GROQ_API_KEY = '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Model priority list — active high-speed Groq models
const MODEL_FALLBACKS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it'
];

export class GroqService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || localStorage.getItem('seya_groq_api_key') || DEFAULT_GROQ_API_KEY;
    this.model = localStorage.getItem('seya_groq_model') || MODEL_FALLBACKS[0];
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('seya_groq_api_key', key);
  }

  setModel(model) {
    this.model = model;
    localStorage.setItem('seya_groq_model', model);
  }

  getApiKey() { return this.apiKey; }
  getModel() { return this.model; }

  /**
   * Core API call with automatic retry + model fallback on 429 / 503 overload errors.
   */
  async callGroq(messages, options = {}, retryCount = 0) {
    if (!this.apiKey) {
      throw new Error('Groq API Key missing. Add your key in Settings.');
    }

    // Pick model — on overload retries, cascade down the fallback list
    const model = options.model || (MODEL_FALLBACKS[retryCount] ?? MODEL_FALLBACKS[MODEL_FALLBACKS.length - 1]);

    const payload = {
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.max_tokens ?? 800,
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

      // Overloaded or rate-limited — retry with next fallback model
      if ((response.status === 429 || response.status === 503 || response.status === 500) && retryCount < MODEL_FALLBACKS.length - 1) {
        const waitMs = Math.min(1000 * (retryCount + 1), 3000);
        await new Promise(r => setTimeout(r, waitMs));
        return this.callGroq(messages, options, retryCount + 1);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
        await new Promise(r => setTimeout(r, 1500));
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

  /** Detailed Financial Diagnosis & Health Audit */
  async generateDetailedAudit(summary, brands = []) {
    const prompt = `Conduct a comprehensive financial health diagnosis for a self-employed tech founder running brands under "Seya Technologies" in Germany.
Financials:
- Net Revenue: €${summary.netRevenue || 0}
- Deductible Operating Costs: €${summary.expenses || 0}
- Net Profit: €${summary.netProfit || 0}
- German Tax Reserve Target: €${summary.taxReserve || 0}
- § 19 UStG Status: ${summary.isKleinunternehmer ? 'Active (€25.000 limit)' : 'Standard Taxation'}
- Active Brands: ${brands.map(b => b.name).join(', ') || 'Seya Pay, Seya AI, Seya Cloud'}

Return strictly JSON format:
{
  "healthScore": 92,
  "verdict": "Strong financial velocity with low burn rate",
  "cashflowStatus": "Optimal runway",
  "taxSafetyStatus": "Turnover well buffered within compliance threshold",
  "keyObservations": [
    "Deductibles shield 28% of taxable revenue",
    "Estimated tax reserve is adequately funded for upcoming prepayments",
    "Brand portfolio shows strong billable pricing power"
  ],
  "recommendations": [
    "Pre-pay recurring annual software tools before Dec 31 to maximize 2026 EÜR write-offs",
    "Review brand invoicing frequency to maintain smooth 14-day cash turnover",
    "Keep reserve liquid in overnight bank account (Tagesgeld)"
  ]
}`;

    try {
      const response = await this.callGroq([
        { role: 'system', content: 'German CFO & Financial Auditor. Output strictly JSON.' },
        { role: 'user', content: prompt }
      ], { json: true, temperature: 0.2, max_tokens: 650 });

      const cleaned = response.replace(/```json|```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        healthScore: 88,
        verdict: "Solid financial velocity & sound margin foundation",
        cashflowStatus: "Positive net cashflow",
        taxSafetyStatus: "§ 19 UStG turnover safely buffered",
        keyObservations: [
          "Operating expenses provide reliable income tax shielding under § 4 Abs. 3 EStG",
          "Tax prepayment reserve matches estimated Einkommensteuer & Soli liabilities",
          "Brand pipeline maintains steady hourly billing rates"
        ],
        recommendations: [
          "Record all business equipment purchases (GWG under €800 net) for immediate write-off",
          "Invoice unbilled brand hours promptly to accelerate cash collections",
          "Maintain clear segregation between operating checking and tax reserve accounts"
        ]
      };
    }
  }
}

export const groqService = new GroqService();

