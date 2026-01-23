
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, SmartIntakeItem, ViewType } from '../types';

interface SmartAIIntakeViewProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  logAction: (action: string, module: ViewType, details: string, severity?: 'Info' | 'Warning' | 'Critical') => void;
}

const SmartAIIntakeView: React.FC<SmartAIIntakeViewProps> = ({ inventory, setInventory, logAction }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stagedItems, setStagedItems] = useState<SmartIntakeItem[]>([]);
  const [summary, setSummary] = useState<{ total: number; news: number; lowStock: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processInput = async (input: string | File) => {
    setIsProcessing(true);
    setStagedItems([]);
    setSummary(null);

    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY });

    let parts: any[] = [];
    const systemInstruction = `You are a smart inventory management AI for a retail shop named "Hop In Express". 
      Analyze the input (Image or Text).
      1. IDENTIFY items visible.
      2. COUNT the quantity of each item. Be as precise as possible.
      3. EXTRACT details: Brand, Name, Pack Size (if visible), Price (if visible).
      4. If Selling Price is missing, suggest a UK market price.
      5. Return a valid JSON array. Each object must have: name, brand, qty (number), costPrice (number), price (number), category, shelfLocation, barcode, sku.`;

    if (typeof input !== 'string') {
      const base64 = await fileToBase64(input);
      parts.push({
        inlineData: {
          mimeType: input.type,
          data: base64.split(',')[1]
        }
      });
    } else {
      parts.push({ text: input });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{ parts: [...parts, { text: "Analyze this image/text. Count the items. Output JSON array." }] }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                brand: { type: Type.STRING },
                qty: { type: Type.NUMBER },
                costPrice: { type: Type.NUMBER },
                price: { type: Type.NUMBER },
                category: { type: Type.STRING },
                shelfLocation: { type: Type.STRING },
                barcode: { type: Type.STRING },
                sku: { type: Type.STRING }
              },
              required: ['name', 'qty', 'costPrice', 'price']
            }
          }
        }
      });

      const items: SmartIntakeItem[] = JSON.parse(response.text || '[]');
      setStagedItems(items);

      // Generate Summary
      const news = items.filter(aiItem => !inventory.some(inv => inv.sku === aiItem.sku || inv.barcode === aiItem.barcode)).length;
      const lowStock = items.filter(aiItem => aiItem.qty < 10).length;
      setSummary({ total: items.length, news, lowStock });

      logAction('AI Intake Analysis', 'smart-intake', `Detected ${items.length} items from input.`, 'Info');
    } catch (err) {
      console.error("AI Analysis Error:", err);
      console.error("AI Analysis Error:", err);
      // Detailed error for debugging
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`AI Error: ${errorMessage}\n\nPlease check your API Key or Quota.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const commitToInventory = () => {
    setInventory(prev => {
      const updated = [...prev];
      stagedItems.forEach(item => {
        const index = updated.findIndex(inv => (item.sku && inv.sku === item.sku) || (item.barcode && inv.barcode === item.barcode));
        if (index > -1) {
          updated[index] = {
            ...updated[index],
            stock: updated[index].stock + item.qty,
            lastBuyPrice: item.costPrice,
            price: item.price
          };
        } else {
          updated.push({
            id: crypto.randomUUID(),
            supplierId: '',
            sku: item.sku || `AI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            barcode: item.barcode || '',
            name: item.name,
            brand: item.brand || '',
            stock: item.qty,
            minStock: 10,
            costPrice: item.costPrice,
            lastBuyPrice: item.costPrice,
            price: item.price,
            category: item.category,
            shelfLocation: item.shelfLocation,
            unitType: 'pcs',
            packSize: '1',
            origin: 'UK',
            status: 'Active',
            vatRate: 20,
            logs: [{
              id: crypto.randomUUID(),
              date: new Date().toISOString(),
              type: 'audit',
              amount: item.qty,
              reason: 'Inward',
              note: 'Added via Smart AI Intake'
            }]
          });
        }
      });
      return updated;
    });

    logAction('Inventory Commitment', 'smart-intake', `Committed ${stagedItems.length} items to database.`, 'Info');
    setStagedItems([]);
    setSummary(null);
    alert("Inventory Updated Successfully.");
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="bg-[#0F172A] p-6 md:p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 rotate-12 scale-150 text-9xl">🧠</div>
        <div className="relative z-10 space-y-4">
          <p className="text-indigo-400 text-[12px] font-black uppercase tracking-[0.5em]">AI Management Suite</p>
          <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">Smart Intake</h2>
          <p className="text-slate-400 text-lg max-w-xl font-medium leading-relaxed">
            Upload shelf photos, invoices, or paste bulk text. Our vision system will automatically catalog your stock and suggest pricing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="bg-surface-elevated p-6 md:p-10 rounded-[3rem] border border-surface-highlight shadow-sm flex flex-col justify-between group">
          <div className="space-y-8">
            <h4 className="text-xl font-black text-ink-base uppercase tracking-tight">Acquisition Terminal</h4>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-video border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${isProcessing ? 'border-indigo-500 bg-indigo-50' : 'border-surface-highlight hover:border-indigo-400 hover:bg-surface-elevated'}`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="w-16 h-16 border-4 border-surface-highlight border-t-indigo-600 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Analyzing Asset Modality...</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <span className="text-6xl">📷</span>
                  <div>
                    <p className="text-lg font-black text-ink-base uppercase">Drop Media Here</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Photo / PDF / Excel</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && processInput(e.target.files[0])}
              />
            </div>

            <div className="relative">
              <textarea
                id="manual-input-area"
                placeholder="Or paste manual text entry here..."
                className="w-full h-32 bg-surface-elevated border border-surface-highlight rounded-2xl p-6 text-sm font-bold outline-none focus:border-indigo-600 transition-all no-scrollbar"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    processInput((e.target as HTMLTextAreaElement).value);
                  }
                }}
              ></textarea>
              <div className="absolute bottom-4 right-4 flex gap-2 items-center">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest hidden md:block">CTRL + ENTER to Scan</p>
                <button
                  onClick={() => {
                    const el = document.getElementById('manual-input-area') as HTMLTextAreaElement;
                    if (el && el.value) processInput(el.value);
                  }}
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
                  title="Run AI Analysis"
                >
                  <span className="text-xs font-black uppercase tracking-wider">Analyze</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="bg-surface-elevated p-6 md:p-10 rounded-[3rem] border border-surface-highlight shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-black text-ink-base uppercase tracking-tight">AI Staging Area</h4>
            {summary && (
              <div className="flex gap-4">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase">News: {summary.news}</span>
                <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase">Low Stock: {summary.lowStock}</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 min-h-[300px]">
            {stagedItems.length > 0 ? (
              stagedItems.map((item, idx) => (
                <div key={idx} className="p-5 bg-surface-elevated border border-slate-100 rounded-2xl flex justify-between items-center group/row hover:border-indigo-200 transition-all">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-ink-base uppercase">{item.brand} {item.name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shelf: {item.shelfLocation} • Category: {item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black font-mono text-ink-base">x{item.qty}</p>
                    <p className="text-[9px] font-black text-indigo-600 uppercase">£{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-40 py-20">
                <span className="text-8xl mb-8">🤖</span>
                <p className="font-black uppercase tracking-[0.4em]">Standby for Input</p>
              </div>
            )}
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100">
            <button
              disabled={stagedItems.length === 0}
              onClick={commitToInventory}
              className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
            >
              Commit to Master Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      {summary && (
        <div className="bg-emerald-50 p-6 md:p-12 rounded-[3.5rem] border border-emerald-100 flex flex-col items-center text-center space-y-4 animate-in slide-in-from-bottom-8">
          <div className="w-16 h-1 bg-emerald-600/20 rounded-full"></div>
          <h5 className="text-2xl font-black text-emerald-900 uppercase">Ingestion Analysis Verified</h5>
          <p className="text-emerald-700 text-sm font-medium max-w-lg">
            Total {summary.total} assets analyzed. Found {summary.news} new SKUs and identified {summary.lowStock} replenishment alerts.
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartAIIntakeView;
