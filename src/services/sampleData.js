/**
 * Authentic starter data for a self-employed professional in Germany.
 * Prepopulates Seya Books with realistic accounts, clients, transactions,
 * notes, and timesheets so the app feels rich and operational out-of-the-box.
 */

export const INITIAL_BANKS = [
  {
    id: 'bank_n26',
    name: 'N26 Business Account',
    type: 'Checking',
    ibanLast4: '4821',
    balance: 8450.00,
    color: '#00A389'
  },
  {
    id: 'bank_tax_reserve',
    name: 'Steuerrücklage (Tax Reserve)',
    type: 'Savings/Sub-account',
    ibanLast4: '9134',
    balance: 4200.00,
    color: '#F59E0B'
  },
  {
    id: 'bank_paypal',
    name: 'PayPal Business',
    type: 'Wallet',
    ibanLast4: 'PAYP',
    balance: 620.50,
    color: '#0070BA'
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

export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx_1',
    type: 'income',
    date: '2026-01-15',
    amount: 3850.00,
    vatRate: 0,
    category: 'rev_ku',
    clientId: 'brand_seya_pay',
    clientName: 'Seya Pay',
    businessName: 'Seya Pay',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Sprint 1 & Architecture Consulting - Invoice #2026-001',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_2',
    type: 'income',
    date: '2026-02-12',
    amount: 4200.00,
    vatRate: 0,
    category: 'rev_ku',
    clientId: 'brand_seya_ai',
    clientName: 'Seya AI',
    businessName: 'Seya AI',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Full-stack Web Application Milestone 2 - Invoice #2026-002',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_3',
    type: 'expense',
    date: '2026-02-18',
    amount: 149.00,
    vatRate: 19,
    category: 'exp_hardware_afa',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Dell 4K External Monitor (Ergonomic Office Setup)',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_4',
    type: 'expense',
    date: '2026-03-02',
    amount: 45.00,
    vatRate: 19,
    category: 'exp_software_saas',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Figma Professional & GitHub Copilot Subscriptions',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_5',
    type: 'income',
    date: '2026-03-15',
    amount: 2950.00,
    vatRate: 0,
    category: 'rev_ku',
    clientId: 'brand_seya_cloud',
    clientName: 'Seya Cloud',
    businessName: 'Seya Cloud',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Cloud Infrastructure Automation - Invoice #2026-003',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_6',
    type: 'expense',
    date: '2026-03-22',
    amount: 89.40,
    vatRate: 19,
    category: 'exp_travel',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Deutsche Bahn ICE Ticket Berlin - Munich (Client Workshop)',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_7',
    type: 'expense',
    date: '2026-04-05',
    amount: 79.00,
    vatRate: 19,
    category: 'exp_telecom',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Telekom Business Fiber & 5G Data Contract (Monthly)',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_8',
    type: 'income',
    date: '2026-04-18',
    amount: 4600.00,
    vatRate: 0,
    category: 'rev_ku',
    clientId: 'brand_seya_pay',
    clientName: 'Seya Pay',
    businessName: 'Seya Pay',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Mobile App Architecture Sprint & Security Audit - Invoice #2026-004',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_9',
    type: 'expense',
    date: '2026-05-02',
    amount: 112.50,
    vatRate: 19,
    category: 'exp_meals',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Business Dinner with Client Project Lead (70% abziehbar)',
    taxDeductiblePercent: 70
  },
  {
    id: 'tx_10',
    type: 'expense',
    date: '2026-05-14',
    amount: 350.00,
    vatRate: 19,
    category: 'exp_advisory',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Steuerberater Jahresabschlussberatung & EÜR Prüfung',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_11',
    type: 'expense',
    date: '2026-06-01',
    amount: 25.00,
    vatRate: 0,
    category: 'exp_bank_fees',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'N26 Business Metal Monthly Fee & SEPA Charges',
    taxDeductiblePercent: 100
  },
  {
    id: 'tx_12',
    type: 'income',
    date: '2026-06-20',
    amount: 3400.00,
    vatRate: 0,
    category: 'rev_ku',
    clientId: 'brand_seya_studio',
    clientName: 'Seya Studio',
    businessName: 'Seya Studio',
    bankId: 'bank_n26',
    bankName: 'N26 Business Account',
    description: 'Frontend Performance & Core Web Vitals Optimization',
    taxDeductiblePercent: 100
  }
];

export const INITIAL_TIMESHEETS = [
  {
    id: 'ts_1',
    clientId: 'brand_seya_pay',
    clientName: 'Seya Pay',
    businessName: 'Seya Pay',
    date: '2026-10-18',
    hours: 6.5,
    hourlyRate: 140,
    project: 'Next-Gen Mobile Checkout',
    notes: 'API integration and biometric authentication tests.',
    invoiced: false
  },
  {
    id: 'ts_2',
    clientId: 'brand_seya_ai',
    clientName: 'Seya AI',
    businessName: 'Seya AI',
    date: '2026-10-19',
    hours: 8.0,
    hourlyRate: 150,
    project: 'Design System Migration',
    notes: 'Token architecture & responsive component library.',
    invoiced: false
  },
  {
    id: 'ts_3',
    clientId: 'brand_seya_cloud',
    clientName: 'Seya Cloud',
    businessName: 'Seya Cloud',
    date: '2026-10-20',
    hours: 5.0,
    hourlyRate: 125,
    project: 'Microservices Deployment',
    notes: 'Docker containerization & CI/CD pipeline setup.',
    invoiced: false
  }
];

export const INITIAL_NOTES = [
  {
    id: 'note_1',
    title: 'German Tax Deduction Checklist 2026',
    content: '1. Home Office Pauschale: Up to 1.260 € (6 € / day, max 210 days)\n2. Computer hardware & peripherals: 100% immediate depreciation since BMF 2021\n3. Bewirtung: Keep receipt with reason, attendee names, signed!',
    tag: 'Taxes',
    color: '#10b981',
    pinned: true,
    updatedAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'note_2',
    title: 'Kleinunternehmer Threshold Check (§ 19 UStG)',
    content: 'Under new 2025/2026 law (Wachstumschancengesetz / JStG 2024):\n- Vorjahresumsatz: 25.000 € Netto (up from 22k €)\n- Laufendes Jahr: 100.000 € Netto emergency threshold.\nCurrently tracking safely within limit.',
    tag: 'Compliance',
    color: '#06b6d4',
    pinned: true,
    updatedAt: '2026-10-19T14:30:00Z'
  },
  {
    id: 'note_3',
    title: 'Q4 Pricing & Rate Review',
    content: 'Review rate for FinTech Solutions from 110 € to 125 €/hr in 2027. Average utilization target: 28 billable hours/week.',
    tag: 'Strategy',
    color: '#f59e0b',
    pinned: false,
    updatedAt: '2026-10-15T09:15:00Z'
  }
];

export const INITIAL_SETTINGS = {
  isKleinunternehmer: true,
  isFreiberufler: true,
  taxYear: '2026',
  ownerName: 'Pritam Maharjan',
  businessTitle: 'Independent Software & Cloud Consultant',
  taxNumber: '14/234/56789',
  hebesatz: 410,
  currency: 'EUR',
  defaultBankId: 'bank_n26',
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile'
};

export const INITIAL_VAULT_FILES = [
  {
    id: 'vault_1',
    name: 'Steuerberater_Beratungsnachweis_2026.pdf',
    type: 'Tax Document',
    size: 245000,
    mimeType: 'application/pdf',
    uploadDate: '2026-05-14',
    tags: ['Steuerberater', 'EÜR', '2026'],
    notes: 'Official consulting confirmation and tax assessment draft.'
  },
  {
    id: 'vault_2',
    name: 'Dell_UltraSharp_4K_Receipt.pdf',
    type: 'Receipt',
    size: 182000,
    mimeType: 'application/pdf',
    uploadDate: '2026-02-18',
    tags: ['Hardware', 'AfA', 'Office'],
    notes: 'Purchase invoice for Dell Monitor.'
  },
  {
    id: 'vault_3',
    name: 'FinTech_Solutions_Master_Contract_2026.pdf',
    type: 'Contract',
    size: 420000,
    mimeType: 'application/pdf',
    uploadDate: '2026-01-05',
    tags: ['Contract', 'Client', 'NDA'],
    notes: 'Framework agreement & NDA signed for 2026.'
  }
];
