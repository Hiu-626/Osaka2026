
import React, { useState, useEffect, useMemo } from 'react';
import { TripMember, Expense as ExpenseType } from '../types';
import { 
  TrendingDown, 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Calculator, 
  RefreshCw, 
  Search, 
  ArrowRightLeft, 
  Calendar,
  Settings2,
  TrendingUp,
  CircleDollarSign,
  ArrowRight,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const Expense: React.FC<{ currentUser: TripMember; members: TripMember[] }> = ({ currentUser, members }) => {
  const [expenses, setExpenses] = useState<ExpenseType[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [rates, setRates] = useState<Record<string, number>>({ JPY: 1, HKD: 19.2, AUD: 96.5 });
  // State for grounding source URLs as strictly required by guidelines
  const [rateSources, setRateSources] = useState<{title?: string, uri?: string}[]>([]);
  const [baseCurrency, setBaseCurrency] = useState<'JPY' | 'HKD' | 'AUD'>(() => {
    return (localStorage.getItem('baseCurrency') as any) || 'JPY';
  });
  const [loadingRates, setLoadingRates] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isCurrencySettingsOpen, setIsCurrencySettingsOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseType | null>(null);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('baseCurrency', baseCurrency);
  }, [baseCurrency]);

  const fetchLiveRates = async () => {
    setLoadingRates(true);
    try {
      // Create new instance right before the call as required
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Fix: Per guidelines, do not set responseMimeType when using googleSearch tool
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Find the current real-time exchange rates for 1 HKD to JPY and 1 AUD to JPY. Provide the numerical rates only.",
        config: { tools: [{ googleSearch: {} }] }
      });
      
      // Fix: Use response.text directly. Do not assume JSON format when using grounding.
      const text = response.text || "";
      
      // Fix: Extract grounding chunks as required by the tool's guidelines
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter(Boolean) || [];
      setRateSources(sources);

      // Extract numeric rates from descriptive text
      const hkdMatch = text.match(/HKD\D+(\d+\.?\d*)/i);
      const audMatch = text.match(/AUD\D+(\d+\.?\d*)/i);
      
      if (hkdMatch || audMatch) {
        setRates(prev => ({
          ...prev,
          HKD: hkdMatch ? parseFloat(hkdMatch[1]) : prev.HKD,
          AUD: audMatch ? parseFloat(audMatch[1]) : prev.AUD
        }));
      }
    } catch (e) {
      console.error("Rates fetch failed", e);
    } finally {
      setLoadingRates(false);
    }
  };

  const balances = useMemo(() => {
    const bal: Record<string, number> = {};
    members.forEach(m => bal[m.id] = 0);
    expenses.forEach(exp => {
      const amountJPY = exp.amount * (rates[exp.currency as keyof typeof rates] || 1);
      const share = amountJPY / (exp.splitWith.length || 1);
      if (bal[exp.paidBy] !== undefined) bal[exp.paidBy] += amountJPY;
      exp.splitWith.forEach(id => {
        if (bal[id] !== undefined) bal[id] -= share;
      });
    });
    return bal;
  }, [expenses, members, rates]);

  const settlementSuggestions = useMemo(() => {
    const people = Object.entries(balances).map(([id, balance]) => ({ id, balance }));
    const debtors = people.filter(p => p.balance < -0.01).sort((a, b) => a.balance - b.balance);
    const creditors = people.filter(p => p.balance > 0.01).sort((a, b) => b.balance - a.balance);
    
    const transactions: Array<{ from: string; to: string; amount: number }> = [];
    const dCopy = debtors.map(d => ({ ...d }));
    const cCopy = creditors.map(c => ({ ...c }));

    let dIdx = 0, cIdx = 0;
    while (dIdx < dCopy.length && cIdx < cCopy.length) {
      const amount = Math.min(Math.abs(dCopy[dIdx].balance), cCopy[cIdx].balance);
      transactions.push({ from: dCopy[dIdx].id, to: cCopy[cIdx].id, amount });
      
      dCopy[dIdx].balance += amount;
      cCopy[cIdx].balance -= amount;
      
      if (Math.abs(dCopy[dIdx].balance) < 0.01) dIdx++;
      if (Math.abs(cCopy[cIdx].balance) < 0.01) cIdx++;
    }
    return transactions;
  }, [balances]);

  const myBalanceJPY = balances[currentUser.id] || 0;
  const totalSpentJPY = expenses.reduce((acc, exp) => acc + (exp.amount * (rates[exp.currency as keyof typeof rates] || 1)), 0);

  const convertFromJPY = (amount: number, target: string) => {
    if (target === 'JPY') return amount;
    return amount / (rates[target as keyof typeof rates] || 1);
  };

  const handleSave = (expense: ExpenseType) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
    } else {
      setExpenses([{ ...expense, id: Date.now().toString() }, ...expenses]);
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl-sticker sticker-shadow border border-stitch/20 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-donald/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1">
             <div className="flex items-center gap-1">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/30">總支出總額</p>
             </div>
             <div className="flex gap-2">
                {(['JPY', 'HKD', 'AUD'] as const).map(cur => (
                  <button 
                    key={cur}
                    onClick={() => setBaseCurrency(cur)}
                    className={`text-[9px] font-black px-2 py-1 rounded-md transition-all ${baseCurrency === cur ? 'bg-navy text-white' : 'text-navy/20 hover:text-navy/40'}`}
                  >
                    {cur}
                  </button>
                ))}
             </div>
          </div>
          <h2 className="text-4xl font-black text-navy flex items-baseline gap-1">
            <span className="text-xl opacity-30 font-bold">{baseCurrency === 'JPY' ? '¥' : '$'}</span>
            {Math.round(convertFromJPY(totalSpentJPY, baseCurrency)).toLocaleString()}
          </h2>
          
          <div className="mt-8 flex gap-3">
            <button 
              onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
              className="flex-1 bg-stitch text-white py-4 rounded-2xl-sticker font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 sticker-shadow active:scale-95 transition-all"
            >
              <Plus size={16} /> 新增支出
            </button>
            <button 
              onClick={() => setIsSettlementOpen(true)}
              className="px-6 bg-donald/40 text-navy py-4 rounded-2xl-sticker font-black text-[11px] uppercase tracking-widest border border-donald/50 sticker-shadow active:scale-95 transition-all"
            >
              結算
            </button>
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-2xl-sticker sticker-shadow border-2 transition-all duration-300 bg-white ${myBalanceJPY >= 0 ? 'border-stitch/10 bg-stitch/5' : 'border-red-50 bg-red-50/30'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${myBalanceJPY >= 0 ? 'bg-white text-stitch' : 'bg-white text-red-300'}`}>
               {myBalanceJPY >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
             </div>
             <div>
                <p className="text-[9px] font-black text-navy/20 uppercase tracking-[0.2em]">{currentUser.name} 的收支平衡</p>
                <h3 className={`text-xl font-black ${myBalanceJPY >= 0 ? 'text-stitch' : 'text-red-300'}`}>
                  {myBalanceJPY >= 0 ? '應收' : '應付'} 
                  <span className="ml-2 font-black">
                    {baseCurrency === 'JPY' ? '¥' : '$'}{Math.abs(Math.round(convertFromJPY(myBalanceJPY, baseCurrency))).toLocaleString()}
                  </span>
                </h3>
             </div>
          </div>
          <button onClick={() => setIsCalcOpen(true)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-navy/20 active:scale-90 sticker-shadow border border-accent/30">
            <Calculator size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center px-1">
           <h3 className="text-[11px] font-black text-navy/20 uppercase tracking-[0.3em] flex items-center gap-2">
              <ArrowRightLeft size={12} /> 歷史紀錄
           </h3>
           <button onClick={() => setIsCurrencySettingsOpen(true)} className="text-navy/20 hover:text-stitch transition-colors">
              <Settings2 size={14} />
           </button>
        </div>

        {expenses.length > 0 ? expenses.map((exp) => {
          const payer = members.find(m => m.id === exp.paidBy);
          return (
            <div key={exp.id} className="bg-white p-4 rounded-xl-sticker sticker-shadow border border-accent/30 flex items-center gap-4 group hover:border-stitch/40 transition-all">
              <div className="relative flex-shrink-0">
                <img src={payer?.avatar} alt={payer?.name} className="w-12 h-12 rounded-full object-cover border-2 border-accent shadow-inner" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-accent shadow-sm">
                   <CircleDollarSign size={8} className="text-stitch" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-navy text-sm truncate">{exp.category}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-stitch/70 uppercase">{payer?.name} 付款</span>
                  <span className="w-1 h-1 bg-navy/10 rounded-full" />
                  <span className="text-[9px] font-bold text-navy/20 uppercase">{exp.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-navy text-sm">
                  {exp.currency} {exp.amount.toLocaleString()}
                </p>
                {exp.currency !== baseCurrency && (
                  <p className="text-[9px] font-bold text-navy/10">
                    ≈ {baseCurrency} {Math.round(convertFromJPY(exp.amount * (rates[exp.currency as keyof typeof rates] || 1), baseCurrency)).toLocaleString()}
                  </p>
                )}
                <div className="flex gap-2 justify-end mt-1.5 opacity-0 group-hover:opacity-100">
                   <button onClick={() => { setEditingExpense(exp); setIsModalOpen(true); }} className="p-1 text-navy/10 hover:text-stitch"><Edit2 size={12} /></button>
                   <button onClick={() => setExpenses(expenses.filter(e => e.id !== exp.id))} className="p-1 text-navy/10 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-24 text-center opacity-10 border-2 border-dashed border-accent rounded-3xl">
            <CreditCard size={48} className="mx-auto mb-3" />
            <p className="font-black uppercase text-[10px] tracking-widest italic">尚未有支出紀錄</p>
          </div>
        )}
      </div>

      {isSettlementOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-navy/5 backdrop-blur-sm" onClick={() => setIsSettlementOpen(false)}>
          <div className="bg-paper w-full max-w-sm rounded-3xl-sticker p-6 sticker-shadow border-4 border-stitch/30 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-navy uppercase tracking-widest">Ohana 結算</h3>
                <p className="text-[9px] font-bold text-navy/20 uppercase mt-2">建議還款路徑 ({baseCurrency})</p>
              </div>
              <button onClick={() => setIsSettlementOpen(false)} className="p-2 bg-cream rounded-full text-navy/20 active:scale-90"><X size={20} /></button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {settlementSuggestions.length > 0 ? settlementSuggestions.map((tx, idx) => {
                const from = members.find(m => m.id === tx.from);
                const to = members.find(m => m.id === tx.to);
                return (
                  <div key={idx} className="bg-cream p-4 rounded-2xl border border-accent/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <img src={from?.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                        <img src={to?.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-navy/40 uppercase mb-1">{from?.name} ➜ {to?.name}</p>
                        <p className="font-black text-stitch text-sm">
                          {baseCurrency === 'JPY' ? '¥' : '$'}{Math.round(convertFromJPY(tx.amount, baseCurrency)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-navy/10" />
                  </div>
                );
              }) : (
                <div className="text-center py-12 opacity-40">
                  <Check size={40} className="mx-auto mb-3 text-stitch" />
                  <p className="font-black uppercase text-xs tracking-widest">帳目已清！</p>
                </div>
              )}
            </div>
            <button onClick={() => setIsSettlementOpen(false)} className="w-full mt-8 py-4 bg-navy text-white font-black rounded-xl-sticker sticker-shadow uppercase text-[11px] tracking-[0.2em]">關閉</button>
          </div>
        </div>
      )}

      {isCalcOpen && <CalculatorTool rates={rates} onClose={() => setIsCalcOpen(false)} />}
      {isCurrencySettingsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-navy/5 backdrop-blur-sm" onClick={() => setIsCurrencySettingsOpen(false)}>
           <div className="bg-paper w-full max-w-sm rounded-3xl-sticker p-6 sticker-shadow border-4 border-donald/30 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-navy uppercase tracking-widest">幣別與匯率</h3>
                <button onClick={() => setIsCurrencySettingsOpen(false)} className="p-2 bg-cream rounded-full text-navy/20"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-navy/20 mb-3 block px-1">基準幣別</label>
                    <div className="flex gap-2">
                       {(['JPY', 'HKD', 'AUD'] as const).map(cur => (
                         <button 
                           key={cur}
                           onClick={() => setBaseCurrency(cur)}
                           className={`flex-1 py-3 rounded-xl border-2 font-black text-xs transition-all ${baseCurrency === cur ? 'bg-navy text-white border-navy sticker-shadow scale-105' : 'bg-white text-navy/20 border-accent/50'}`}
                         >
                           {cur}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black uppercase text-navy/20">匯率 (vs JPY)</label>
                       <button onClick={fetchLiveRates} className="text-[9px] font-black text-stitch flex items-center gap-1 active:scale-90">
                         <RefreshCw size={10} className={loadingRates ? 'animate-spin' : ''} /> 更新
                       </button>
                    </div>
                    {['HKD', 'AUD'].map(cur => (
                      <div key={cur} className="flex items-center justify-between p-4 bg-cream/40 rounded-xl border border-accent/40">
                         <span className="font-black text-navy/40 text-xs uppercase">1 {cur} =</span>
                         <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={rates[cur as keyof typeof rates]} 
                              onChange={e => setRates({...rates, [cur]: parseFloat(e.target.value) || 0})}
                              className="w-16 text-right font-black text-stitch bg-transparent border-none focus:ring-0 p-0"
                            />
                            <span className="text-[10px] font-black text-navy/10">JPY</span>
                         </div>
                      </div>
                    ))}

                    {/* Fix: UI listing of grounding source URLs as required */}
                    {rateSources.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1 px-1">
                        <span className="text-[8px] font-black text-navy/20 uppercase tracking-widest">Source Links:</span>
                        <div className="flex flex-wrap gap-2">
                          {rateSources.slice(0, 2).map((source, idx) => (
                            <a 
                              key={idx} 
                              href={source.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[9px] font-bold text-stitch flex items-center gap-1 hover:underline truncate max-w-[140px]"
                            >
                              <ExternalLink size={8} /> {source.title || 'Source'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
              </div>
              <button onClick={() => setIsCurrencySettingsOpen(false)} className="w-full mt-8 py-4 bg-navy text-white font-black rounded-xl-sticker sticker-shadow uppercase text-[11px] tracking-widest">套用</button>
           </div>
        </div>
      )}

      {isModalOpen && (
        <ExpenseModal 
          expense={editingExpense} 
          members={members} 
          rates={rates}
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

const CalculatorTool: React.FC<{ rates: Record<string, number>; onClose: () => void }> = ({ rates, onClose }) => {
  const [val, setVal] = useState('');
  const [cur, setCur] = useState<'HKD' | 'AUD'>('HKD');
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-navy/5 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-paper w-full max-w-xs rounded-3xl-sticker p-6 sticker-shadow border-4 border-donald/30 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-navy uppercase tracking-widest leading-none">匯率換算</h3>
          <button onClick={onClose} className="p-2 bg-cream rounded-full text-navy/20"><X size={20} /></button>
        </div>
        <div className="space-y-6">
          <div className="flex bg-accent/10 p-1.5 rounded-2xl border border-accent/20">
            {(['HKD', 'AUD'] as const).map(c => (
              <button key={c} onClick={() => setCur(c)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${cur === c ? 'bg-white text-navy sticker-shadow scale-105' : 'text-navy/20'}`}>{c}</button>
            ))}
          </div>
          <input 
            autoFocus type="number" value={val} onChange={e => setVal(e.target.value)} placeholder="0.00"
            className="w-full text-4xl font-black text-navy border-b-4 border-accent/20 bg-transparent p-4 focus:ring-0 text-center"
          />
          <div className="text-center py-6 bg-stitch/5 rounded-3xl border border-stitch/10">
            <p className="text-[9px] font-black uppercase text-navy/20 mb-2">約等於</p>
            <h4 className="text-4xl font-black text-stitch">¥ {val ? Math.round(parseFloat(val) * rates[cur]).toLocaleString() : '0'}</h4>
          </div>
        </div>
        <button onClick={onClose} className="w-full mt-6 py-4 bg-navy text-white font-black rounded-xl-sticker sticker-shadow uppercase text-[11px]">完成</button>
      </div>
    </div>
  );
};

const ExpenseModal: React.FC<{ 
  expense: ExpenseType | null; 
  members: TripMember[]; 
  rates: Record<string, number>;
  onClose: () => void; 
  onSave: (e: ExpenseType) => void 
}> = ({ expense, members, rates, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<ExpenseType>>(expense || {
    amount: 0, currency: 'JPY', category: '', paidBy: members[0].id, splitWith: members.map(m => m.id), date: new Date().toISOString().split('T')[0]
  });

  const toggleSplit = (id: string) => {
    const current = formData.splitWith || [];
    setFormData({ ...formData, splitWith: current.includes(id) ? current.filter(cid => cid !== id) : [...current, id] });
  };

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-cream animate-in slide-in-from-bottom duration-300">
      <div className="p-4 flex justify-between items-center border-b border-accent/40 bg-white/80">
        <button onClick={onClose} className="text-navy/20 p-2"><X size={24} /></button>
        <h3 className="text-lg font-black text-navy uppercase tracking-[0.2em]">{expense ? '編輯支出' : '新增支出'}</h3>
        <button 
          onClick={() => onSave(formData as ExpenseType)} 
          className="text-stitch font-black p-2 disabled:opacity-30"
          disabled={!formData.category || !formData.amount || formData.splitWith?.length === 0}
        >儲存</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
        <div className="bg-white p-8 rounded-3xl-sticker sticker-shadow border border-accent/30 text-center relative shadow-inner">
          <div className="flex items-center justify-center gap-2">
            <select 
              value={formData.currency} 
              onChange={e => setFormData({...formData, currency: e.target.value as any})}
              className="text-xl font-black text-stitch bg-transparent border-none focus:ring-0 p-0 w-min"
            >
              <option value="JPY">¥ JPY</option><option value="HKD">$ HKD</option><option value="AUD">$ AUD</option>
            </select>
            <input 
              type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              placeholder="0" className="w-full text-5xl font-black text-navy bg-transparent border-none focus:ring-0 text-center" autoFocus
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl-sticker border border-accent/30 sticker-shadow space-y-6">
          <div className="flex items-center gap-4 border-b border-accent/10 pb-4">
             <div className="p-2 bg-cream rounded-lg text-navy/20"><Search size={18} /></div>
             <input 
               type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
               placeholder="支出描述 (如：壽司午餐)" className="w-full font-black text-navy border-none focus:ring-0 p-0 text-lg"
             />
          </div>
          <div className="flex items-center gap-4">
             <div className="p-2 bg-cream rounded-lg text-navy/20"><Calendar size={18} /></div>
             <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full font-black text-navy bg-transparent border-none focus:ring-0 p-0" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl-sticker border border-accent/30 sticker-shadow shadow-inner">
          <label className="text-[10px] font-black uppercase text-navy/20 mb-4 block tracking-widest">誰付的錢？</label>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {members.map(m => (
              <button
                key={m.id} onClick={() => setFormData({ ...formData, paidBy: m.id })}
                className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${formData.paidBy === m.id ? 'opacity-100 scale-110' : 'opacity-20'}`}
              >
                <img src={m.avatar} className={`w-14 h-14 rounded-full object-cover border-4 p-0.5 ${formData.paidBy === m.id ? 'border-stitch shadow-md' : 'border-transparent'}`} alt={m.name} />
                <span className="text-[9px] font-black uppercase">{m.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl-sticker border border-accent/30 sticker-shadow shadow-inner">
          <label className="text-[10px] font-black uppercase text-navy/20 mb-4 block tracking-widest">與誰分帳？</label>
          <div className="grid grid-cols-2 gap-3">
            {members.map(m => {
              const isSelected = formData.splitWith?.includes(m.id);
              return (
                <button
                  key={m.id} onClick={() => toggleSplit(m.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl-sticker border-2 transition-all ${isSelected ? 'bg-stitch/5 border-stitch text-navy' : 'bg-white border-accent/40 text-navy/10'}`}
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'bg-stitch border-stitch' : 'border-navy/10'}`}>
                    {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expense;
