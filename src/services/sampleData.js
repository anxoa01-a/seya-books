/**
 * SEYA BOOKS - Initial System Configuration
 * All dummy transactions, timesheets, and vault files removed for a clean, fresh ledger.
 */

export const INITIAL_BANKS = [
  {
    id: 'bank_main',
    name: 'N26 Business Account',
    type: 'Checking',
    ibanLast4: '4821',
    balance: 0.00
  }
];

export const INITIAL_CLIENTS = [
  {
    id: 'brand_seya_pay',
    name: 'Seya Pay',
    company: 'Seya Technologies - Fintech Division',
    contactPerson: 'Pritam Maharjan',
    email: 'pay@seyatechnologies.com',
    vatId: 'DE345678901',
    hourlyRate: 140,
    paymentTerms: '14 Days',
    projects: ['Payment Gateway', 'Stripe Webhooks', 'Merchant APIs'],
    notes: 'Fintech checkout infrastructure & recurring billing'
  },
  {
    id: 'brand_seya_ai',
    name: 'Seya AI',
    company: 'Seya Technologies - Applied AI Lab',
    contactPerson: 'Pritam Maharjan',
    email: 'ai@seyatechnologies.com',
    vatId: 'DE345678901',
    hourlyRate: 150,
    paymentTerms: 'Immediate',
    projects: ['Groq LPU Copilot', 'Financial Agentic Workflows', 'OCR Model'],
    notes: 'Financial intelligence & agentic reasoning models'
  },
  {
    id: 'brand_seya_cloud',
    name: 'Seya Cloud',
    company: 'Seya Technologies - Infrastructure & Ops',
    contactPerson: 'Pritam Maharjan',
    email: 'cloud@seyatechnologies.com',
    vatId: 'DE345678901',
    hourlyRate: 125,
    paymentTerms: '30 Days',
    projects: ['Edge Services', 'PWA Offline Sync', 'IndexedDB Vault'],
    notes: 'High-availability serverless infrastructure & PWA syncing'
  },
  {
    id: 'brand_seya_studio',
    name: 'Seya Studio',
    company: 'Seya Technologies - Design & Branding',
    contactPerson: 'Pritam Maharjan',
    email: 'studio@seyatechnologies.com',
    vatId: 'DE345678901',
    hourlyRate: 120,
    paymentTerms: '14 Days',
    projects: ['Design Systems', 'Micro-interactions', 'Brand Identity'],
    notes: 'Minimalist product design & UI engineering'
  }
];

// Clean empty ledger — no dummy transactions
export const INITIAL_TRANSACTIONS = [];

// Clean empty timesheets
export const INITIAL_TIMESHEETS = [];

// Clean empty notes
export const INITIAL_NOTES = [];

// Clean empty files vault
export const INITIAL_VAULT_FILES = [];

export const INITIAL_SETTINGS = {
  isKleinunternehmer: true,
  isFreiberufler: true,
  taxYear: '2026',
  ownerName: 'Pritam Maharjan',
  businessTitle: 'Independent Software & Cloud Consultant',
  taxNumber: '14/234/56789',
  hebesatz: 410,
  currency: 'EUR',
  defaultBankId: 'bank_main',
  groqApiKey: import.meta.env?.VITE_GROQ_API_KEY || '',
  groqModel: 'qwen/qwen3.8-27b'
};
