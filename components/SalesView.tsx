
import React, { useState, useMemo } from 'react';
import { InventoryItem, UserRole, ViewType, StaffMember, Transaction, VatBandSummary, LedgerEntry } from '../types';
import { SHOP_INFO } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { processTransaction } from '../lib/firestore';
import { auth } from '../lib/firebase';

interface SalesViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  refunds: any[];
  setRefunds: React.Dispatch<React.SetStateAction<any[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  userRole: UserRole;
  staff: StaffMember[];
  activeStaffId: string;
  logAction: (action: string, module: ViewType, details: string, severity?: 'Info' | 'Warning' | 'Critical') => void;
  onCheckoutComplete?: () => void;
  postToLedger: (entries: Omit<LedgerEntry, 'id' | 'timestamp'>[]) => void;
}

interface BasketItem {
  id: string;
  name: string;
  brand: string;
  packSize: string;
  price: number;
  costPrice: number;
  vatRate: number;
  qty: number;
  sku: string;
}

const SalesView: React.FC<SalesViewProps> = ({
  transactions, setTransactions, inventory, setInventory, activeStaffId, logAction, postToLedger, staff
}) => {
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Date Range for Analytics
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const currentStaffMember = useMemo(() => staff.find(s => s.id === activeStaffId), [staff, activeStaffId]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return inventory.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.barcode.includes(q) ||
      item.sku.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [inventory, searchQuery]);

  const addToBasket = (item: InventoryItem) => {
    if (item.stock <= 0) {
      alert(`⚠️ OUT OF STOCK: ${item.name} cannot be sold.`);
      return;
    }

    setBasket(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.qty >= item.stock) return prev;
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        brand: item.brand,
        packSize: item.packSize,
        price: item.price,
        costPrice: item.costPrice || item.lastBuyPrice || 0,
        vatRate: item.vatRate,
        qty: 1,
        sku: item.sku
      }];
    });
    setSearchQuery('');
  };

  const totals = useMemo(() => {
    const subtotal = basket.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const costTotal = basket.reduce((acc, i) => acc + (i.costPrice * i.qty), 0);
    const vatBreakdown: Record<number, VatBandSummary> = {
      0: { gross: 0, net: 0, vat: 0 },
      5: { gross: 0, net: 0, vat: 0 },
      20: { gross: 0, net: 0, vat: 0 }
    };

    basket.forEach(item => {
      const itemGross = item.price * item.qty;
      const rateMultiplier = item.vatRate / 100;
      const net = itemGross / (1 + rateMultiplier);
      const vat = itemGross - net;
      vatBreakdown[item.vatRate].gross += itemGross;
      vatBreakdown[item.vatRate].net += net;
      vatBreakdown[item.vatRate].vat += vat;
    });

    const vatTotal = Object.values(vatBreakdown).reduce((a, b) => a + b.vat, 0);
    return { subtotal, total: subtotal, costTotal, vatTotal, vatBreakdown };
  }, [basket]);

  // Daily Trend Data Calculation
  const trendData = useMemo(() => {
    const dailyMap: Record<string, number> = {};

    // Initialize dates in range to 0
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
      current.setDate(current.getDate() + 1);
    }

    // Populate with actual transactions
    transactions.forEach(t => {
      const tDate = t.timestamp.split('T')[0];
      if (dailyMap[tDate] !== undefined) {
        dailyMap[tDate] += t.total;
      }
    });

    return Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        revenue
      }));
  }, [transactions, startDate, endDate]);

  const handleCheckout = (method: 'Cash' | 'Card') => {
    if (basket.length === 0) return;

    const transactionId = crypto.randomUUID();
    const newTransaction: Transaction = {
      id: transactionId,
      timestamp: new Date().toISOString(),
      staffId: activeStaffId,
      staffName: currentStaffMember?.name || 'Unknown',
      subtotal: totals.total,
      discountAmount: 0,
      total: totals.total,
      vatTotal: totals.vatTotal,
      paymentMethod: method,
      items: basket.map(b => ({ ...b })),
      vatBreakdown: totals.vatBreakdown as any
    };

    postToLedger([
      { account: method === 'Cash' ? 'Cash in Hand' : 'Bank Account', type: 'Debit', amount: totals.total, referenceId: transactionId, description: `POS Sale #${transactionId.slice(0, 6)}`, category: 'Sales' },
      { account: 'Sales Revenue', type: 'Credit', amount: totals.total - totals.vatTotal, referenceId: transactionId, description: `Revenue Sale #${transactionId.slice(0, 6)}`, category: 'Sales' }
    ]);

    // Firestore Transaction
    const currentUser = auth.currentUser;
    if (currentUser) {
      processTransaction(currentUser.uid, newTransaction)
        .then(() => {
          logAction('POS Checkout', 'sales', `Checkout ${SHOP_INFO.currency}${totals.total.toFixed(2)}`, 'Info');
          setBasket([]);
        })
        .catch(err => {
          console.error("Transaction failed", err);
          alert("Transaction failed to process. Please try again.");
        });
    } else {
      alert("User not authenticated. Cannot process transaction.");
    }

    // Ledger Updates (Optimistic or we should move this to a side-effect of the transaction listener?)
    // For now, let's keep it here but in a real app, we might want to listen to the new transaction
    // and then update ledger. But since ledger is local state in App.tsx...
    // The requirement says "Implement remaining Firestore CRUD...". Ledger isn't mentioned as needing peristence
    // explicitly in the immediate goal, but it's part of the state.
    // Ideally we'd persist ledger too, but for this task I'll focus on the Transaction/Inventory persistence.
    // Use the callback to update local ledger state for UI feedback.
    postToLedger([
      { account: method === 'Cash' ? 'Cash in Hand' : 'Bank Account', type: 'Debit', amount: totals.total, referenceId: transactionId, description: `POS Sale #${transactionId.slice(0, 6)}`, category: 'Sales' },
      { account: 'Sales Revenue', type: 'Credit', amount: totals.total - totals.vatTotal, referenceId: transactionId, description: `Revenue Sale #${transactionId.slice(0, 6)}`, category: 'Sales' }
    ]);
  };

  return (
    <div className="space-y-8">
      {/* Sales Performance Analytics */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sales Revenue Trend</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Performance Matrix</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase outline-none px-3 cursor-pointer"
            />
            <span className="text-slate-300 text-[10px] font-black">TO</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase outline-none px-3 cursor-pointer"
            />
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }}
                tickFormatter={(val) => `${SHOP_INFO.currency}${val}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                  padding: '12px'
                }}
                labelStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#64748b', marginBottom: '4px' }}
                itemStyle={{ fontWeight: 900, color: '#4F46E5', fontSize: '14px' }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4F46E5"
                strokeWidth={4}
                dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 lg:pb-0">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
            <div className="relative group">
              <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 text-xl">🔍</span>
              <input
                type="text"
                placeholder="Scan / Search Assets..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}

                className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] pl-20 pr-10 py-6 md:py-8 text-base md:text-lg font-black outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner uppercase"
              />
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-50 overflow-hidden divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => addToBasket(item)}
                      disabled={item.stock <= 0}
                      className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-50 transition-colors group/item"
                    >
                      <div className="space-y-1">
                        <p className="font-black text-slate-900 uppercase text-sm leading-tight">
                          <span className="text-indigo-600 mr-2">{item.brand}</span>
                          {item.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          SKU: {item.sku} • Bal: {item.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl text-slate-900 group-hover/item:text-indigo-600 transition-colors">{SHOP_INFO.currency}{item.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="min-h-[400px] flex flex-col gap-4">
              {basket.map(item => (
                <div key={item.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                  <div className="flex-1 w-full md:w-auto text-center md:text-left">
                    <h6 className="font-black text-slate-900 text-sm uppercase leading-tight">{item.brand} {item.name}</h6>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">
                      {SHOP_INFO.currency}{item.price.toFixed(2)} • VAT {item.vatRate}%
                    </p>
                  </div>
                  <div className="flex items-center gap-4 md:gap-8 justify-between w-full md:w-auto">
                    <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl gap-4 border border-slate-100">
                      <button onClick={() => setBasket(b => b.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm font-black text-slate-400 hover:text-rose-600 transition-colors">-</button>
                      <span className="text-xl font-black font-mono w-8 text-center text-slate-900">{item.qty}</span>
                      <button onClick={() => setBasket(b => b.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))} className="w-10 h-10 bg-white border border-slate-200 rounded-xl shadow-sm font-black text-slate-400 hover:text-indigo-600 transition-colors">+</button>
                    </div>
                    <div className="w-24 md:w-32 text-right">
                      <p className="text-xl md:text-2xl font-black font-mono text-slate-900 tracking-tighter">{SHOP_INFO.currency}{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {basket.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-20">
                  <span className="text-8xl mb-8 text-indigo-200">🛒</span>
                  <p className="font-black uppercase tracking-[0.4em] text-slate-900 text-center px-4">Basket Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {/* Mobile Pay Bar (Fixed Bottom) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0F172A] p-6 rounded-t-[2rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] z-[100] border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Total</p>
              <h3 className="text-3xl font-black font-mono text-white tracking-tighter">{SHOP_INFO.currency}{totals.total.toFixed(2)}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleCheckout('Cash')} disabled={basket.length === 0} className="bg-emerald-600 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-lg active:scale-95 transition-all">Cash</button>
              <button onClick={() => handleCheckout('Card')} disabled={basket.length === 0} className="bg-indigo-600 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white shadow-lg active:scale-95 transition-all">Card</button>
            </div>
          </div>

          {/* Desktop Pay Panel */}
          <div className="hidden lg:block bg-[#0F172A] p-12 rounded-[3rem] text-white shadow-2xl space-y-12 sticky top-10">
            <div className="text-center space-y-4">
              <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.5em]">Total Settlement</p>
              <h3 className="text-7xl font-black font-mono tracking-tighter">{SHOP_INFO.currency}{totals.total.toFixed(2)}</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <button onClick={() => handleCheckout('Cash')} disabled={basket.length === 0} className="bg-emerald-600 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-emerald-700 transition-all shadow-xl">Settle Cash</button>
              <button onClick={() => handleCheckout('Card')} disabled={basket.length === 0} className="bg-indigo-600 py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-700 transition-all shadow-xl">Settle Card</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesView;
