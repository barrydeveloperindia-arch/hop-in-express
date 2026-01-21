
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryItem, Transaction, UserRole, AttendanceRecord, Bill } from '../types';
import { SHOP_INFO } from '../constants';

interface DashboardProps {
  transactions: Transaction[];
  inventory: InventoryItem[];
  role: UserRole;
  staff: any[];
  attendance: AttendanceRecord[];
  salaries?: any[];
  bills: Bill[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, inventory, role, attendance, bills }) => {
  const isFinancialRole = role === 'Owner' || role === 'Accountant';
  const todayStr = new Date().toISOString().split('T')[0];

  const financialSummary = useMemo(() => {
    const grossTotal = transactions.reduce((acc, t) => acc + t.total, 0);
    const unpaidBills = bills.filter(b => b.status === 'Unpaid').reduce((acc, b) => acc + b.amount, 0);
    return { grossTotal, unpaidBills };
  }, [transactions, bills]);

  const stockValuation = useMemo(() => inventory.reduce((acc, curr) => acc + ((Number(curr.stock) || 0) * (Number(curr.price) || 0)), 0), [inventory]);

  const trendData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    transactions.slice(-50).forEach(t => {
      const date = new Date(t.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      dailyMap[date] = (dailyMap[date] || 0) + t.total;
    });
    return Object.entries(dailyMap).map(([date, gross]) => ({ date, gross }));
  }, [transactions]);

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isFinancialRole ? (
          <div className="bg-[#0f766e] p-8 rounded-2xl shadow-lg text-white flex flex-col justify-between h-48 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 rotate-12 text-5xl">💷</div>
            <div>
              <p className="text-white/70 text-[9px] font-black uppercase tracking-widest">Gross Sales Volume</p>
              <h3 className="text-4xl font-black mt-2 font-mono">{SHOP_INFO.currency}{financialSummary.grossTotal.toLocaleString()}</h3>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 p-8 rounded-2xl text-white h-48 flex flex-col justify-center border-l-8 border-[#0f766e]">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">EPOS Terminal Access</p>
            <h3 className="text-2xl font-black uppercase tracking-tighter mt-2">{SHOP_INFO.name}</h3>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-48 flex flex-col justify-between group">
          <div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Inventory Realization</p>
            <h3 className="text-4xl font-black mt-2 font-mono text-slate-900 group-hover:text-teal-600 transition-colors">{SHOP_INFO.currency}{stockValuation.toLocaleString()}</h3>
          </div>
          <p className="text-[8px] font-bold text-slate-300 uppercase">Live Stock Asset Portfolio</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-48 flex flex-col justify-between">
          <div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Unpaid Liabilities</p>
            <h3 className="text-4xl font-black mt-2 font-mono text-rose-600">{SHOP_INFO.currency}{financialSummary.unpaidBills.toLocaleString()}</h3>
          </div>
          <p className="text-[8px] font-bold text-slate-300 uppercase">Outstanding Vendor Bills</p>
        </div>

        <div className="bg-[#0F172A] p-8 rounded-2xl shadow-lg text-white h-48 flex flex-col justify-between">
          <div>
            <p className="text-teal-300 text-[9px] font-black uppercase tracking-widest">Terminal Active Staff</p>
            <h3 className="text-4xl font-black mt-2 font-mono">{attendance.filter(a => a.date === todayStr && (a.status === 'Present' || a.status === 'Late')).length}</h3>
          </div>
          <p className="text-[8px] font-bold text-teal-300/40 uppercase">Verified Personnel on Premises</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 h-[300px] md:h-[400px]">
        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Integrated Revenue Analytics</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="gross" stroke="#0d9488" strokeWidth={4} fill="#0d948810" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
