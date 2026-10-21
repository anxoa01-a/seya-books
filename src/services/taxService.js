/**
 * German Tax Calculation Engine (Steuerberechnung Deutschland 2025/2026)
 * Specifically modeled for Sole Proprietorships (Einzelunternehmen, Freiberufler & Gewerbetreibende)
 */

export const TAX_CONSTANTS_2026 = {
  // § 19 UStG Kleinunternehmerregelung (Wachstumschancengesetz / JStG 2024 ab 2025/2026)
  KLEINUNTERNEHMER_THRESHOLD_PREV_YEAR: 25000, // 25.000 € Netto Vorjahresumsatz
  KLEINUNTERNEHMER_THRESHOLD_CURRENT_YEAR: 100000, // 100.000 € Netto laufendes Jahr (sofortiger Verlust ab Überschreitung)
  
  // Grundfreibetrag Einkommensteuer 2025/2026 (Ledig)
  GRUNDFREIBETRAG: 12096,
  
  // Standard VAT rates
  VAT_STANDARD: 19,
  VAT_REDUCED: 7,
  VAT_EXEMPT: 0,
  
  // Gewerbesteuer Freibetrag für natürliche Personen
  GEWERBESTEUER_FREIBETRAG: 24500,
  GEWERBESTEUER_MESSZAHL: 0.035, // 3.5%
  DEFAULT_HEBESATZ: 410, // German average ~400-420%
  
  // Soli Freigrenze (Alleinstehende)
  SOLI_FREIGRENZE_TAX: 18130, // Einkommensteuer bis zu der kein Soli anfällt
};

/**
 * Calculates German Income Tax (Einkommensteuer) according to § 32a EStG
 * @param {number} zvE - Zu versteuerndes Einkommen (Taxable Income / Profit)
 * @returns {number} Estimated income tax
 */
export function calculateGermanIncomeTax(zvE) {
  if (zvE <= TAX_CONSTANTS_2026.GRUNDFREIBETRAG) {
    return 0;
  }

  const y = (zvE - TAX_CONSTANTS_2026.GRUNDFREIBETRAG) / 10000;
  let tax = 0;

  if (zvE <= 17005) {
    // Zone 2: 12.097 € bis 17.005 €
    tax = (995.21 * y + 1400) * y;
  } else if (zvE <= 66760) {
    // Zone 3: 17.006 € bis 66.760 €
    const z = (zvE - 17005) / 10000;
    tax = (208.85 * z + 2397) * z + 1016.48;
  } else if (zvE <= 277825) {
    // Zone 4: 66.761 € bis 277.825 € (Spitzensteuersatz 42%)
    tax = 0.42 * zvE - 10636.31;
  } else {
    // Zone 5: über 277.825 € (Reichensteuer 45%)
    tax = 0.45 * zvE - 18971.06;
  }

  return Math.max(0, Math.round(tax));
}

/**
 * Calculates Solidaritätszuschlag
 * @param {number} incomeTax - Calculated Einkommensteuer
 * @returns {number} Solidaritätszuschlag
 */
export function calculateSolidaritySurcharge(incomeTax) {
  if (incomeTax <= TAX_CONSTANTS_2026.SOLI_FREIGRENZE_TAX) {
    return 0;
  }
  // Sliding transition zone or full 5.5%
  const excess = incomeTax - TAX_CONSTANTS_2026.SOLI_FREIGRENZE_TAX;
  const sliding = excess * 0.119;
  const full = incomeTax * 0.055;
  return Math.max(0, Math.round(Math.min(sliding, full)));
}

/**
 * Calculates Gewerbesteuer (Trade Tax) for commercial sole proprietors
 * (Freiberufler are exempt)
 * @param {number} profit - Business Net Profit
 * @param {number} hebesatz - Municipal multiplier (e.g. 400 = 400%)
 * @param {boolean} isFreiberufler - If true, exempt from Gewerbesteuer
 * @returns {object} { gewerbesteuer, steuermessbetrag, anrechnungESt }
 */
export function calculateGewerbesteuer(profit, hebesatz = TAX_CONSTANTS_2026.DEFAULT_HEBESATZ, isFreiberufler = true) {
  if (isFreiberufler || profit <= TAX_CONSTANTS_2026.GEWERBESTEUER_FREIBETRAG) {
    return { gewerbesteuer: 0, steuermessbetrag: 0, anrechnungESt: 0 };
  }

  const taxableTradeIncome = Math.floor((profit - TAX_CONSTANTS_2026.GEWERBESTEUER_FREIBETRAG) / 100) * 100;
  const steuermessbetrag = taxableTradeIncome * TAX_CONSTANTS_2026.GEWERBESTEUER_MESSZAHL;
  const gewerbesteuer = Math.round(steuermessbetrag * (hebesatz / 100));
  
  // § 35 EStG Ermäßigung der Einkommensteuer bei Einkünften aus Gewerbebetrieb (Faktor 4.0)
  const anrechnungESt = Math.round(Math.min(gewerbesteuer, steuermessbetrag * 4.0));

  return {
    gewerbesteuer,
    steuermessbetrag: Math.round(steuermessbetrag),
    anrechnungESt
  };
}

/**
 * Comprehensive Tax Assessment for current period/year
 */
export function computeTaxAssessment({
  totalNetRevenue = 0,
  totalDeductibleExpenses = 0,
  vatCollected = 0,
  vatPaid = 0,
  isKleinunternehmer = true,
  isFreiberufler = true,
  hebesatz = TAX_CONSTANTS_2026.DEFAULT_HEBESATZ,
  previousYearNetRevenue = 0
}) {
  const netProfit = Math.max(0, totalNetRevenue - totalDeductibleExpenses);
  
  // 1. Kleinunternehmer status analysis
  const kuLimitPrev = TAX_CONSTANTS_2026.KLEINUNTERNEHMER_THRESHOLD_PREV_YEAR;
  const kuLimitCurrent = TAX_CONSTANTS_2026.KLEINUNTERNEHMER_THRESHOLD_CURRENT_YEAR;
  
  const kuRatio = Math.min(100, Math.round((totalNetRevenue / kuLimitPrev) * 100));
  const kuApproachingThreshold = totalNetRevenue >= 20000 && totalNetRevenue <= kuLimitPrev;
  const kuExceededThreshold = totalNetRevenue > kuLimitPrev;
  const kuExceededEmergencyCap = totalNetRevenue > kuLimitCurrent;

  let kuStatusMessage = "Within § 19 UStG limit (VAT exempt)";
  let kuBadgeType = "success";

  if (isKleinunternehmer) {
    if (kuExceededEmergencyCap) {
      kuStatusMessage = "CRITICAL: Exceeded 100,000 € current-year limit! Immediate VAT liability applies (§ 19 UStG n.F.).";
      kuBadgeType = "danger";
    } else if (kuExceededThreshold) {
      kuStatusMessage = "Exceeded 25,000 €! You can remain exempt for this year, but MUST switch to standard VAT next year.";
      kuBadgeType = "warning";
    } else if (kuApproachingThreshold) {
      kuStatusMessage = "Approaching 25,000 € threshold (over 80%). Monitor upcoming customer billings.";
      kuBadgeType = "caution";
    }
  } else {
    kuStatusMessage = "Standard Taxation (Regelbesteuerung) active: 19% / 7% VAT applies";
    kuBadgeType = "info";
  }

  // 2. Trade Tax
  const tradeTaxInfo = calculateGewerbesteuer(netProfit, hebesatz, isFreiberufler);

  // 3. Income Tax
  let rawIncomeTax = calculateGermanIncomeTax(netProfit);
  // Subtract § 35 EStG Gewerbesteuer credit if applicable
  const incomeTax = Math.max(0, rawIncomeTax - tradeTaxInfo.anrechnungESt);
  const solidaritySurcharge = calculateSolidaritySurcharge(incomeTax);

  // 4. VAT Liability (Zahllast)
  // If Kleinunternehmer, VAT collected is 0 and no input VAT refund
  const vatPayable = isKleinunternehmer ? 0 : Math.max(0, Math.round((vatCollected - vatPaid) * 100) / 100);

  // 5. Total Tax Reserve Needed (Steuerrücklage)
  const totalTaxReserve = incomeTax + solidaritySurcharge + tradeTaxInfo.gewerbesteuer + vatPayable;
  const effectiveTaxRate = netProfit > 0 ? Math.round(((incomeTax + solidaritySurcharge + tradeTaxInfo.gewerbesteuer) / netProfit) * 1000) / 10 : 0;

  // 6. Recommended Quarterly Prepayments (Vorauszahlungen)
  const quarterlyIncomeTax = Math.round(incomeTax / 4);
  const quarterlyTradeTax = Math.round(tradeTaxInfo.gewerbesteuer / 4);

  return {
    netProfit,
    effectiveTaxRate,
    incomeTax,
    solidaritySurcharge,
    gewerbesteuer: tradeTaxInfo.gewerbesteuer,
    anrechnungESt: tradeTaxInfo.anrechnungESt,
    vatCollected,
    vatPaid,
    vatPayable,
    totalTaxReserve,
    quarterlyIncomeTax,
    quarterlyTradeTax,
    kleinunternehmer: {
      isActive: isKleinunternehmer,
      currentNetRevenue: totalNetRevenue,
      limitPreviousYear: kuLimitPrev,
      limitCurrentYear: kuLimitCurrent,
      percentageOf25k: kuRatio,
      remainingAllowance: Math.max(0, kuLimitPrev - totalNetRevenue),
      statusMessage: kuStatusMessage,
      badgeType: kuBadgeType,
      isApproaching: kuApproachingThreshold,
      isExceeded: kuExceededThreshold,
      isEmergencyExceeded: kuExceededEmergencyCap
    },
    upcomingPrepaymentDates: [
      { quarter: "Q1", date: "10. März", amount: quarterlyIncomeTax },
      { quarter: "Q2", date: "10. Juni", amount: quarterlyIncomeTax },
      { quarter: "Q3", date: "10. September", amount: quarterlyIncomeTax },
      { quarter: "Q4", date: "10. Dezember", amount: quarterlyIncomeTax },
    ]
  };
}
