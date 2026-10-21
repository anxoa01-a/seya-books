/**
 * German Anlage EÜR (Einnahmenüberschussrechnung) Definition & ELSTER Tax Statement Mapping
 * Compliant with Bundesfinanzministerium (BMF) form layout.
 */

export const ELSTER_CATEGORIES = [
  // --- BETRIEBSEINNAHMEN (INCOME) ---
  {
    id: 'rev_ku',
    type: 'income',
    code: 'Zeile 11',
    name: 'Steuerfreie Einnahmen (§ 19 UStG)',
    shortName: 'Kleinunternehmer Einnahmen',
    description: 'Umsätze nach der Kleinunternehmerregelung ohne gesonderten USt-Ausweis',
    defaultVat: 0
  },
  {
    id: 'rev_19',
    type: 'income',
    code: 'Zeile 14',
    name: 'Umsatzsteuerpflichtige Betriebseinnahmen (19%)',
    shortName: 'Kundenrechnungen (19% MwSt)',
    description: 'Reguläre Dienstleistungen und Rechnungen mit 19% Umsatzsteuer',
    defaultVat: 19
  },
  {
    id: 'rev_7',
    type: 'income',
    code: 'Zeile 15',
    name: 'Umsatzsteuerpflichtige Betriebseinnahmen (7%)',
    shortName: 'Kundenrechnungen (7% MwSt)',
    description: 'Ermäßigter Steuersatz (z.B. Urheberrechte, bestimmte journalistische Leistungen)',
    defaultVat: 7
  },
  {
    id: 'rev_other',
    type: 'income',
    code: 'Zeile 18',
    name: 'Sonstige betriebliche Einnahmen',
    shortName: 'Sonstige Einnahmen',
    description: 'Zuschüsse, Rückerstattungen, Sachbezüge',
    defaultVat: 0
  },

  // --- BETRIEBSAUSGABEN (EXPENSES) ---
  {
    id: 'exp_subcontractor',
    type: 'expense',
    code: 'Zeile 25',
    name: 'Bezogene Fremdleistungen',
    shortName: 'Freelancer & Subunternehmer',
    description: 'Kosten für Subunternehmer, externe Entwickler, Designer, Übersetzer',
    deductiblePercent: 100
  },
  {
    id: 'exp_rent_office',
    type: 'expense',
    code: 'Zeile 31',
    name: 'Raumkosten & Arbeitszimmer',
    shortName: 'Büromiete & Home Office',
    description: 'Büromiete, Nebenkosten, Coworking Space oder Home-Office-Pauschale (max. 1.260 €)',
    deductiblePercent: 100
  },
  {
    id: 'exp_hardware_afa',
    type: 'expense',
    code: 'Zeile 33',
    name: 'AfA auf bewegliche Wirtschaftsgüter',
    shortName: 'Hardware & Geräte (AfA)',
    description: 'Abschreibung für Laptops, Workstations, Smartphones (Computerhardware ist seit 2021 sofort auf 1 Jahr abschreibbar)',
    deductiblePercent: 100
  },
  {
    id: 'exp_gwg',
    type: 'expense',
    code: 'Zeile 34',
    name: 'Sofortabschreibung geringwertiger Wirtschaftsgüter (GWG)',
    shortName: 'Kleingeräte & GWG (< 800€)',
    description: 'Wirtschaftsgüter bis 800 € netto Einzelanschaffungspreis',
    deductiblePercent: 100
  },
  {
    id: 'exp_travel',
    type: 'expense',
    code: 'Zeile 38',
    name: 'Reisekosten für Geschäftsreisen',
    shortName: 'Reisen & Bahntickets',
    description: 'Deutsche Bahn, Flüge, Hotelübernachtungen, Verpflegungsmehraufwand',
    deductiblePercent: 100
  },
  {
    id: 'exp_telecom',
    type: 'expense',
    code: 'Zeile 40',
    name: 'Telekommunikation & Internet',
    shortName: 'Internet & Mobilfunk',
    description: 'Betrieblicher Anteil Internetanschluss, Smartphone-Vertrag, Cloud-Telefonie',
    deductiblePercent: 100
  },
  {
    id: 'exp_advisory',
    type: 'expense',
    code: 'Zeile 42',
    name: 'Beratungs- & Rechtskosten',
    shortName: 'Steuerberater & Anwalt',
    description: 'Steuerberater, Rechtsanwalt, Buchhaltungssoftware-Gebühren',
    deductiblePercent: 100
  },
  {
    id: 'exp_education',
    type: 'expense',
    code: 'Zeile 44',
    name: 'Fortbildungskosten & Fachliteratur',
    shortName: 'Weiterbildung & Bücher',
    description: 'Konferenzen, Workshops, Onlinekurse, Fachbücher, Mitgliedschaften',
    deductiblePercent: 100
  },
  {
    id: 'exp_meals',
    type: 'expense',
    code: 'Zeile 46',
    name: 'Bewirtungsaufwendungen geschäftlich (70% abziehbar)',
    shortName: 'Geschäftsessen (Bewirtung)',
    description: 'Geschäftsessen mit Kunden/Partnern (70% als Betriebsausgabe abziehbar nach § 4 Abs. 5 Nr. 2 EStG)',
    deductiblePercent: 70
  },
  {
    id: 'exp_advertising',
    type: 'expense',
    code: 'Zeile 47',
    name: 'Werbekosten & Marketing',
    shortName: 'Marketing & Werbung',
    description: 'Google/Meta Ads, Visitenkarten, Domain-Registrierungen, Portfolio-Website',
    deductiblePercent: 100
  },
  {
    id: 'exp_software_saas',
    type: 'expense',
    code: 'Zeile 48',
    name: 'Software, SaaS & Lizenzen',
    shortName: 'Software & Cloud Tools',
    description: 'GitHub, Figma, Adobe, ChatGPT, Hosting, SaaS-Abonnements',
    deductiblePercent: 100
  },
  {
    id: 'exp_bank_fees',
    type: 'expense',
    code: 'Zeile 48',
    name: 'Nebenkosten des Geldverkehrs',
    shortName: 'Bankgebühren & Payment Fees',
    description: 'Geschäftskontogebühren (z.B. N26, Sparkasse), Stripe/PayPal Transaktionsgebühren',
    deductiblePercent: 100
  },
  {
    id: 'exp_office_supplies',
    type: 'expense',
    code: 'Zeile 48',
    name: 'Bürobedarf & Verbrauchsmaterial',
    shortName: 'Bürobedarf & Schreibwaren',
    description: 'Druckerpatronen, Papier, Notizbücher, Versandkosten',
    deductiblePercent: 100
  },
  {
    id: 'exp_other',
    type: 'expense',
    code: 'Zeile 48',
    name: 'Sonstige unbeschränkt abziehbare Betriebsausgaben',
    shortName: 'Sonstige Betriebsausgaben',
    description: 'Sonstige betrieblich veranlasste Aufwendungen',
    deductiblePercent: 100
  }
];

export function getCategoryById(id) {
  return ELSTER_CATEGORIES.find(c => c.id === id) || {
    id: 'unknown',
    name: 'Sonstige',
    shortName: 'Allgemein',
    code: 'Zeile 48',
    deductiblePercent: 100
  };
}

/**
 * Aggregates all transactions into structured German Anlage EÜR layout
 */
export function generateElsterEuerSummary(transactions = [], isKleinunternehmer = true) {
  const lineMap = {};
  ELSTER_CATEGORIES.forEach(cat => {
    lineMap[cat.id] = {
      category: cat,
      grossTotal: 0,
      netTotal: 0,
      vatTotal: 0,
      deductibleTotal: 0,
      transactionCount: 0
    };
  });

  let totalIncomeGross = 0;
  let totalIncomeNet = 0;
  let totalIncomeVat = 0;

  let totalExpenseGross = 0;
  let totalExpenseNet = 0;
  let totalExpenseVat = 0;
  let totalDeductibleExpense = 0;

  transactions.forEach(tx => {
    const amount = Number(tx.amount) || 0;
    const vatRate = Number(tx.vatRate) || 0;
    
    // Net and VAT calculation
    let net = amount;
    let vat = 0;
    if (vatRate > 0) {
      net = Math.round((amount / (1 + vatRate / 100)) * 100) / 100;
      vat = Math.round((amount - net) * 100) / 100;
    }

    const catId = tx.category || (tx.type === 'income' ? (isKleinunternehmer ? 'rev_ku' : 'rev_19') : 'exp_other');
    const bucket = lineMap[catId] || lineMap['exp_other'];

    bucket.grossTotal += amount;
    bucket.netTotal += net;
    bucket.vatTotal += vat;
    bucket.transactionCount += 1;

    if (tx.type === 'income') {
      totalIncomeGross += amount;
      totalIncomeNet += net;
      totalIncomeVat += vat;
    } else {
      const deductiblePercent = bucket.category.deductiblePercent ?? 100;
      const deductibleAmount = Math.round((net * (deductiblePercent / 100)) * 100) / 100;
      bucket.deductibleTotal += deductibleAmount;

      totalExpenseGross += amount;
      totalExpenseNet += net;
      totalExpenseVat += vat;
      totalDeductibleExpense += deductibleAmount;
    }
  });

  const netBusinessProfit = Math.round((totalIncomeNet - totalDeductibleExpense) * 100) / 100;

  return {
    isKleinunternehmer,
    categories: Object.values(lineMap).filter(b => b.transactionCount > 0),
    allCategories: Object.values(lineMap),
    totals: {
      totalIncomeGross: Math.round(totalIncomeGross * 100) / 100,
      totalIncomeNet: Math.round(totalIncomeNet * 100) / 100,
      totalIncomeVat: Math.round(totalIncomeVat * 100) / 100,
      totalExpenseGross: Math.round(totalExpenseGross * 100) / 100,
      totalExpenseNet: Math.round(totalExpenseNet * 100) / 100,
      totalExpenseVat: Math.round(totalExpenseVat * 100) / 100,
      totalDeductibleExpense: Math.round(totalDeductibleExpense * 100) / 100,
      netBusinessProfit
    }
  };
}
