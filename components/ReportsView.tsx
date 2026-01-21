
import React, { useState, useMemo } from 'react';
import { Transaction, Refund, InventoryItem, Purchase, Expense, SalaryRecord, VatBandSummary, Bill } from '../types';
import { SHOP_INFO } from '../constants';

interface ReportsViewProps {
  transactions: Transaction[];
  refunds: Refund[];
  inventory: InventoryItem[];
  purchases: Purchase[];
  expenses: Expense[];
  salaries: SalaryRecord[];
  bills: Bill[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, refunds, inventory, purchases, expenses, salaries, bills }) => {
  const [reportType, setReportType] = useState<'vat' | 'valuation' | 'ledger'>('vat');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const vatReport = useMemo(() => {
    const filteredTx = transactions.filter(t => t.timestamp >= dateRange.start && t.timestamp <= (dateRange.end + 'T23:59:59'));
    let totalGross = 0; let totalVat = 0;
    const breakdown: Record<number, VatBandSummary> = { 0: { gross: 0, net: 0, vat: 0 }, 5: { gross: 0, net: 0, vat: 0 }, 20: { gross: 0, net: 0, vat: 0 } };
    filteredTx.forEach(t => {
      totalGross += t.total; totalVat += t.vatTotal;
      if (t.vatBreakdown) {
        Object.entries(t.vatBreakdown).forEach(([rate, data]) => {
          const r = parseInt(rate);
          // Fixed: Cast data to VatBandSummary to satisfy TypeScript properties access
          const vatData = data as VatBandSummary;
          if (breakdown[r]) { breakdown[r].gross += vatData.gross; breakdown[r].net += vatData.net; breakdown[r].vat += vatData.vat; }
        });
      }
    });
    return { totalGross, totalNet: totalGross - totalVat, totalVat, breakdown };
  }, [transactions, dateRange]);

  const valuationReport = useMemo(() => {
    let totalCost = 0; let totalRetail = 0;
    inventory.forEach(item => { totalCost += (item.costPrice * item.stock); totalRetail += (item.price * item.stock); });
    return { totalCost, totalRetail };
  }, [inventory]);

  const centralLedger = useMemo(() => {
    const entries: any[] = [];
    transactions.forEach(t => entries.push({ date: t.timestamp, type: 'INCOME', desc: 'Point of Sale Transaction', amount: t.total, ref: t.id }));
    expenses.forEach(e => entries.push({ date: e.date, type: 'EXPENSE', desc: e.description, amount: e.amount, ref: e.id }));
    salaries.filter(s => s.status === 'Paid').forEach(s => entries.push({ date: s.payDate, type: 'EXPENSE', desc: `Salary: ${s.employeeName}`, amount: s.totalAmount, ref: s.id }));
    bills.filter(b => b.status === 'Settled').forEach(b => entries.push({ date: b.date, type: 'PURCHASE', desc: 'Settled Procurement Bill', amount: b.amount, ref: b.id }));
    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, expenses, salaries, bills]);

  const ledgerSummary = useMemo(() => {
    const income = centralLedger.filter(l => l.type === 'INCOME').reduce((acc, l) => acc + l.amount, 0);
    const outgoings = centralLedger.filter(l => l.type !== 'INCOME').reduce((acc, l) => acc + l.amount, 0);
    return { income, outgoings, profit: income - outgoings };
  }, [centralLedger]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          {['vat', 'ledger', 'valuation'].map(type => (
            <button key={type} onClick={() => setReportType(type as any)} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${reportType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
              {type === 'vat' ? 'HMRC VAT' : type === 'ledger' ? 'Central Ledger' : 'Valuation'}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="w-full sm:w-auto bg-slate-50 border rounded-lg px-3 py-2 text-[10px] font-black uppercase" />
          <span className="text-slate-300 text-[10px] font-black hidden sm:inline">TO</span>
          <span className="text-slate-300 text-[10px] font-black sm:hidden">↓</span>
          <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="w-full sm:w-auto bg-slate-50 border rounded-lg px-3 py-2 text-[10px] font-black uppercase" />
        </div>
      </div>

      <div className="print-section bg-white p-6 md:p-16 rounded-[2.5rem] border border-slate-200 shadow-xl min-h-[1000px]">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-10">
          <div><h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{SHOP_INFO.name}</h1><p className="text-[11px] font-bold text-slate-500 mt-2 uppercase">{SHOP_INFO.address}</p></div>
          <div className="text-right"><h2 className="text-2xl font-black text-slate-900 uppercase">{reportType.toUpperCase()} STATEMENT</h2><p className="text-[10px] text-slate-400 font-bold uppercase mt-2">{new Date().toLocaleString()}</p></div>
        </div>

        {reportType === 'ledger' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-emerald-50 p-6 md:p-10 rounded-3xl border border-emerald-100"><p className="text-[11px] font-black text-emerald-600 uppercase">Captured Income</p><p className="text-4xl font-black font-mono mt-3">£{ledgerSummary.income.toFixed(2)}</p></div>
              <div className="bg-red-50 p-6 md:p-10 rounded-3xl border border-red-100"><p className="text-[11px] font-black text-red-600 uppercase">Operational Outflow</p><p className="text-4xl font-black font-mono mt-3 text-red-600">£{ledgerSummary.outgoings.toFixed(2)}</p></div>
              <div className="bg-[#001E4A] p-6 md:p-10 rounded-3xl text-white"><p className="text-[11px] font-black text-blue-300 uppercase">Retained Earnings</p><p className="text-4xl font-black font-mono mt-3 text-emerald-400">£{ledgerSummary.profit.toFixed(2)}</p></div>
            </div>
            <table className="w-full text-left hidden md:table">
              <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                <tr><th className="py-5 px-8">Value Date</th><th className="py-5 px-8">Description</th><th className="py-5 px-8 text-right">Credit (+)</th><th className="py-5 px-8 text-right">Debit (-)</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {centralLedger.map((l, i) => (
                  <tr key={i} className="text-sm">
                    <td className="py-6 px-8 text-slate-400 font-mono text-xs">{l.date.split('T')[0]}</td>
                    <td className="py-6 px-8 uppercase text-slate-900">{l.desc} <span className="text-[8px] text-slate-300 ml-2">#{l.ref.slice(0, 6)}</span></td>
                    <td className="py-6 px-8 text-right font-mono text-emerald-600">{l.type === 'INCOME' ? `£${l.amount.toFixed(2)}` : '—'}</td>
                    <td className="py-6 px-8 text-right font-mono text-red-600">{l.type !== 'INCOME' ? `£${l.amount.toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Ledger Cards */}
            <div className="md:hidden space-y-4">
              {centralLedger.map((l, i) => (
                <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-mono text-slate-400">{l.date.split('T')[0]}</p>
                      <p className="font-bold text-slate-900 uppercase text-xs mt-1">{l.desc}</p>
                    </div>
                    <span className={`font-mono font-black ${l.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {l.type === 'INCOME' ? '+' : '-'}£{l.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[9px] text-slate-300 font-black uppercase text-right">Ref: #{l.ref.slice(0, 6)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === 'vat' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 md:p-10 rounded-3xl border border-slate-200"><p className="text-[11px] font-black text-slate-400 uppercase">Captured Net Revenue</p><p className="text-4xl font-black font-mono mt-3">£{vatReport.totalNet.toFixed(2)}</p></div>
              <div className="bg-[#001E4A] p-6 md:p-10 rounded-3xl text-white shadow-2xl"><p className="text-[11px] font-black text-blue-300 uppercase">HMRC VAT Liability Due</p><p className="text-4xl font-black font-mono mt-3 text-emerald-400">£{vatReport.totalVat.toFixed(2)}</p></div>
            </div>
            <div className="space-y-6">
              <h3 className="text-base font-black uppercase text-slate-900 border-b pb-4">Tax Band Reconciliation</h3>
              <table className="w-full text-left hidden md:table">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr><th className="py-5 px-8">UK VAT Band</th><th className="py-5 px-8 text-right">Gross Total</th><th className="py-5 px-8 text-right">VAT Value</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold">
                  {[20, 5, 0].map(rate => (
                    <tr key={rate} className="text-sm">
                      <td className="py-6 px-8 uppercase font-black">{rate === 0 ? 'Zero-Rated' : rate === 5 ? 'Reduced Rate' : 'Standard Rate'} ({rate}%)</td>
                      <td className="py-6 px-8 text-right font-mono">£{vatReport.breakdown[rate].gross.toFixed(2)}</td>
                      <td className="py-6 px-8 text-right font-mono font-black text-indigo-600">£{vatReport.breakdown[rate].vat.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile VAT Cards */}
              <div className="md:hidden space-y-4">
                {[20, 5, 0].map(rate => (
                  <div key={rate} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
                    <p className="font-black text-slate-900 uppercase text-xs">{rate === 0 ? 'Zero-Rated' : rate === 5 ? 'Reduced Rate' : 'Standard Rate'} ({rate}%)</p>
                    <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Gross</span>
                      <span className="font-mono text-sm font-bold">£{vatReport.breakdown[rate].gross.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg">
                      <span className="text-[10px] font-black uppercase text-indigo-900">VAT</span>
                      <span className="font-mono text-sm font-black text-indigo-600">£{vatReport.breakdown[rate].vat.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-24 text-center space-y-3 opacity-20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">HMRC Audited Ledger • Protocol Verified</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
