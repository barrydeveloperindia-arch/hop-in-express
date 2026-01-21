
import React, { useState, useMemo, useRef } from 'react';
import { Purchase, Supplier, ViewType, AuditEntry, InventoryItem, AdjustmentLog, Bill } from '../types';
import { GoogleGenAI } from "@google/genai";

interface PurchasesViewProps {
  purchases: Purchase[];
  setPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  logAction: (action: string, module: ViewType, details: string, severity?: AuditEntry['severity']) => void;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
}

import { auth } from '../lib/firebase';
import { addPurchase, addBill, updateInventoryItem, updateSupplier, updatePurchase } from '../lib/firestore';

const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases, setPurchases, suppliers, setSuppliers, logAction, inventory, setInventory, bills, setBills
}) => {
  const [showManageRegistry, setShowManageRegistry] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const addReceiptRef = useRef<HTMLInputElement>(null);
  const editReceiptRef = useRef<HTMLInputElement>(null);

  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [editingPurchaseForm, setEditingPurchaseForm] = useState<Partial<Purchase>>({});

  const [formData, setFormData] = useState<Partial<Purchase & { itemId: string; qty: number; paymentMethod: string }>>({
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    itemId: '',
    qty: 0,
    amount: 0,
    paymentMethod: 'ON CREDIT',
    receiptData: ''
  });

  const processReceiptWithAI = async (base64Data: string) => {
    setIsScanning(true);
    try {
      // Use Vite env var or fallback
      const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY || '';
      if (!apiKey) {
        throw new Error("Missing Google AI Key (VITE_GOOGLE_AI_KEY)");
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze this receipt image for a UK Grocery Shop.
      Extract these details in strict JSON format:
      - total_amount (number)
      - date (YYYY-MM-DD string)
      - supplier_name (string, inferred from logo/header)
      - items_summary (string, brief list of key items)
      
      Output ONLY raw JSON. No markdown blocks.`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: base64Data.split(',')[1] } }
            ]
          }
        ],
        config: { responseMimeType: "application/json" }
      });

      const textData = response.text;
      const cleanText = (typeof textData === 'string' ? textData : JSON.stringify(textData) || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleanText);

      setFormData(prev => ({
        ...prev,
        amount: result.total_amount || prev.amount,
        date: result.date || prev.date,
        items: result.items_summary || prev.items,
        receiptData: base64Data
      }));

      logAction('AI Receipt Scan', 'purchases', `Extracted £${result.total_amount} from receipt.`, 'Info');
    } catch (error) {
      console.error("AI Scan Error:", error);
      alert("AI Vision failed to process the receipt. Please enter data manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isEdit) {
          setEditingPurchaseForm(prev => ({ ...prev, receiptData: base64 }));
        } else {
          processReceiptWithAI(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadReceipt = (purchase: Purchase) => {
    if (!purchase.receiptData) return;
    const link = document.createElement('a');
    link.href = purchase.receiptData;
    link.download = `Receipt_${purchase.invoiceNumber || purchase.id.slice(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction('Receipt Download', 'purchases', `Exported proof of payment for entry #${purchase.id.slice(0, 8)}`, 'Info');
  };

  const handleAdd = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    if (!formData.supplierId || !formData.amount || !formData.itemId || (formData.qty || 0) <= 0) {
      alert("Please specify Item, Quantity, Supplier and Total Invoice Value.");
      return;
    }

    const item = inventory.find(i => i.id === formData.itemId);
    const unitBuyPrice = (formData.amount || 0) / (formData.qty || 1);
    const purchaseId = crypto.randomUUID();
    const isSettled = formData.paymentMethod !== 'ON CREDIT';

    const newPurchase: Purchase = {
      id: purchaseId,
      date: formData.date || '',
      supplierId: formData.supplierId || '',
      items: formData.items || `${item?.name} (x${formData.qty})`,
      amount: formData.amount || 0,
      invoiceNumber: 'INV-' + Date.now().toString().slice(-6),
      status: 'Received',
      receiptData: formData.receiptData
    };

    const newBill: Bill = {
      id: crypto.randomUUID(),
      supplierId: formData.supplierId || '',
      purchaseId: purchaseId,
      date: formData.date || '',
      dueDate: new Date(new Date(formData.date!).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: formData.amount || 0,
      status: isSettled ? 'Settled' : 'Unpaid',
      note: isSettled ? `Settled via ${formData.paymentMethod}` : 'Purchased on credit'
    };

    const invItem = inventory.find(i => i.id === formData.itemId);

    try {
      // 1. Add Purchase
      await addPurchase(userId, newPurchase);

      // 2. Add Bill
      await addBill(userId, newBill);

      // 3. Update Inventory (Stock + Logs)
      if (invItem) {
        const newStock = invItem.stock + (formData.qty || 0);
        const newLog = {
          id: crypto.randomUUID(), date: new Date().toISOString(), type: 'relative',
          amount: formData.qty, previousStock: invItem.stock, newStock,
          reason: 'Inward', note: `Stock Inward: Unit Cost £${unitBuyPrice.toFixed(2)}`
        } as AdjustmentLog; // Cast to AdjustmentLog to satisfy type checker if needed

        await updateInventoryItem(userId, invItem.id, {
          stock: newStock,
          lastBuyPrice: unitBuyPrice,
          logs: [newLog, ...(invItem.logs || [])]
        });
      }

      // 4. Update Supplier
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      if (supplier) {
        await updateSupplier(userId, supplier.id, {
          totalSpend: supplier.totalSpend + (formData.amount || 0),
          outstandingBalance: supplier.outstandingBalance + (isSettled ? 0 : (formData.amount || 0)),
          orderCount: supplier.orderCount + 1,
          lastOrderDate: formData.date
        });
      }

      logAction('Asset Procurement', 'purchases', `Stock Inward: ${item?.name} x${formData.qty}. Settlement: ${formData.paymentMethod}. Value: £${formData.amount?.toFixed(2)}`, 'Info');

      setFormData({
        ...formData,
        supplierId: '',
        itemId: '',
        qty: 0,
        amount: 0,
        items: '',
        paymentMethod: 'ON CREDIT',
        receiptData: ''
      });
      alert(`Procurement verified and recorded.`);
    } catch (err) {
      console.error("Error processing procurement:", err);
      alert("Failed to record procurement. Please check connection and try again.");
    }
  };

  const startEditPurchase = (p: Purchase) => {
    setEditingPurchaseId(p.id);
    setEditingPurchaseForm({ ...p });
  };

  const savePurchaseEdit = async () => {
    if (!editingPurchaseId || !auth.currentUser) return;
    try {
      await updatePurchase(auth.currentUser.uid, editingPurchaseId, editingPurchaseForm);
      logAction('Procurement Edit', 'purchases', `Modified details of ledger entry #${editingPurchaseId.slice(0, 8)}`, 'Warning');
      setEditingPurchaseId(null);
    } catch (err) {
      console.error("Error updating purchase:", err);
      alert("Failed to update purchase.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        {isScanning && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="font-black uppercase text-[10px] tracking-widest text-slate-900">AI Vision Analyzing Receipt...</p>
          </div>
        )}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Stock Acquisition Interface</h4>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <button onClick={() => addReceiptRef.current?.click()} className="text-[10px] w-full md:w-auto font-black uppercase text-white bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg whitespace-nowrap">Scan Receipt with AI</button>
            <button onClick={() => setShowManageRegistry(true)} className="text-[10px] w-full md:w-auto font-black uppercase text-indigo-900 bg-slate-100 px-6 py-3 rounded-xl hover:bg-slate-200 transition-colors whitespace-nowrap">Manage Registry</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Date</label>
            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-xs font-black outline-none focus:border-indigo-600" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linked Vendor</label>
            <select value={formData.supplierId} onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-[1.125rem] text-[10px] font-black uppercase outline-none focus:border-indigo-600 appearance-none">
              <option value="">Select Registry Vendor</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} (Bal: £{s.outstandingBalance.toFixed(2)})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset To Update</label>
            <select value={formData.itemId} onChange={(e) => setFormData({ ...formData, itemId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-[1.125rem] text-[10px] font-black uppercase outline-none focus:border-indigo-600">
              <option value="">Select Inventory SKU</option>
              {inventory.map(i => <option key={i.id} value={i.id}>{i.brand} {i.name} (Now: {i.stock})</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Units Received</label>
            <input type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-xs font-black outline-none focus:border-indigo-600" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Invoice Cost (£)</label>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-lg font-black font-mono outline-none focus:border-indigo-600" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Settlement Protocol</label>
            <select
              value={formData.paymentMethod}
              onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-4 text-[10px] font-black uppercase outline-none focus:border-indigo-600 appearance-none"
            >
              <option value="ON CREDIT">ON CREDIT (UNPAID)</option>
              <option value="UPI">1. UPI</option>
              <option value="CARDS">2. CARDS: DEBIT/CREDIT</option>
              <option value="NET BANKING">3. NET BANKING</option>
              <option value="CASH">4. CASH</option>
              <option value="PETTY CASH">5. PETTY CASH</option>
              <option value="CHEQUE">6. CHEQUE</option>
            </select>
          </div>
          <div className="col-span-full md:col-span-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attach Payment Receipt</label>
            <div
              onClick={() => addReceiptRef.current?.click()}
              className={`w-full h-14 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${formData.receiptData ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-indigo-400'}`}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest ${formData.receiptData ? 'text-emerald-700' : 'text-slate-400'}`}>
                {formData.receiptData ? '✓ Document Captured' : '+ Attach Proof of Payment'}
              </span>
              <input ref={addReceiptRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e)} />
            </div>
          </div>
          <div className="col-span-full">
            <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-700 transition-all">Register Inward Stock Movement</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h4 className="text-sm font-black text-slate-900 uppercase">Procurement Master Ledger</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Audit Records: {purchases.length}</p>
        </div>
        <table className="w-full text-left hidden md:table">
          <thead className="bg-white text-slate-400 uppercase text-[9px] font-black tracking-[0.3em] border-b">
            <tr>
              <th className="px-8 py-5">Date</th>
              <th className="px-8 py-5">Vendor</th>
              <th className="px-8 py-5">Asset Description</th>
              <th className="px-8 py-5">Valuation</th>
              <th className="px-8 py-5">Doc</th>
              <th className="px-8 py-5 text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.sort((a, b) => b.date.localeCompare(a.date)).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-all group">
                <td className="px-8 py-7 text-sm font-black text-slate-900">{p.date}</td>
                <td className="px-8 py-7 font-black text-indigo-600 uppercase">
                  {suppliers.find(s => s.id === p.supplierId)?.name || 'Deleted Vendor'}
                </td>
                <td className="px-8 py-7 font-black text-slate-400 uppercase text-[10px]">{p.items}</td>
                <td className="px-8 py-7 font-black font-mono text-slate-900 text-lg">£{p.amount.toFixed(2)}</td>
                <td className="px-8 py-7 text-center">
                  {p.receiptData ? (
                    <button onClick={() => handleDownloadReceipt(p)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Download Proof">
                      📎
                    </button>
                  ) : (
                    <span className="text-slate-300 text-[8px] font-black uppercase">None</span>
                  )}
                </td>
                <td className="px-8 py-7 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditPurchase(p)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all">✎</button>
                    <button onClick={() => setPurchases(prev => prev.filter(x => x.id !== p.id))} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all">✕</button>
                  </div>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-[0.4em]">No procurement entries registered</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile Purchases Cards */}
        <div className="md:hidden p-4 space-y-4 bg-slate-50">
          {purchases.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-black uppercase text-xs tracking-widest">No procurement entries</div>
          ) : (
            purchases.sort((a, b) => b.date.localeCompare(a.date)).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-slate-900 uppercase text-xs">{p.date}</p>
                    <p className="text-[10px] font-black text-indigo-600 uppercase mt-1">{suppliers.find(s => s.id === p.supplierId)?.name || 'Deleted Vendor'}</p>
                  </div>
                  <p className="text-lg font-black font-mono text-slate-900">£{p.amount.toFixed(2)}</p>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {p.items}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex gap-2">
                    {p.receiptData && (
                      <button onClick={() => handleDownloadReceipt(p)} className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg" title="Download Proof">
                        📎 Proof
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditPurchase(p)} className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">Edit</button>
                    <button onClick={() => setPurchases(prev => prev.filter(x => x.id !== p.id))} className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingPurchaseId && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Ledger Correction</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">Manual Document Attachment</p>
              </div>
              <button onClick={() => setEditingPurchaseId(null)} className="text-3xl font-light hover:rotate-90 transition-all px-4">✕</button>
            </div>
            <div className="p-12 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Date</label>
                  <input type="date" value={editingPurchaseForm.date} onChange={e => setEditingPurchaseForm({ ...editingPurchaseForm, date: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-4 py-4 text-xs font-black outline-none focus:border-indigo-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valuation (£)</label>
                  <input type="number" step="0.01" value={editingPurchaseForm.amount} onChange={e => setEditingPurchaseForm({ ...editingPurchaseForm, amount: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border rounded-xl px-4 py-4 text-lg font-black font-mono outline-none focus:border-indigo-600" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Proof (Receipt)</label>
                <div
                  onClick={() => editReceiptRef.current?.click()}
                  className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${editingPurchaseForm.receiptData ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-indigo-600'}`}
                >
                  {editingPurchaseForm.receiptData ? (
                    <>
                      <span className="text-emerald-600 text-3xl mb-2">📄</span>
                      <p className="text-[10px] font-black text-emerald-700 uppercase">Document Attached - Click to Replace</p>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-300 text-3xl mb-2">📥</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to upload payment proof</p>
                    </>
                  )}
                  <input ref={editReceiptRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, true)} />
                </div>
              </div>
              <button onClick={savePurchaseEdit} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:scale-105 transition-all mt-4">Apply Document Refinement</button>
            </div>
          </div>
        </div>
      )}

      {showManageRegistry && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[70vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="bg-[#0F172A] p-10 text-white shrink-0 flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tight">Partner Registry</h3>
              <button onClick={() => setShowManageRegistry(false)} className="text-3xl font-light">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-4">
              {suppliers.map(v => (
                <div key={v.id} className="p-6 rounded-2xl border bg-white border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="font-black text-slate-900 uppercase text-sm">{v.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Bal: £{v.outstandingBalance.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasesView;
