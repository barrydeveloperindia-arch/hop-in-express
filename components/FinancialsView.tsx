
import React, { useState, useMemo } from 'react';
import { LedgerEntry, Transaction, InventoryItem, Supplier, Bill, Expense, SalaryRecord, LedgerAccount, ViewType, VatBandSummary } from '../types';
import { SHOP_INFO } from '../constants';

interface FinancialsViewProps {
  ledger: LedgerEntry[];
  setLedger: React.Dispatch<React.SetStateAction<LedgerEntry[]>>;
  transactions: Transaction[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  bills: Bill[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  salaries: SalaryRecord[];
  postToLedger: (entries: Omit<LedgerEntry, 'id' | 'timestamp'>[]) => void;
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  logAction: (action: string, module: ViewType, details: string, severity?: 'Info' | 'Warning' | 'Critical') => void;
}

type FinancialSubModule = 'overview' | 'sales-ledger' | 'purchase-ledger' | 'master-register' | 'vat-summary' | 'sales-analytics' | 'costing-analytics';

const FinancialOverview: React.FC<{
  ledger: LedgerEntry[];
  setActiveModule?: (module: FinancialSubModule) => void;
}> = ({ ledger, setActiveModule }) => {
  const stats = useMemo(() => {
    const balances: Record<string, number> = {
      revenue: 0,
      cogs: 0,
      opex: 0, // Operational + Payroll
      assets: 0, // Cash + Bank
      liabilities: 0, // VAT + Payable
      inventory: 0
    };

    ledger.forEach(entry => {
      // Helper to handle Debit/Credit direction based on Account Type
      // Liability/Income: Credit +, Debit -
      // Asset/Expense: Debit +, Credit -

      const amt = entry.amount;
      const isCredit = entry.type === 'Credit';

      switch (entry.account) {
        case 'Sales Revenue':
          balances.revenue += isCredit ? amt : -amt;
          break;
        case 'Cost of Goods Sold':
          balances.cogs += isCredit ? -amt : amt;
          break;
        case 'Operational Expense':
        case 'Payroll Expense':
          balances.opex += isCredit ? -amt : amt;
          break;
        case 'Cash in Hand':
        case 'Bank Account':
          balances.assets += isCredit ? -amt : amt;
          break;
        case 'VAT Liability':
        case 'Accounts Payable':
          balances.liabilities += isCredit ? amt : -amt;
          break;
        case 'Inventory Asset':
          balances.inventory += isCredit ? -amt : amt;
          break;
      }
    });

    const grossProfit = balances.revenue - balances.cogs;
    const netProfit = grossProfit - balances.opex;
    const grossMargin = balances.revenue ? (grossProfit / balances.revenue) * 100 : 0;
    const netMargin = balances.revenue ? (netProfit / balances.revenue) * 100 : 0;

    return {
      revenue: balances.revenue,
      cogs: balances.cogs,
      opex: balances.opex,
      assets: balances.assets,
      liabilities: balances.liabilities,
      inventory: balances.inventory,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin
    };
  }, [ledger]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-black text-ink-base uppercase tracking-tighter">Financial Intelligence</h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time P&L & Balance Sheet Metrics</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Liquid Assets</p>
          <p className="text-2xl font-black font-mono text-ink-base">{SHOP_INFO.currency}{stats.assets.toLocaleString()}</p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-surface-elevated p-6 rounded-[2rem] border border-surface-highlight shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 rotate-12 text-5xl group-hover:scale-125 transition-transform">💰</div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
          <h5 className="text-3xl font-black mt-3 font-mono text-emerald-600">{SHOP_INFO.currency}{stats.revenue.toLocaleString()}</h5>
          <div className="mt-4 flex gap-2">
            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg uppercase">Gross Income</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-[#0F172A] p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 -rotate-12 text-5xl text-indigo-500">📈</div>
          <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Net Profit (EBITDA)</p>
          <h5 className="text-3xl font-black mt-3 font-mono text-white">{SHOP_INFO.currency}{stats.netProfit.toLocaleString()}</h5>
          <div className="mt-4 flex gap-2">
            <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase ${stats.netMargin > 15 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
              {stats.netMargin.toFixed(1)}% Margin
            </span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-surface-elevated p-6 rounded-[2rem] border border-surface-highlight shadow-sm group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Op. Expenses</p>
          <h5 className="text-3xl font-black mt-3 font-mono text-rose-500">{SHOP_INFO.currency}{stats.opex.toLocaleString()}</h5>
          <p className="text-[10px] font-bold text-slate-300 mt-4 uppercase">Includes Payroll & Overheads</p>
        </div>

        {/* COGS */}
        <div
          onClick={() => setActiveModule && setActiveModule('costing-analytics')}
          className="bg-surface-elevated p-6 rounded-[2rem] border border-surface-highlight shadow-sm group cursor-pointer hover:border-amber-400 transition-all active:scale-95 relative overflow-hidden"
        >
          <div className="flex justify-between items-start z-10 relative">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost of Goods</p>
            <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Analyze →</span>
          </div>
          <h5 className="text-3xl font-black mt-3 font-mono text-amber-500 z-10 relative">{SHOP_INFO.currency}{stats.cogs.toLocaleString()}</h5>
          <div className="mt-4 flex gap-2 z-10 relative">
            <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-lg uppercase">{stats.grossMargin.toFixed(1)}% Gross Margin</span>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500 transform rotate-12 group-hover:scale-110 transition-transform">
            <span className="text-8xl">🏷️</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-highlight/30 p-6 rounded-3xl border border-surface-highlight flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Liabilities</p>
            <p className="text-xl font-black font-mono text-ink-base mt-1">{SHOP_INFO.currency}{stats.liabilities.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase">VAT & Payables</p>
          </div>
        </div>
        <div className="bg-surface-highlight/30 p-6 rounded-3xl border border-surface-highlight flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Valuation</p>
            <p className="text-xl font-black font-mono text-ink-base mt-1">{SHOP_INFO.currency}{(stats.inventory + stats.assets).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Cash + Stock</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const VatAnalysis: React.FC<{
  transactions: Transaction[];
}> = ({ transactions }) => {
  const [vatDateRange, setVatDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const vatSummaryData = useMemo(() => {
    const filteredTx = transactions.filter(t => t.timestamp >= vatDateRange.start && t.timestamp <= (vatDateRange.end + 'T23:59:59'));
    let totalGross = 0;
    let totalVat = 0;
    const breakdown: Record<number, VatBandSummary> = {
      0: { gross: 0, net: 0, vat: 0 },
      5: { gross: 0, net: 0, vat: 0 },
      20: { gross: 0, net: 0, vat: 0 }
    };

    filteredTx.forEach(t => {
      totalGross += t.total;
      totalVat += t.vatTotal;
      if (t.vatBreakdown) {
        Object.entries(t.vatBreakdown).forEach(([rate, data]) => {
          const r = parseInt(rate);
          const vatData = data as VatBandSummary;
          if (breakdown[r]) {
            breakdown[r].gross += vatData.gross;
            breakdown[r].net += vatData.net;
            breakdown[r].vat += vatData.vat;
          }
        });
      }
    });
    return { totalGross, totalNet: totalGross - totalVat, totalVat, breakdown };
  }, [transactions, vatDateRange]);

  return (
    <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h3 className="text-3xl font-black text-ink-base uppercase tracking-tighter">VAT Analysis Engine</h3>
        <div className="flex items-center gap-4 bg-surface-elevated border border-surface-highlight p-2 rounded-2xl shadow-sm">
          <input
            type="date"
            value={vatDateRange.start}
            onChange={e => setVatDateRange({ ...vatDateRange, start: e.target.value })}
            className="bg-transparent text-[10px] font-black uppercase outline-none px-3 cursor-pointer"
          />
          <span className="text-slate-300 text-[10px] font-black">TO</span>
          <input
            type="date"
            value={vatDateRange.end}
            onChange={e => setVatDateRange({ ...vatDateRange, end: e.target.value })}
            className="bg-transparent text-[10px] font-black uppercase outline-none px-3 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0F172A] p-6 md:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 scale-150 text-7xl">⚖️</div>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Total VAT Liability</p>
          <h4 className="text-5xl font-black font-mono tracking-tighter text-emerald-400">
            {SHOP_INFO.currency}{vatSummaryData.totalVat.toFixed(2)}
          </h4>
          <p className="text-[10px] font-bold text-ink-muted uppercase mt-4">Verified for period: {vatDateRange.start} - {vatDateRange.end}</p>
        </div>
        <div className="bg-surface-elevated p-6 md:p-10 rounded-[2.5rem] border border-surface-highlight shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Net Trading Revenue</p>
          <h4 className="text-5xl font-black font-mono tracking-tighter text-ink-base">
            {SHOP_INFO.currency}{vatSummaryData.totalNet.toFixed(2)}
          </h4>
          <div className="w-12 h-1 bg-indigo-600 mt-4 rounded-full"></div>
        </div>
      </div>

      <div className="bg-surface-elevated rounded-[2.5rem] border border-surface-highlight shadow-sm overflow-hidden">
        <div className="px-10 py-6 bg-surface-elevated border-b border-slate-100">
          <p className="text-[10px] font-black text-ink-base uppercase tracking-widest">HMRC Tax Band Reconciliation</p>
        </div>
        <table className="w-full text-left hidden md:table">
          <thead className="bg-surface-elevated text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b">
            <tr>
              <th className="px-10 py-6">UK Tax Classification</th>
              <th className="px-10 py-6 text-right">Gross Volume</th>
              <th className="px-10 py-6 text-right">Net Value</th>
              <th className="px-10 py-6 text-right">VAT Collected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[20, 5, 0].map(rate => (
              <tr key={rate} className="hover:bg-surface-elevated/50 transition-all group font-bold">
                <td className="px-10 py-7">
                  <span className="text-xs font-black uppercase text-ink-base">
                    {rate === 0 ? 'Zero-Rated' : rate === 5 ? 'Reduced Rate' : 'Standard Rate'} ({rate}%)
                  </span>
                </td>
                <td className="px-10 py-7 text-right font-mono text-sm">
                  {SHOP_INFO.currency}{vatSummaryData.breakdown[rate].gross.toFixed(2)}
                </td>
                <td className="px-10 py-7 text-right font-mono text-sm text-ink-muted">
                  {SHOP_INFO.currency}{vatSummaryData.breakdown[rate].net.toFixed(2)}
                </td>
                <td className="px-10 py-7 text-right font-mono text-base text-indigo-600">
                  {SHOP_INFO.currency}{vatSummaryData.breakdown[rate].vat.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile VAT Cards */}
        <div className="md:hidden p-4 space-y-4 bg-surface-elevated">
          {[20, 5, 0].map(rate => (
            <div key={rate} className="bg-surface-elevated p-5 rounded-2xl border border-surface-highlight shadow-sm flex flex-col gap-4">
              <div>
                <span className="text-xs font-black uppercase text-ink-base block">
                  {rate === 0 ? 'Zero-Rated' : rate === 5 ? 'Reduced Rate' : 'Standard Rate'} ({rate}%)
                </span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Classification</p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400">Gross</p>
                  <p className="font-mono font-bold text-ink-base">{SHOP_INFO.currency}{vatSummaryData.breakdown[rate].gross.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase text-slate-400">Net</p>
                  <p className="font-mono font-bold text-ink-muted">{SHOP_INFO.currency}{vatSummaryData.breakdown[rate].net.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-black uppercase text-indigo-900">VAT Collected</span>
                <span className="font-black font-mono text-indigo-600">{SHOP_INFO.currency}{vatSummaryData.breakdown[rate].vat.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex items-center gap-6">
        <span className="text-3xl">ℹ️</span>
        <p className="text-[10px] font-black text-indigo-900 uppercase leading-relaxed tracking-widest">
          This summary uses live point-of-sale data from the selected period.
          Ensure all refunds and manual ledger adjustments are finalized before exporting for HMRC submission.
        </p>
      </div>
    </div>
  );
};

import { auth } from '../lib/firebase';
import { addExpense } from '../lib/firestore';
import { DailySalesRecord } from '../types';
import * as XLSX from 'xlsx';
import { batchImportDailySales, subscribeToDailySales } from '../lib/firestore';
import SalesLedgerDashboard from './SalesLedgerDashboard';
import CostingDashboard from './CostingDashboard';

const SalesLedger: React.FC = () => {
  const [salesData, setSalesData] = useState<DailySalesRecord[]>([]);

  // Subscribe to data
  React.useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = subscribeToDailySales(auth.currentUser.uid, setSalesData);
    return () => unsubscribe();
  }, []);

  const handleImportSales = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // PARSING LOGIC FOR "DAILY SALES" SHEET
        // Expecting headers in row 4 (index 3) based on screenshot, but let's scan for "Date"
        let headerRowIdx = -1;
        for (let i = 0; i < rows.length; i++) {
          const row: any = rows[i];
          if (row && row.some((c: any) => String(c).includes('Date') || String(c).includes('Alcohol'))) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          alert('Could not find header row (looking for "Date" or "Alcohol").');
          return;
        }

        const headers = (rows[headerRowIdx] as any[]).map(h => String(h).trim());
        console.log('Headers found:', headers);

        // Helper to find index
        const findIdx = (str: string) => headers.findIndex(h => h.toLowerCase().includes(str.toLowerCase()));

        const idx = {
          date: findIdx('Date'),
          alcohol: findIdx('Alcohol'),
          tobacco: findIdx('Tabacco') > -1 ? findIdx('Tabacco') : findIdx('Smoking'),
          drinks: findIdx('Drinks'),
          confect: findIdx('Confect'),
          groceries: findIdx('Groceries'),
          household: findIdx('House'), // House hold
          snacks: findIdx('Snacks'),
          misc: findIdx('Misc'),
          paypoint: findIdx('Paypoint'),
          pet: findIdx('Pet'),
          total: findIdx('Total Category'),
          cashComp: findIdx('Cash Component'),
          cashPurch: findIdx('Cash Purchase'),
          balance: findIdx('Balance')
        };

        const records: DailySalesRecord[] = [];

        for (let i = headerRowIdx + 1; i < rows.length; i++) {
          const row: any = rows[i];
          if (!row || !row[idx.date]) continue; // Skip empty rows

          // Parse Date - Excel dates are numbers usually 
          let dateStr = row[idx.date];
          if (typeof dateStr === 'number') {
            const dateObj = XLSX.SSF.parse_date_code(dateStr);
            // padStart only works on strings, so we convert. 
            // Note: dateObj.m is 1-12
            const y = dateObj.y;
            const m = String(dateObj.m).padStart(2, '0');
            const d = String(dateObj.d).padStart(2, '0');
            dateStr = `${y}-${m}-${d}`;
          } else {
            // Fallback string parsing if needed
            // Try to assume YYYY-MM-DD or use new Date
            try {
              dateStr = new Date(dateStr).toISOString().split('T')[0];
            } catch (e) {
              console.warn('Date parse fail', dateStr);
            }
          }

          const getNum = (ix: number) => {
            if (ix === -1) return 0;
            const val = row[ix];
            if (typeof val === 'number') return val;
            return parseFloat(String(val).replace(/[£,]/g, '')) || 0;
          };

          const record: DailySalesRecord = {
            id: dateStr, // Use date as ID for easy dedupe
            date: dateStr,
            dayOfWeek: new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'long' }),
            categoryBreakdown: {
              alcohol: getNum(idx.alcohol),
              tobacco: getNum(idx.tobacco),
              lottery: getNum(idx.confect), // Mapping confect/lotto
              drinks: getNum(idx.drinks),
              groceries: getNum(idx.groceries),
              household: getNum(idx.household),
              snacks: getNum(idx.snacks),
              paypoint: getNum(idx.paypoint),
              news: 0,
              other: getNum(idx.misc) + getNum(idx.pet)
            },
            totalSales: getNum(idx.total),
            cashTaken: getNum(idx.cashComp), // Assuming "Cash Component" matches
            cardTaken: getNum(idx.total) - getNum(idx.cashComp), // Derived? Or explicit?
            cashPurchases: getNum(idx.cashPurch),
            netBalance: getNum(idx.total) - getNum(idx.cashPurch), // Using provided logic or Balance col?
            timestamp: new Date().toISOString()
          };

          // Correction: use actual Balance col if valid?
          if (idx.balance > -1) {
            // record.netBalance = getNum(idx.balance); // Often empty in sheet
          }

          records.push(record);
        }

        if (records.length > 0) {
          const confirmMsg = `Found ${records.length} daily entries.\nFirst: ${records[0].date}\nLast: ${records[records.length - 1].date}\nImport?`;
          if (confirm(confirmMsg)) {
            if (auth.currentUser) {
              await batchImportDailySales(auth.currentUser.uid, records);
              alert(`Successfully imported ${records.length} days of sales.`);
            }
          }
        } else {
          alert("No valid records found.");
        }

      } catch (err) {
        console.error(err);
        alert("Error parsing Sales Sheet: " + err);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-black text-ink-base uppercase tracking-tighter">Sales Ledger</h3>
        <label className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-colors cursor-pointer shadow-lg hover:shadow-emerald-500/30">
          Topic: Import Sales Sheet
          <input type="file" onChange={handleImportSales} accept=".xlsx, .xls" className="hidden" />
        </label>
      </div>

      <div className="bg-surface-elevated rounded-[2.5rem] border border-surface-highlight shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-surface-elevated text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr>
                <th className="px-6 py-4 sticky left-0 bg-surface-elevated">Date</th>
                <th className="px-6 py-4 text-right">Total Sales</th>
                <th className="px-6 py-4 text-right text-emerald-600">Cash Taken</th>
                <th className="px-6 py-4 text-right text-rose-500">Cash Purch</th>
                <th className="px-6 py-4 text-right border-l">Alcohol</th>
                <th className="px-6 py-4 text-right">Tobacco</th>
                <th className="px-6 py-4 text-right">Groceries</th>
                <th className="px-6 py-4 text-right">Paypoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-bold text-ink-base">
              {salesData.map(row => (
                <tr key={row.id} className="hover:bg-indigo-50/50 transition-colors">
                  <td className="px-6 py-4 sticky left-0 bg-surface-elevated">{row.date} <span className="text-slate-400 font-normal ml-2">{row.dayOfWeek?.slice(0, 3)}</span></td>
                  <td className="px-6 py-4 text-right">{row.totalSales.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-emerald-600">{row.cashTaken.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-rose-500">{row.cashPurchases.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right border-l text-ink-muted">{row.categoryBreakdown.alcohol.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-ink-muted">{row.categoryBreakdown.tobacco.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-ink-muted">{row.categoryBreakdown.groceries.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-ink-muted">{row.categoryBreakdown.paypoint.toFixed(2)}</td>
                </tr>
              ))}
              {salesData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 uppercase tracking-widest">No Sales Data Imported</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Sales Cards */}
        <div className="md:hidden p-4 space-y-4 bg-surface-elevated">
          {salesData.length === 0 ? (
            <div className="p-10 text-center text-slate-400 uppercase tracking-widest text-xs">No Sales Data Imported</div>
          ) : (
            salesData.map(row => (
              <div key={row.id} className="bg-surface-elevated p-5 rounded-2xl border border-surface-highlight shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-ink-base uppercase text-xs">{row.date}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">{row.dayOfWeek}</p>
                  </div>
                  <span className="text-xl font-black font-mono text-ink-base">{row.totalSales.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <div className="bg-emerald-50 p-2 rounded-lg text-center">
                    <p className="text-[8px] font-black uppercase text-emerald-700">Cash Taken</p>
                    <p className="font-bold text-emerald-600 font-mono text-sm">{row.cashTaken.toFixed(2)}</p>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg text-center">
                    <p className="text-[8px] font-black uppercase text-rose-700">Cash Purch</p>
                    <p className="font-bold text-rose-600 font-mono text-sm">{row.cashPurchases.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-ink-muted font-bold uppercase p-3 bg-surface-elevated rounded-xl">
                  <div className="flex justify-between"><span>Alc:</span> <span>{row.categoryBreakdown.alcohol.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tob:</span> <span>{row.categoryBreakdown.tobacco.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Groc:</span> <span>{row.categoryBreakdown.groceries.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>PayPt:</span> <span>{row.categoryBreakdown.paypoint.toFixed(2)}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ExpenseManager: React.FC<{
  expenses: Expense[];
  postToLedger: (entries: Omit<LedgerEntry, 'id' | 'timestamp'>[]) => void;
  logAction: (action: string, module: ViewType, details: string, severity?: 'Info' | 'Warning' | 'Critical') => void;
}> = ({ expenses, postToLedger, logAction }) => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    category: 'Operational Expense'
  });
  const [paymentAccount, setPaymentAccount] = useState<LedgerAccount>('Cash in Hand');

  const handleAdd = async () => {
    if (!auth.currentUser) return;
    if (!formData.description || !formData.amount || !formData.category) {
      alert("Please fill in all fields");
      return;
    }

    const expenseId = crypto.randomUUID();
    const newExpense: Expense = {
      id: expenseId,
      date: formData.date || new Date().toISOString(),
      description: formData.description,
      amount: formData.amount,
      category: formData.category
    };

    try {
      await addExpense(auth.currentUser.uid, newExpense);

      // Post to Ledger
      // Debit Expense Account, Credit Asset Account (Cash/Bank)
      postToLedger([
        {
          account: formData.category as LedgerAccount, // Assuming category matches LedgerAccount or mapped 
          type: 'Debit',
          amount: formData.amount,
          referenceId: expenseId,
          description: formData.description,
          category: 'Expense'
        },
        {
          account: paymentAccount,
          type: 'Credit',
          amount: formData.amount,
          referenceId: expenseId,
          description: `Payment for ${formData.description}`,
          category: 'Expense'
        }
      ]);

      logAction('Expense Recorded', 'expenses', `Added expense: ${formData.description} - Un£${formData.amount}`, 'Info');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category: 'Operational Expense'
      });
      alert('Expense recorded successfully');
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to save expense");
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <h3 className="text-3xl font-black text-ink-base uppercase tracking-tighter">Operational Expenses</h3>

      <div className="bg-surface-elevated p-6 md:p-8 rounded-[2.5rem] border border-surface-highlight shadow-sm">
        <h4 className="text-xl font-black text-ink-base uppercase mb-6">Record New Expense</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface-elevated border border-surface-highlight p-4 rounded-xl font-bold text-ink-base outline-none focus:border-indigo-600"
              placeholder="e.g. Utility Bill"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount ({SHOP_INFO.currency})</label>
            <input
              type="number"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full bg-surface-elevated border border-surface-highlight p-4 rounded-xl font-bold text-ink-base outline-none focus:border-indigo-600"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-surface-elevated border border-surface-highlight p-4 rounded-xl font-bold text-ink-base outline-none focus:border-indigo-600"
            >
              <option value="Operational Expense">Operational Expense</option>
              <option value="Payroll Expense">Payroll Expense</option>
              <option value="Cost of Goods Sold">Cost of Goods Sold (Ad-hoc)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Source</label>
            <select
              value={paymentAccount}
              onChange={e => setPaymentAccount(e.target.value as LedgerAccount)}
              className="w-full bg-surface-elevated border border-surface-highlight p-4 rounded-xl font-bold text-ink-base outline-none focus:border-indigo-600"
            >
              <option value="Cash in Hand">Cash in Hand</option>
              <option value="Bank Account">Bank Account</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-surface-elevated border border-surface-highlight p-4 rounded-xl font-bold text-ink-base outline-none focus:border-indigo-600"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors w-full md:w-auto"
        >
          Record Expense
        </button>
      </div>

      <div className="bg-surface-elevated rounded-[2.5rem] border border-surface-highlight shadow-sm overflow-hidden">
        <div className="px-10 py-6 bg-surface-elevated border-b border-slate-100">
          <p className="text-[10px] font-black text-ink-base uppercase tracking-widest">Recent Expenses</p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-left hidden md:table">
            <thead className="bg-surface-elevated text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b sticky top-0">
              <tr>
                <th className="px-10 py-4">Date</th>
                <th className="px-10 py-4">Description</th>
                <th className="px-10 py-4">Category</th>
                <th className="px-10 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.slice().reverse().map(exp => (
                <tr key={exp.id} className="hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-10 py-4 font-mono text-xs">{exp.date}</td>
                  <td className="px-10 py-4 font-bold text-ink-base">{exp.description}</td>
                  <td className="px-10 py-4 text-xs uppercase text-ink-muted">{exp.category}</td>
                  <td className="px-10 py-4 text-right font-mono font-bold text-rose-600">
                    {SHOP_INFO.currency}{exp.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No expenses recorded</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Expense Cards */}
          <div className="md:hidden p-4 space-y-4 bg-surface-elevated">
            {expenses.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No expenses recorded</div>
            ) : (
              expenses.slice().reverse().map(exp => (
                <div key={exp.id} className="bg-surface-elevated p-5 rounded-2xl border border-surface-highlight shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-ink-base uppercase text-sm">{exp.description}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{exp.date}</p>
                    </div>
                    <span className="font-black font-mono text-rose-600">{SHOP_INFO.currency}{exp.amount.toFixed(2)}</span>
                  </div>
                  <span className="self-start px-2 py-1 bg-surface-highlight text-ink-muted text-[8px] font-black uppercase rounded">{exp.category}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialsView: React.FC<FinancialsViewProps> = ({
  ledger, transactions, inventory, suppliers, bills, expenses, setExpenses, salaries, postToLedger, setBills, setSuppliers, logAction
}) => {
  const [activeModule, setActiveModule] = useState<FinancialSubModule | 'expenses'>('overview');

  return (
    <div className="flex flex-col lg:flex-row gap-12 min-h-[900px] animate-in fade-in duration-700">
      <aside className="w-full lg:w-80 shrink-0 space-y-4">
        <div className="bg-surface-elevated rounded-[2.5rem] border border-surface-highlight p-6 shadow-xl">
          <p className="px-6 py-4 text-[10px] font-black text-ink-base uppercase tracking-[0.3em] border-b mb-4">Master Controls</p>
          {[
            { id: 'overview', label: 'Financial Matrix', icon: '📊' },
            { id: 'sales-analytics', label: 'Sales Analytics', icon: '📈' },
            { id: 'sales-ledger', label: 'Daily Sales Import', icon: '🛒' },
            { id: 'vat-summary', label: 'VAT Breakdown', icon: '📜' },
            { id: 'expenses', label: 'Op. Expenses', icon: '💸' },
            { id: 'master-register', label: 'Master Register', icon: '📕' }
          ].map(module => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all ${activeModule === module.id ? 'bg-indigo-600 text-white shadow-2xl' : 'text-ink-muted hover:bg-surface-elevated'}`}
            >
              <span className="text-xl">{module.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-widest">{module.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        {activeModule === 'overview' && <FinancialOverview ledger={ledger} setActiveModule={setActiveModule as any} />}
        {activeModule === 'sales-analytics' && <SalesLedgerDashboard transactions={transactions} inventory={inventory} />}
        {activeModule === 'costing-analytics' && <CostingDashboard transactions={transactions} inventory={inventory} />}
        {activeModule === 'vat-summary' && <VatAnalysis transactions={transactions} />}
        {activeModule === 'expenses' && <ExpenseManager expenses={expenses} postToLedger={postToLedger} logAction={logAction} />}
        {/* Placeholders for other modules not requested for refactoring yet, but keeping structure */}
        {activeModule === 'sales-ledger' && <SalesLedger />}
        {activeModule === 'master-register' && <div className="p-10 text-center text-slate-400">Master Register Component Placeholder</div>}
      </main>
    </div>
  );
};

export default FinancialsView;
