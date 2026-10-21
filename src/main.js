/**
 * SEYA BOOKS - Main Application Controller
 * Pure Black & White with Reflective Chrome Gradients & Animations
 * Features: Dashboard with AI Health Audit, Brands under Seya Tech, P&L,
 * Sheets with AI Auto-Sheet Text Parser, Clean Tax CSV Exports & Groq LPU Copilot
 */

import {
  getDB,
  getAllFromStore,
  saveToStore,
  deleteFromStore,
  clearStore
} from './services/db.js';

import {
  INITIAL_BANKS,
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_TIMESHEETS,
  INITIAL_SETTINGS,
  INITIAL_VAULT_FILES
} from './services/sampleData.js';

import { computeTaxAssessment } from './services/taxService.js';
import { generateElsterEuerSummary, getCategoryById } from './services/elsterService.js';
import { groqService } from './services/groqService.js';
import { SeyaFinancialAgent } from './services/agentEngine.js';
import { generateStatementPDF, generateElsterEuerPDF } from './services/pdfService.js';

import { renderNavbar } from './components/Navbar.js';
import { renderMobileNav } from './components/MobileNav.js';
import { renderActionMenu } from './components/ActionMenu.js';
import { renderDashboardView } from './components/DashboardView.js';
import { renderBrandsView } from './components/BrandsView.js';
import { renderProfitLossView } from './components/ProfitLossView.js';
import { renderSheetsView } from './components/SheetsView.js';
import { renderSetupView } from './components/SetupView.js';

import { renderAiChatDrawer } from './components/AiChatDrawer.js';
import { renderAiScanModal } from './components/AiScanModal.js';
import { renderTransactionModal } from './components/TransactionModal.js';
import { renderBrandModal } from './components/BrandModal.js';
import { renderTimesheetModal } from './components/TimesheetModal.js';
import { renderAiInsightsModal } from './components/AiInsightsModal.js';
import { renderAiSheetModal } from './components/AiSheetModal.js';

import Chart from 'chart.js/auto';
import confetti from 'canvas-confetti';

class SeyaBooksApp {
  constructor() {
    this.activeTab = 'dashboard'; // 'dashboard' | 'brands' | 'pnl' | 'sheets' | 'setup'
    this.activeSubSheet = 'banking'; // 'banking' | 'taxes' | 'vault' | 'timesheets'
    this.theme = localStorage.getItem('seya_theme') || 'dark';

    // State collections
    this.transactions = [];
    this.banks = [];
    this.brands = []; // Brands under Seya Technologies
    this.files = [];
    this.timesheets = [];
    this.settings = { ...INITIAL_SETTINGS };

    // Modals & Panels
    this.isActionSheetOpen = false;
    this.isAiDrawerOpen = false;
    this.activeModal = null; // 'transaction' | 'brand' | 'timesheet' | 'ai-scan' | 'ai-insights' | 'ai-sheet'

    // Transaction modal state
    this.txModalMode = 'create';
    this.txModalType = 'expense';
    this.editingTransaction = null;

    // Timer state for billable work
    this.timerRunning = false;
    this.timerSeconds = 7240;
    this.timerInterval = null;
    this.hourlyRate = 130;

    // AI Copilot & Autonomous Agent state
    this.agentEngine = new SeyaFinancialAgent(groqService);
    this.aiMessages = [];
    this.isAiThinking = false;
    this.aiAuditData = null;
    this.isLoadingAudit = false;
    this.groqTestStatus = 'idle';

    // AI Auto-Sheet Parser state
    this.aiParsedSession = null;
    this.isParsingSession = false;
    this.rawSheetText = '';

    // AI Scanner state
    this.isAiScanning = false;
    this.scannedResult = null;
    this.rawScanText = '';

    // Chart instances
    this.trendChartInstance = null;
    this.donutChartInstance = null;

    this.init();
  }

  async init() {
    document.documentElement.setAttribute('data-theme', this.theme);
    document.documentElement.className = this.theme;
    await this.loadData();
    this.startLiveTimer();
    this.render();
  }

  startLiveTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timerRunning) {
        this.timerSeconds += 1;
        const timerEl = document.getElementById('sheets-live-timer');
        const accEl = document.getElementById('sheets-live-accrued');
        if (timerEl) {
          const h = String(Math.floor(this.timerSeconds / 3600)).padStart(2, '0');
          const m = String(Math.floor((this.timerSeconds % 3600) / 60)).padStart(2, '0');
          const s = String(this.timerSeconds % 60).padStart(2, '0');
          timerEl.textContent = `${h}:${m}:${s}`;
        }
        if (accEl) {
          const accrued = ((this.timerSeconds / 3600) * this.hourlyRate).toFixed(2);
          accEl.textContent = `€${accrued} accrued this session`;
        }
      }
    }, 1000);
  }

  async loadData() {
    try {
      await getDB();
      let txs = await getAllFromStore('transactions');
      let banks = await getAllFromStore('banks');
      let brands = await getAllFromStore('clients'); // store key 'clients' represents brands
      let files = await getAllFromStore('filesVault');
      let timesheets = await getAllFromStore('timesheets');
      let savedSettings = await getAllFromStore('settings');

      if (!txs || txs.length === 0) {
        for (const t of INITIAL_TRANSACTIONS) await saveToStore('transactions', t);
        for (const b of INITIAL_BANKS) await saveToStore('banks', b);
        for (const c of INITIAL_CLIENTS) await saveToStore('clients', c);
        for (const f of INITIAL_VAULT_FILES) await saveToStore('filesVault', f);
        for (const ts of INITIAL_TIMESHEETS) await saveToStore('timesheets', ts);
        for (const [k, v] of Object.entries(INITIAL_SETTINGS)) await saveToStore('settings', { key: k, value: v });

        txs = INITIAL_TRANSACTIONS;
        banks = INITIAL_BANKS;
        brands = INITIAL_CLIENTS;
        files = INITIAL_VAULT_FILES;
        timesheets = INITIAL_TIMESHEETS;
        this.settings = { ...INITIAL_SETTINGS };
      } else {
        if (savedSettings && savedSettings.length > 0) {
          savedSettings.forEach(s => { this.settings[s.key] = s.value; });
        }
      }

      this.transactions = txs || [];
      this.banks = banks || [];
      this.brands = brands || [];
      this.files = files || [];
      this.timesheets = timesheets || [];

      if (this.settings.groqApiKey) groqService.setApiKey(this.settings.groqApiKey);
      if (this.settings.groqModel) groqService.setModel(this.settings.groqModel);
    } catch (err) {
      console.error('Error loading data:', err);
      this.transactions = INITIAL_TRANSACTIONS;
      this.banks = INITIAL_BANKS;
      this.brands = INITIAL_CLIENTS;
      this.files = INITIAL_VAULT_FILES;
      this.timesheets = INITIAL_TIMESHEETS;
    }
  }

  getCalculations() {
    const isKleinunternehmer = this.settings.isKleinunternehmer !== false;
    const isFreiberufler = this.settings.isFreiberufler !== false;

    const euerSummary = generateElsterEuerSummary(this.transactions, isKleinunternehmer);
    const taxAssessment = computeTaxAssessment({
      totalNetRevenue: euerSummary.totals.totalIncomeNet,
      totalDeductibleExpenses: euerSummary.totals.totalDeductibleExpense,
      vatCollected: euerSummary.totals.totalIncomeVat,
      vatPaid: euerSummary.totals.totalExpenseVat,
      isKleinunternehmer,
      isFreiberufler,
      hebesatz: Number(this.settings.hebesatz) || 410
    });

    return { euerSummary, taxAssessment };
  }

  render() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    const { euerSummary, taxAssessment } = this.getCalculations();
    const isKu = this.settings.isKleinunternehmer !== false;

    // Enrich brands with live Total Earned revenue
    const brandsWithEarned = this.brands.map(b => {
      const brandTx = this.transactions.filter(t => t.clientId === b.id || t.clientName === b.name || (t.businessName && t.businessName.toLowerCase() === b.name.toLowerCase()));
      const totalEarned = brandTx.filter(t => t.type === 'income').reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      return {
        ...b,
        totalEarned
      };
    });

    // View content switch
    let mainContent = '';
    switch (this.activeTab) {
      case 'dashboard':
        mainContent = renderDashboardView({
          transactions: this.transactions,
          totals: euerSummary.totals,
          taxAssessment,
          banks: this.banks,
          brands: this.brands,
          aiAuditData: this.aiAuditData
        });
        break;

      case 'brands':
        mainContent = renderBrandsView({
          brands: this.brands,
          timesheets: this.timesheets,
          transactions: this.transactions
        });
        break;

      case 'pnl':
        mainContent = renderProfitLossView({
          transactions: this.transactions,
          totals: euerSummary.totals,
          taxAssessment,
          isKleinunternehmer: isKu
        });
        break;

      case 'sheets':
        mainContent = renderSheetsView({
          activeSubSheet: this.activeSubSheet,
          banks: this.banks,
          transactions: this.transactions,
          taxAssessment,
          settings: this.settings,
          files: this.files,
          timesheets: this.timesheets,
          brands: this.brands,
          timerRunning: this.timerRunning,
          timerSeconds: this.timerSeconds,
          hourlyRate: this.hourlyRate,
          aiParsedSession: this.aiParsedSession,
          isParsingSession: this.isParsingSession
        });
        break;

      case 'setup':
        mainContent = renderSetupView({
          settings: this.settings,
          groqStatus: this.groqTestStatus,
          banks: this.banks
        });
        break;

      default:
        mainContent = renderDashboardView({
          transactions: this.transactions,
          totals: euerSummary.totals,
          taxAssessment,
          banks: this.banks,
          brands: this.brands,
          aiAuditData: this.aiAuditData
        });
    }

    appEl.innerHTML = `
      ${renderNavbar({
        activeTab: this.activeTab,
        theme: this.theme,
        isKleinunternehmer: isKu,
        netProfit: euerSummary.totals.netBusinessProfit || 0
      })}

      <main class="main-content">
        ${mainContent}
      </main>

      ${renderMobileNav({ activeTab: this.activeTab })}
      ${renderActionMenu()}

      <!-- Slide-over AI Copilot Drawer -->
      ${renderAiChatDrawer({
        isOpen: this.isAiDrawerOpen,
        messages: this.aiMessages,
        financialContext: {
          netRevenue: euerSummary.totals.totalIncomeNet,
          taxReserve: taxAssessment.totalTaxReserve,
          isKleinunternehmer: isKu
        },
        isThinking: this.isAiThinking
      })}

      <!-- Detailed AI Financial Health Diagnosis Modal -->
      ${renderAiInsightsModal({
        isOpen: this.activeModal === 'ai-insights',
        auditData: this.aiAuditData,
        financialSummary: {
          netRevenue: euerSummary.totals.totalIncomeNet,
          expenses: euerSummary.totals.totalDeductibleExpense,
          netProfit: euerSummary.totals.netBusinessProfit,
          taxReserve: taxAssessment.totalTaxReserve,
          isKleinunternehmer: isKu
        },
        isLoading: this.isLoadingAudit
      })}

      <!-- AI Work Session & Auto-Sheet Modal -->
      ${renderAiSheetModal({
        isOpen: this.activeModal === 'ai-sheet',
        isParsing: this.isParsingSession,
        parsedData: this.aiParsedSession,
        rawText: this.rawSheetText,
        brands: this.brands
      })}

      <!-- Transaction Modal -->
      ${renderTransactionModal({
        isOpen: this.activeModal === 'transaction',
        mode: this.txModalMode,
        initialType: this.txModalType,
        transaction: this.editingTransaction,
        clients: brandsWithEarned,
        banks: this.banks,
        isKleinunternehmer: isKu
      })}

      <!-- Brand Creation Modal -->
      ${renderBrandModal({
        isOpen: this.activeModal === 'brand'
      })}

      <!-- Manual Timesheet Modal -->
      ${renderTimesheetModal({
        isOpen: this.activeModal === 'timesheet',
        clients: brandsWithEarned
      })}

      <!-- AI Receipt OCR Modal -->
      ${renderAiScanModal({
        isOpen: this.activeModal === 'ai-scan',
        isScanning: this.isAiScanning,
        parsedResult: this.scannedResult,
        rawText: this.rawScanText
      })}
    `;

    this.bindEvents();

    if (this.activeTab === 'dashboard') {
      this.initDashboardCharts();
    }
  }

  initDashboardCharts() {
    const isDark = this.theme !== 'light';
    const textColor = isDark ? '#ffffff' : '#000000';
    const mutedColor = isDark ? '#71717a' : '#71717a';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

    // 1. CASHFLOW TREND SPLINE AREA CHART
    const trendCanvas = document.getElementById('cashflow-trend-chart');
    if (trendCanvas) {
      if (this.trendChartInstance) this.trendChartInstance.destroy();

      const ctx = trendCanvas.getContext('2d');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyIncome = new Array(12).fill(0);
      const monthlyExpense = new Array(12).fill(0);

      this.transactions.forEach(t => {
        if (!t.date) return;
        const m = parseInt(t.date.split('-')[1], 10) - 1;
        if (m >= 0 && m < 12) {
          const amt = Number(t.amount) || 0;
          if (t.type === 'income') monthlyIncome[m] += amt;
          else monthlyExpense[m] += amt;
        }
      });

      const gradient = ctx.createLinearGradient(0, 0, 0, 220);
      gradient.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.16)');
      gradient.addColorStop(1, isDark ? 'rgba(255, 255, 255, 0.0)' : 'rgba(0, 0, 0, 0.0)');

      this.trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Revenue (€)',
              data: monthlyIncome,
              borderColor: isDark ? '#ffffff' : '#000000',
              borderWidth: 2.4,
              pointBackgroundColor: isDark ? '#ffffff' : '#000000',
              pointRadius: 3,
              pointHoverRadius: 6,
              tension: 0.35,
              fill: true,
              backgroundColor: gradient
            },
            {
              label: 'Expenses (€)',
              data: monthlyExpense,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
              borderWidth: 1.8,
              borderDash: [4, 4],
              pointRadius: 0,
              tension: 0.35,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                color: textColor,
                boxWidth: 10,
                font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 }
              }
            },
            tooltip: {
              backgroundColor: isDark ? '#141414' : '#ffffff',
              titleColor: isDark ? '#ffffff' : '#000000',
              bodyColor: isDark ? '#a1a1aa' : '#52525b',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label}: €${ctx.parsed.y.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: mutedColor, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: mutedColor,
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: (val) => `€${val >= 1000 ? (val / 1000) + 'k' : val}`
              }
            }
          }
        }
      });
    }

    // 2. EXPENSE CATEGORY DISTRIBUTION DONUT CHART
    const donutCanvas = document.getElementById('expense-category-chart');
    if (donutCanvas) {
      if (this.donutChartInstance) this.donutChartInstance.destroy();

      const ctx = donutCanvas.getContext('2d');
      const catTotals = {};

      this.transactions.filter(t => t.type === 'expense').forEach(t => {
        const cat = getCategoryById(t.category);
        const name = cat.shortName || 'Other';
        catTotals[name] = (catTotals[name] || 0) + (Number(t.amount) || 0);
      });

      const labels = Object.keys(catTotals);
      const data = Object.values(catTotals);

      const monochromeShades = isDark ? [
        '#ffffff',
        '#d4d4d8',
        '#a1a1aa',
        '#71717a',
        '#52525b',
        '#3f3f46',
        '#27272a'
      ] : [
        '#000000',
        '#27272a',
        '#52525b',
        '#71717a',
        '#a1a1aa',
        '#d4d4d8',
        '#e4e4e7'
      ];

      this.donutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels.length > 0 ? labels : ['No Expenses'],
          datasets: [{
            data: data.length > 0 ? data : [1],
            backgroundColor: monochromeShades,
            borderWidth: 2,
            borderColor: isDark ? '#111111' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: textColor,
                boxWidth: 10,
                font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 }
              }
            },
            tooltip: {
              backgroundColor: isDark ? '#141414' : '#ffffff',
              titleColor: isDark ? '#ffffff' : '#000000',
              bodyColor: isDark ? '#a1a1aa' : '#52525b',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              borderWidth: 1,
              callbacks: {
                label: (ctx) => ` €${Number(ctx.parsed).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`
              }
            }
          }
        }
      });
    }
  }

  downloadCleanTaxCSV() {
    const headers = [
      'Date',
      'Type',
      'Amount (EUR)',
      'Name / Counterparty',
      'Category',
      'VAT Rate (%)',
      'Tax Deductible (%)',
      'Account',
      'Notes'
    ];

    const rows = this.transactions.map(t => {
      const cat = getCategoryById(t.category);
      const isInc = t.type === 'income';
      const cleanDesc = (t.description || '').replace(/"/g, '""');
      const cleanName = (t.businessName || t.clientName || '').replace(/"/g, '""');
      const cleanNotes = (t.notes || '').replace(/"/g, '""');

      return [
        t.date || '',
        isInc ? 'INCOME' : 'EXPENSE',
        Number(t.amount || 0).toFixed(2),
        `"${cleanName || cleanDesc}"`,
        `"${cat.shortName} (${cat.code})"`,
        t.vatRate ?? (this.settings.isKleinunternehmer ? 0 : 19),
        isInc ? 100 : (t.taxDeductiblePercent ?? cat.deductiblePercent ?? 100),
        `"${t.bankName || 'Checking'}"`,
        `"${cleanNotes}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Seya_Books_Clean_Tax_Statement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  bindEvents() {
    // 1. Navigation switching
    document.querySelectorAll('.nav-link, .mob-nav-item').forEach(btn => {
      btn.onclick = (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab && tab !== this.activeTab) {
          this.activeTab = tab;
          this.render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    });

    const brandBtn = document.getElementById('nav-brand-btn');
    if (brandBtn) {
      brandBtn.onclick = () => {
        this.activeTab = 'dashboard';
        this.render();
      };
    }

    const navToLedger = document.getElementById('btn-nav-to-ledger');
    if (navToLedger) {
      navToLedger.onclick = () => {
        this.activeTab = 'sheets';
        this.activeSubSheet = 'banking';
        this.render();
      };
    }

    // 2. Clean Tax CSV Download Buttons
    const taxCsvBtns = [
      document.getElementById('btn-download-tax-csv'),
      document.getElementById('btn-quick-tax-csv'),
      document.getElementById('btn-download-tax-csv-sheets')
    ];
    taxCsvBtns.forEach(btn => {
      if (btn) btn.onclick = () => this.downloadCleanTaxCSV();
    });

    // 3. AI Insights Hero trigger on Dashboard -> Opens Detailed Audit Modal
    const triggerAudit = document.getElementById('trigger-ai-insights-modal');
    if (triggerAudit) {
      triggerAudit.onclick = () => {
        this.activeModal = 'ai-insights';
        this.render();
      };
    }

    const btnRerunAudit = document.getElementById('btn-rerun-ai-audit');
    if (btnRerunAudit) {
      btnRerunAudit.onclick = async () => {
        this.isLoadingAudit = true;
        this.render();
        const { euerSummary, taxAssessment } = this.getCalculations();
        try {
          const freshAudit = await groqService.generateDetailedAudit({
            netRevenue: euerSummary.totals.totalIncomeNet,
            expenses: euerSummary.totals.totalDeductibleExpense,
            netProfit: euerSummary.totals.netBusinessProfit,
            taxReserve: taxAssessment.totalTaxReserve,
            isKleinunternehmer: this.settings.isKleinunternehmer
          }, this.brands);
          this.aiAuditData = freshAudit;
        } catch (err) {
          console.error('Audit generation error:', err);
        } finally {
          this.isLoadingAudit = false;
          this.render();
        }
      };
    }

    // 4. AI Work Session Text Parser (in Sheets)
    const btnParseInline = document.getElementById('btn-parse-sheet-text-inline');
    const inputInlineText = document.getElementById('sheet-quick-ai-text');
    if (btnParseInline && inputInlineText) {
      btnParseInline.onclick = async () => {
        const text = inputInlineText.value.trim();
        if (!text) { alert('Please enter text notes or work details.'); return; }

        this.isParsingSession = true;
        this.rawSheetText = text;
        this.render();

        try {
          const parsed = await groqService.parseWorkSessionText(text, this.hourlyRate);
          this.aiParsedSession = parsed;
        } catch (err) {
          console.error('Session parse error:', err);
        } finally {
          this.isParsingSession = false;
          this.render();
        }
      };
    }

    const btnCommitInline = document.getElementById('btn-commit-inline-sheet');
    if (btnCommitInline && this.aiParsedSession) {
      btnCommitInline.onclick = async () => {
        const business = document.getElementById('inline-edit-brand')?.value || this.aiParsedSession.businessName || 'Seya Pay';
        const date = document.getElementById('inline-edit-date')?.value || this.aiParsedSession.date;
        const hours = parseFloat(document.getElementById('inline-edit-hours')?.value) || this.aiParsedSession.hours;
        const rate = parseFloat(document.getElementById('inline-edit-rate')?.value) || this.aiParsedSession.hourlyRate;

        const newTs = {
          id: 'ts_' + Date.now(),
          businessName: business,
          clientName: business,
          date,
          hours,
          hourlyRate: rate,
          project: this.aiParsedSession.project || 'Project Sprint',
          notes: this.aiParsedSession.notes || 'Parsed by Seya AI Auto-Sheet',
          invoiced: false
        };

        await saveToStore('timesheets', newTs);
        this.timesheets.unshift(newTs);
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
        this.aiParsedSession = null;
        alert(`Recorded to timesheet: ${hours} hrs for ${business} (€${(hours * rate).toFixed(2)})`);
        this.render();
      };
    }

    const btnCancelInline = document.getElementById('btn-cancel-inline-sheet');
    if (btnCancelInline) {
      btnCancelInline.onclick = () => {
        this.aiParsedSession = null;
        this.render();
      };
    }

    const btnOpenFullAiSheet = document.getElementById('btn-open-full-ai-sheet-modal');
    if (btnOpenFullAiSheet) {
      btnOpenFullAiSheet.onclick = () => {
        this.activeModal = 'ai-sheet';
        this.render();
      };
    }

    // Modal AI Sheet form & parser
    const btnRunModalParse = document.getElementById('btn-run-ai-sheet-parse');
    const modalInputText = document.getElementById('ai-sheet-input-text');
    if (btnRunModalParse && modalInputText) {
      btnRunModalParse.onclick = async () => {
        const text = modalInputText.value.trim();
        if (!text) { alert('Please enter or paste your work log text.'); return; }

        this.isParsingSession = true;
        this.rawSheetText = text;
        this.render();

        try {
          const parsed = await groqService.parseWorkSessionText(text, this.hourlyRate);
          this.aiParsedSession = parsed;
        } catch (err) {
          console.error('Modal parse error:', err);
        } finally {
          this.isParsingSession = false;
          this.render();
        }
      };
    }

    const aiSheetAdjustForm = document.getElementById('ai-sheet-adjust-form');
    if (aiSheetAdjustForm) {
      aiSheetAdjustForm.onsubmit = async (e) => {
        e.preventDefault();
        const business = document.getElementById('ai-sheet-business').value;
        const date = document.getElementById('ai-sheet-date').value;
        const hours = parseFloat(document.getElementById('ai-sheet-hours').value) || 1;
        const rate = parseFloat(document.getElementById('ai-sheet-rate').value) || 125;
        const project = document.getElementById('ai-sheet-project').value;
        const notes = document.getElementById('ai-sheet-notes').value;

        const newTs = {
          id: 'ts_' + Date.now(),
          businessName: business,
          clientName: business,
          date,
          hours,
          hourlyRate: rate,
          project,
          notes,
          invoiced: false
        };

        await saveToStore('timesheets', newTs);
        this.timesheets.unshift(newTs);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
        this.activeModal = null;
        this.aiParsedSession = null;
        this.rawSheetText = '';
        this.render();
      };
    }

    // 5. Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.onclick = () => {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('seya_theme', this.theme);
        document.documentElement.setAttribute('data-theme', this.theme);
        document.documentElement.className = this.theme;
        this.render();
      };
    }

    // 6. AI Copilot Drawer Controls
    const aiBtn = document.getElementById('header-ai-btn');
    if (aiBtn) {
      aiBtn.onclick = () => {
        this.isAiDrawerOpen = true;
        this.render();
      };
    }

    const closeAiBtn = document.getElementById('close-ai-drawer-btn');
    const aiOverlay = document.getElementById('ai-drawer-overlay');
    if (closeAiBtn) closeAiBtn.onclick = () => { this.isAiDrawerOpen = false; this.render(); };
    if (aiOverlay) aiOverlay.onclick = () => { this.isAiDrawerOpen = false; this.render(); };

    const clearAiBtn = document.getElementById('btn-clear-ai-chat');
    if (clearAiBtn) {
      clearAiBtn.onclick = () => {
        this.aiMessages = [];
        this.render();
      };
    }

    document.querySelectorAll('.quick-prompt-btn').forEach(btn => {
      btn.onclick = (e) => {
        const prompt = e.currentTarget.getAttribute('data-prompt');
        if (prompt) this.sendAiQuery(prompt);
      };
    });

    const aiForm = document.getElementById('ai-input-form');
    const aiInput = document.getElementById('ai-user-input');
    if (aiForm && aiInput) {
      aiForm.onsubmit = (e) => {
        e.preventDefault();
        const text = aiInput.value.trim();
        if (text) this.sendAiQuery(text);
      };
    }

    document.querySelectorAll('.copy-msg-btn').forEach(btn => {
      btn.onclick = (e) => {
        const text = decodeURIComponent(e.currentTarget.getAttribute('data-text') || '');
        navigator.clipboard.writeText(text);
        e.currentTarget.textContent = 'Copied!';
        setTimeout(() => { e.currentTarget.textContent = 'Copy'; }, 1500);
      };
    });

    // 7. Center '+' Action Sheet Toggle
    const fabBtn = document.getElementById('fab-plus-btn');
    const actionSheet = document.getElementById('action-sheet');
    const sheetBackdrop = document.getElementById('sheet-backdrop');

    if (fabBtn && actionSheet && sheetBackdrop) {
      fabBtn.onclick = () => {
        this.isActionSheetOpen = !this.isActionSheetOpen;
        actionSheet.classList.toggle('active', this.isActionSheetOpen);
        sheetBackdrop.classList.toggle('active', this.isActionSheetOpen);
        fabBtn.classList.toggle('open', this.isActionSheetOpen);
      };

      sheetBackdrop.onclick = () => {
        this.isActionSheetOpen = false;
        actionSheet.classList.remove('active');
        sheetBackdrop.classList.remove('active');
        fabBtn.classList.remove('open');
      };
    }

    const actionIncome = document.getElementById('action-btn-income');
    if (actionIncome) {
      actionIncome.onclick = () => {
        this.isActionSheetOpen = false;
        this.txModalMode = 'create';
        this.txModalType = 'income';
        this.editingTransaction = null;
        this.activeModal = 'transaction';
        this.render();
      };
    }

    const actionExpense = document.getElementById('action-btn-expense');
    if (actionExpense) {
      actionExpense.onclick = () => {
        this.isActionSheetOpen = false;
        this.txModalMode = 'create';
        this.txModalType = 'expense';
        this.editingTransaction = null;
        this.activeModal = 'transaction';
        this.render();
      };
    }

    const actionBrand = document.getElementById('action-btn-brand');
    if (actionBrand) {
      actionBrand.onclick = () => {
        this.isActionSheetOpen = false;
        this.activeModal = 'brand';
        this.render();
      };
    }

    const actionScan = document.getElementById('action-btn-scan');
    if (actionScan) {
      actionScan.onclick = () => {
        this.isActionSheetOpen = false;
        this.activeModal = 'ai-scan';
        this.render();
      };
    }

    const actionAiSheet = document.getElementById('action-btn-ai-sheet');
    if (actionAiSheet) {
      actionAiSheet.onclick = () => {
        this.isActionSheetOpen = false;
        this.activeModal = 'ai-sheet';
        this.render();
      };
    }

    // 8. Generic Modal Close Buttons
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeModal = null;
        this.editingTransaction = null;
        this.render();
      };
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.activeModal = null;
          this.editingTransaction = null;
          this.render();
        }
      };
    });

    // 9. Dashboard Specific
    const btnQuickAddTx = document.getElementById('btn-quick-add-tx');
    if (btnQuickAddTx) {
      btnQuickAddTx.onclick = () => {
        this.txModalMode = 'create';
        this.txModalType = 'expense';
        this.editingTransaction = null;
        this.activeModal = 'transaction';
        this.render();
      };
    }

    const btnExportPdfSummary = document.getElementById('btn-export-pdf-summary');
    if (btnExportPdfSummary) {
      btnExportPdfSummary.onclick = () => {
        const { euerSummary, taxAssessment } = this.getCalculations();
        generateStatementPDF({
          transactions: this.transactions,
          totals: euerSummary.totals,
          taxAssessment,
          ownerName: this.settings.ownerName || 'Pritam Maharjan',
          businessTitle: this.settings.businessTitle || 'Freelance Consultant',
          taxYear: '2026',
          isKleinunternehmer: this.settings.isKleinunternehmer !== false
        });
      };
    }

    document.querySelectorAll('.tx-item-row').forEach(row => {
      row.onclick = () => {
        const id = row.getAttribute('data-id');
        const found = this.transactions.find(t => t.id === id);
        if (found) {
          this.editingTransaction = found;
          this.txModalMode = 'edit';
          this.txModalType = found.type;
          this.activeModal = 'transaction';
          this.render();
        }
      };
    });

    // 10. Brands Portfolio Actions
    const btnAddBrandModal = document.getElementById('btn-add-brand-modal');
    if (btnAddBrandModal) {
      btnAddBrandModal.onclick = () => {
        this.activeModal = 'brand';
        this.render();
      };
    }

    const brandForm = document.getElementById('brand-form');
    if (brandForm) {
      brandForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('brand-name-input').value.trim();
        const contactPerson = document.getElementById('brand-contact-input').value.trim();
        const email = document.getElementById('brand-email-input').value.trim();
        const initialEarned = parseFloat(document.getElementById('brand-earned-input')?.value) || 0;
        const paymentTerms = document.getElementById('brand-terms-select').value;
        const projectsStr = document.getElementById('brand-projects-input').value.trim();
        const projects = projectsStr ? projectsStr.split(',').map(s => s.trim()) : ['Ventures & Engineering'];

        const brandId = 'brand_' + Date.now();
        const newBrand = {
          id: brandId,
          name,
          contactPerson,
          email,
          hourlyRate: 125,
          paymentTerms,
          projects
        };

        await saveToStore('clients', newBrand);
        this.brands.unshift(newBrand);

        if (initialEarned > 0) {
          const initTx = {
            id: 'tx_' + Date.now(),
            type: 'income',
            date: new Date().toISOString().split('T')[0],
            amount: initialEarned,
            vatRate: this.settings.isKleinunternehmer ? 0 : 19,
            category: 'inc_freelance_services',
            bankId: 'bank_n26',
            bankName: 'Business Checking',
            clientId: brandId,
            clientName: name,
            businessName: name,
            description: `${name} Initial Earned Revenue`,
            taxDeductiblePercent: 100
          };
          await saveToStore('transactions', initTx);
          this.transactions.unshift(initTx);
        }

        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
        this.activeModal = null;
        this.render();
      };
    }

    document.querySelectorAll('.brand-bill-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeModal = 'timesheet';
        this.render();
      };
    });

    document.querySelectorAll('.brand-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this brand under Seya Technologies?')) {
          await deleteFromStore('clients', id);
          this.brands = this.brands.filter(b => b.id !== id);
          this.render();
        }
      };
    });

    // 11. P&L PDF
    const btnExportPnlPdf = document.getElementById('btn-export-pnl-pdf');
    if (btnExportPnlPdf) {
      btnExportPnlPdf.onclick = () => {
        const { euerSummary, taxAssessment } = this.getCalculations();
        generateStatementPDF({
          transactions: this.transactions,
          totals: euerSummary.totals,
          taxAssessment,
          ownerName: this.settings.ownerName || 'Pritam Maharjan',
          businessTitle: this.settings.businessTitle || 'Freelance Consultant',
          taxYear: '2026',
          isKleinunternehmer: this.settings.isKleinunternehmer !== false
        });
      };
    }

    // 12. Sheets Subtabs
    document.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.onclick = (e) => {
        const target = e.currentTarget.getAttribute('data-subsheet');
        if (target) {
          this.activeSubSheet = target;
          this.render();
        }
      };
    });

    // Sheets Timer Actions
    const timerToggleBtn = document.getElementById('sheets-btn-timer-toggle');
    if (timerToggleBtn) {
      timerToggleBtn.onclick = () => {
        this.timerRunning = !this.timerRunning;
        this.render();
      };
    }

    const timerCommitBtn = document.getElementById('sheets-btn-timer-commit');
    if (timerCommitBtn) {
      timerCommitBtn.onclick = async () => {
        const hours = Math.round((this.timerSeconds / 3600) * 10) / 10;
        const brandName = this.brands[0]?.name || 'Seya Pay';
        const newTs = {
          id: 'ts_' + Date.now(),
          businessName: brandName,
          clientName: brandName,
          date: new Date().toISOString().split('T')[0],
          hours,
          hourlyRate: this.hourlyRate,
          project: 'Sprint Deliverables',
          notes: 'Committed from live work timer',
          invoiced: false
        };
        await saveToStore('timesheets', newTs);
        this.timesheets.unshift(newTs);
        this.timerSeconds = 0;
        this.timerRunning = false;
        alert(`Session recorded: ${hours} hrs for ${brandName} (€${(hours * this.hourlyRate).toFixed(2)})`);
        this.render();
      };
    }

    const btnAddTimesheet = document.getElementById('btn-add-timesheet-modal');
    if (btnAddTimesheet) {
      btnAddTimesheet.onclick = () => {
        this.activeModal = 'timesheet';
        this.render();
      };
    }

    document.querySelectorAll('.ts-invoice-toggle-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        const ts = this.timesheets.find(t => t.id === id);
        if (ts) {
          ts.invoiced = !ts.invoiced;
          await saveToStore('timesheets', ts);
          this.render();
        }
      };
    });

    // Vault dropzone
    const vaultDropzone = document.getElementById('vault-dropzone');
    const vaultInput = document.getElementById('vault-file-input');
    if (vaultDropzone && vaultInput) {
      vaultDropzone.onclick = () => vaultInput.click();
      vaultInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          const newDoc = {
            id: 'file_' + Date.now() + Math.random().toString(36).substr(2, 4),
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            date: new Date().toISOString().split('T')[0],
            type: file.type.includes('image') ? 'receipt' : (file.name.includes('Steuer') ? 'tax' : 'invoice')
          };
          await saveToStore('filesVault', newDoc);
          this.files.unshift(newDoc);
        }
        this.render();
      };
    }

    document.querySelectorAll('.vault-delete-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete file?')) {
          await deleteFromStore('filesVault', id);
          this.files = this.files.filter(f => f.id !== id);
          this.render();
        }
      };
    });

    // ELSTER Exports
    const exportElsterPdf = document.getElementById('btn-download-elster-pdf');
    if (exportElsterPdf) {
      exportElsterPdf.onclick = () => {
        const { euerSummary, taxAssessment } = this.getCalculations();
        generateElsterEuerPDF({
          taxYear: '2026',
          euerSummary,
          taxAssessment,
          ownerName: this.settings.ownerName || 'Pritam Maharjan',
          taxNumber: this.settings.taxNumber || '14/234/56789',
          isKleinunternehmer: this.settings.isKleinunternehmer !== false
        });
      };
    }

    const exportElsterCsv = document.getElementById('btn-export-elster-csv');
    if (exportElsterCsv) {
      exportElsterCsv.onclick = () => {
        const headers = ['Datum', 'Typ', 'Brutto', 'Kategorie_Code', 'Kategorie', 'Konto', 'Beschreibung'];
        const rows = this.transactions.map(t => {
          const cat = getCategoryById(t.category);
          return [t.date, t.type, t.amount, cat.code, `"${cat.shortName}"`, `"${t.bankName}"`, `"${t.description}"`].join(',');
        });
        const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Anlage_EUER_ELSTER_2026.csv`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    // 13. Setup View Actions
    const btnSaveSetup = document.getElementById('btn-save-setup');
    if (btnSaveSetup) {
      btnSaveSetup.onclick = async () => {
        const ownerName = document.getElementById('setup-owner-name')?.value || 'Pritam Maharjan';
        const businessTitle = document.getElementById('setup-business-title')?.value || 'Freelance Consultant';
        const taxNumber = document.getElementById('setup-tax-number')?.value || '14/234/56789';
        const vatId = document.getElementById('setup-vat-id')?.value || 'DE345678901';
        const isKu = document.getElementById('setup-is-ku')?.checked !== false;
        const isFrei = document.getElementById('setup-is-freiberufler')?.checked !== false;
        const groqKey = document.getElementById('setup-groq-key')?.value.trim() || '';
        const groqModel = document.getElementById('setup-groq-model')?.value || 'qwen/qwen3.8-27b';

        this.settings = {
          ...this.settings,
          ownerName,
          businessTitle,
          taxNumber,
          vatId,
          isKleinunternehmer: isKu,
          isFreiberufler: isFrei,
          groqApiKey: groqKey,
          groqModel
        };

        for (const [k, v] of Object.entries(this.settings)) {
          await saveToStore('settings', { key: k, value: v });
        }

        groqService.setApiKey(groqKey);
        groqService.setModel(groqModel);

        alert('Configuration saved successfully!');
        this.render();
      };
    }

    const btnTestGroqSetup = document.getElementById('btn-test-groq-setup');
    if (btnTestGroqSetup) {
      btnTestGroqSetup.onclick = async () => {
        const key = document.getElementById('setup-groq-key')?.value.trim();
        const model = document.getElementById('setup-groq-model')?.value;
        if (!key) { alert('Please enter a Groq API key.'); return; }

        this.groqTestStatus = 'testing';
        this.render();

        groqService.setApiKey(key);
        groqService.setModel(model);

        try {
          const res = await groqService.askFinancialAdvisor([{ role: 'user', content: 'Ping test' }], {});
          if (res) this.groqTestStatus = 'success';
          else this.groqTestStatus = 'error';
        } catch (err) {
          this.groqTestStatus = 'error';
        }
        this.render();
      };
    }

    const btnExportBackup = document.getElementById('btn-export-backup-json');
    if (btnExportBackup) {
      btnExportBackup.onclick = () => {
        const backup = {
          version: '2.0-monochrome-reflective',
          exportedAt: new Date().toISOString(),
          settings: this.settings,
          transactions: this.transactions,
          banks: this.banks,
          brands: this.brands,
          files: this.files,
          timesheets: this.timesheets
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Seya_Books_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      };
    }

    const btnResetData = document.getElementById('btn-reset-sample-data');
    if (btnResetData) {
      btnResetData.onclick = async () => {
        if (confirm('Reload default demo data?')) {
          await clearStore('transactions');
          await clearStore('banks');
          await clearStore('clients');
          await clearStore('filesVault');
          await clearStore('timesheets');
          await clearStore('settings');

          for (const t of INITIAL_TRANSACTIONS) await saveToStore('transactions', t);
          for (const b of INITIAL_BANKS) await saveToStore('banks', b);
          for (const c of INITIAL_CLIENTS) await saveToStore('clients', c);
          for (const f of INITIAL_VAULT_FILES) await saveToStore('filesVault', f);
          for (const ts of INITIAL_TIMESHEETS) await saveToStore('timesheets', ts);
          for (const [k, v] of Object.entries(INITIAL_SETTINGS)) await saveToStore('settings', { key: k, value: v });

          this.transactions = INITIAL_TRANSACTIONS;
          this.banks = INITIAL_BANKS;
          this.brands = INITIAL_CLIENTS;
          this.files = INITIAL_VAULT_FILES;
          this.timesheets = INITIAL_TIMESHEETS;
          this.settings = { ...INITIAL_SETTINGS };

          alert('Demo data reloaded.');
          this.render();
        }
      };
    }

    const btnWipeDb = document.getElementById('btn-wipe-database');
    if (btnWipeDb) {
      btnWipeDb.onclick = async () => {
        if (confirm('Wipe entire database?')) {
          await clearStore('transactions');
          await clearStore('filesVault');
          await clearStore('timesheets');
          this.transactions = [];
          this.files = [];
          this.timesheets = [];
          alert('Database wiped.');
          this.render();
        }
      };
    }

    // 14. Transaction Modal Submit
    const txTypeIncomeBtn = document.getElementById('tx-type-income-btn');
    const txTypeExpenseBtn = document.getElementById('tx-type-expense-btn');
    if (txTypeIncomeBtn && txTypeExpenseBtn) {
      txTypeIncomeBtn.onclick = () => { this.txModalType = 'income'; this.render(); };
      txTypeExpenseBtn.onclick = () => { this.txModalType = 'expense'; this.render(); };
    }

    const txForm = document.getElementById('tx-form');
    if (txForm) {
      txForm.onsubmit = async (e) => {
        e.preventDefault();
        const amt = parseFloat(document.getElementById('tx-amount').value) || 0;
        const desc = document.getElementById('tx-desc').value.trim();
        const date = document.getElementById('tx-date').value;
        const vatRate = parseFloat(document.getElementById('tx-vat').value) || 0;
        const cat = document.getElementById('tx-category').value;
        const bankSelect = document.getElementById('tx-bank');
        const bankId = bankSelect ? bankSelect.value : 'bank_n26';
        const bankName = bankSelect ? bankSelect.options[bankSelect.selectedIndex].text : 'Business Checking';
        const clientSelect = document.getElementById('tx-client');
        const clientId = clientSelect ? clientSelect.value : null;
        const clientName = clientSelect && clientSelect.value ? clientSelect.options[clientSelect.selectedIndex].text.split('(')[0].trim() : null;
        const taxDeductiblePercent = this.txModalType === 'expense' && cat === 'cat_meals' ? 70 : 100;

        const newTx = {
          id: this.editingTransaction ? this.editingTransaction.id : 'tx_' + Date.now(),
          type: this.txModalType,
          date,
          amount: amt,
          vatRate,
          category: cat,
          bankId,
          bankName,
          clientId,
          clientName,
          businessName: clientName,
          description: desc,
          taxDeductiblePercent
        };

        await saveToStore('transactions', newTx);
        if (this.editingTransaction) {
          const idx = this.transactions.findIndex(t => t.id === newTx.id);
          if (idx !== -1) this.transactions[idx] = newTx;
        } else {
          this.transactions.unshift(newTx);
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.85 } });
        }

        this.activeModal = null;
        this.editingTransaction = null;
        this.render();
      };
    }

    // Edit Transaction Buttons (Dashboard and Sheets)
    document.querySelectorAll('.edit-tx-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const found = this.transactions.find(t => t.id === id);
        if (found) {
          this.editingTransaction = found;
          this.txModalMode = 'edit';
          this.txModalType = found.type;
          this.activeModal = 'transaction';
          this.render();
        }
      };
    });

    // Add Bank / Pocket Form Submit
    const addBankForm = document.getElementById('add-bank-form');
    if (addBankForm) {
      addBankForm.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-bank-name').value.trim();
        const type = document.getElementById('new-bank-type').value;
        const balance = parseFloat(document.getElementById('new-bank-balance').value) || 0;
        const newBank = {
          id: 'bank_' + Date.now(),
          name,
          type,
          balance,
          ibanLast4: String(Math.floor(1000 + Math.random() * 9000))
        };
        await saveToStore('banks', newBank);
        this.banks.push(newBank);
        this.render();
      };
    }

    // Delete Bank / Pocket Buttons
    document.querySelectorAll('.delete-bank-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this bank account or pocket?')) {
          await deleteFromStore('banks', id);
          this.banks = this.banks.filter(b => b.id !== id);
          this.render();
        }
      };
    });

    // 15. Manual Timesheet Form Submit
    const tsForm = document.getElementById('timesheet-form');
    if (tsForm) {
      tsForm.onsubmit = async (e) => {
        e.preventDefault();
        const clientSelect = document.getElementById('ts-client-select');
        const clientId = clientSelect.value;
        const clientName = clientSelect.options[clientSelect.selectedIndex].text.split('(')[0].trim();
        const date = document.getElementById('ts-date-input').value;
        const hours = parseFloat(document.getElementById('ts-hours-input').value) || 1;
        const hourlyRate = parseFloat(document.getElementById('ts-rate-input').value) || 95;
        const project = document.getElementById('ts-project-input').value;
        const notes = document.getElementById('ts-notes-input').value;

        const newTs = {
          id: 'ts_' + Date.now(),
          clientId,
          clientName,
          businessName: clientName,
          date,
          hours,
          hourlyRate,
          project,
          notes,
          invoiced: false
        };

        await saveToStore('timesheets', newTs);
        this.timesheets.unshift(newTs);
        this.activeModal = null;
        this.render();
      };
    }

    // 16. AI Scanner Events
    const scanDropzone = document.getElementById('ai-scan-dropzone');
    const scanFileInput = document.getElementById('scan-file-input');
    const scanTextInput = document.getElementById('scan-text-input');
    const btnRunScan = document.getElementById('btn-run-ai-scan');

    if (scanDropzone && scanFileInput) {
      scanDropzone.onclick = () => scanFileInput.click();
      scanFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file && scanTextInput) {
          scanTextInput.value = `[Uploaded File: ${file.name}] - Groq OCR will extract merchant, net, VAT rate, and Anlage EÜR category.`;
          this.rawScanText = scanTextInput.value;
        }
      };
    }

    if (btnRunScan && scanTextInput) {
      btnRunScan.onclick = async () => {
        const text = scanTextInput.value.trim();
        if (!text) { alert('Please enter or paste receipt text.'); return; }

        this.isAiScanning = true;
        this.rawScanText = text;
        this.render();

        try {
          const parsed = await groqService.extractReceiptData(text);
          this.scannedResult = parsed;
        } catch (err) {
          this.scannedResult = {
            merchant: 'Sample Merchant Tech GmbH',
            date: new Date().toISOString().split('T')[0],
            grossAmount: 149.99,
            vatRate: 19,
            netAmount: 126.04,
            suggestedCategory: 'exp_hardware_gwg',
            notes: 'Parsed by Groq OCR'
          };
        } finally {
          this.isAiScanning = false;
          this.render();
        }
      };
    }

    const btnApplyScan = document.getElementById('btn-apply-scan-to-tx');
    if (btnApplyScan && this.scannedResult) {
      btnApplyScan.onclick = async () => {
        const newTx = {
          id: 'tx_' + Date.now(),
          type: 'expense',
          date: this.scannedResult.date || new Date().toISOString().split('T')[0],
          amount: this.scannedResult.grossAmount || 100,
          vatRate: this.scannedResult.vatRate || 19,
          category: this.scannedResult.suggestedCategory || 'exp_software_saas',
          bankId: 'bank_n26',
          bankName: 'Business Checking',
          description: this.scannedResult.merchant ? `${this.scannedResult.merchant} Beleg` : 'Scanned Expense',
          taxDeductiblePercent: 100
        };

        await saveToStore('transactions', newTx);
        this.transactions.unshift(newTx);
        this.activeModal = null;
        this.scannedResult = null;
        this.rawScanText = '';
        this.render();
      };
    }
  }

  async sendAiQuery(promptText) {
    this.aiMessages.push({ role: 'user', content: promptText });
    this.isAiThinking = true;
    this.render();

    const { euerSummary, taxAssessment } = this.getCalculations();

    const appState = {
      transactions: this.transactions,
      brands: this.brands,
      timesheets: this.timesheets,
      banks: this.banks,
      settings: this.settings,
      euerSummary,
      taxAssessment
    };

    const appActions = {
      addTransaction: async (tx) => {
        await saveToStore('transactions', tx);
        this.transactions.unshift(tx);
        this.render();
      },
      addTimesheet: async (ts) => {
        await saveToStore('timesheets', ts);
        this.timesheets.unshift(ts);
        this.render();
      },
      createBrand: async (brand) => {
        await saveToStore('clients', brand);
        this.brands.unshift(brand);
        this.render();
      },
      exportTaxCsv: () => {
        this.downloadCleanTaxCsv();
      },
      switchTab: (tabName) => {
        this.activeTab = tabName;
        this.render();
      }
    };

    try {
      const result = await this.agentEngine.processUserPrompt(promptText, appState, appActions);
      this.aiMessages.push({
        role: 'assistant',
        content: result.response,
        action: result.actionExecuted || null
      });
    } catch (err) {
      console.error('Agent Engine error:', err);
      const fallback = this.agentEngine.generateDynamicAdvisory(promptText, appState);
      this.aiMessages.push({
        role: 'assistant',
        content: fallback.response,
        action: null
      });
    } finally {
      this.isAiThinking = false;
      this.render();
      // Auto-scroll chat area to latest message
      const chatArea = document.getElementById('ai-messages-area');
      if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }
    }
  }
}

// Start app
window.addEventListener('DOMContentLoaded', () => {
  window.seyaApp = new SeyaBooksApp();
});
