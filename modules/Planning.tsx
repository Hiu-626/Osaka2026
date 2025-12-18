
import React, { useState, useEffect } from 'react';
import { TripMember, PlanningItem } from '../types';
import { Plus, Trash2, Check, User, X, Users } from 'lucide-react';

const Planning: React.FC<{ members: TripMember[] }> = ({ members }) => {
  const [activeTab, setActiveTab] = useState<'Packing' | 'Shopping'>('Packing');
  const [items, setItems] = useState<PlanningItem[]>(() => {
    const saved = localStorage.getItem('planning_items');
    return saved ? JSON.parse(saved) : [
      { id: '1', type: 'Packing', title: 'Passport', assignedTo: 'All', completed: true },
      { id: '2', type: 'Packing', title: 'Japan Rail Pass', assignedTo: 'All', completed: false },
      { id: '3', type: 'Packing', title: 'Camera Batteries', assignedTo: members[0]?.id || 'All', completed: false },
    ];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemAssignee, setNewItemAssignee] = useState('All');

  useEffect(() => {
    localStorage.setItem('planning_items', JSON.stringify(items));
  }, [items]);

  const filteredItems = items.filter(item => item.type === activeTab);

  const toggleComplete = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const deleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItems(items.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    const newItem: PlanningItem = {
      id: Date.now().toString(),
      type: activeTab,
      title: newItemTitle,
      assignedTo: newItemAssignee,
      completed: false
    };
    setItems([...items, newItem]);
    setNewItemTitle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex bg-accent/20 p-1.5 rounded-2xl border border-accent/40">
        {(['Packing', 'Shopping'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-xl font-black text-xs tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-navy sticker-shadow scale-[1.02]' : 'text-navy/30 hover:text-navy/50'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredItems.length > 0 ? filteredItems.map((item) => {
          const assignee = members.find(m => m.id === item.assignedTo);
          return (
            <div 
              key={item.id} 
              onClick={() => toggleComplete(item.id)}
              className={`bg-white p-4 rounded-xl-sticker sticker-shadow border transition-all cursor-pointer group flex items-center gap-4 ${
                item.completed ? 'opacity-40 grayscale border-accent' : 'border-accent/40 hover:border-stitch/30'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                item.completed ? 'bg-stitch border-stitch' : 'border-accent'
              }`}>
                {item.completed && <Check size={16} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm text-navy truncate ${item.completed ? 'line-through decoration-navy/20' : ''}`}>
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-navy/30 mt-1 uppercase tracking-tighter">
                  {item.assignedTo === 'All' ? (
                    <><Users size={10} className="text-stitch/50" /> Everyone</>
                  ) : (
                    <><img src={assignee?.avatar} className="w-3 h-3 rounded-full" /> {assignee?.name}</>
                  )}
                </div>
              </div>
              <button 
                onClick={(e) => deleteItem(e, item.id)}
                className="text-navy/10 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }) : (
          <div className="py-20 text-center opacity-20 border-2 border-dashed border-accent rounded-3xl bg-paper/50">
             <p className="font-black uppercase text-[10px] tracking-widest">List is clear!</p>
          </div>
        )}

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-5 rounded-xl-sticker border-2 border-dashed border-accent text-navy/30 font-black flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95 group"
        >
          <div className="p-1.5 bg-accent/20 rounded-full group-hover:bg-stitch/10 group-hover:text-stitch transition-colors">
            <Plus size={20} />
          </div>
          ADD {activeTab.toUpperCase()} ITEM
        </button>
      </div>

      <div className="bg-white p-5 rounded-3xl-sticker border border-accent/40 sticker-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none transform rotate-12">✅</div>
        <h4 className="text-[10px] font-black text-navy/30 mb-4 uppercase tracking-[0.3em] flex items-center gap-2">
          <Check size={12} className="text-stitch" /> Checklist Progress
        </h4>
        <div className="flex items-center gap-4">
          <div className="h-2.5 flex-1 bg-cream rounded-full overflow-hidden border border-accent/20">
            <div 
              className="h-full bg-stitch transition-all duration-1000 shadow-[0_0_8px_rgba(110,193,228,0.4)]" 
              style={{ width: `${(filteredItems.filter(i => i.completed).length / (filteredItems.length || 1)) * 100}%` }} 
            />
          </div>
          <span className="text-[10px] font-black text-stitch tabular-nums">
            {filteredItems.filter(i => i.completed).length}/{filteredItems.length}
          </span>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/10 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-paper w-full max-w-sm rounded-3xl-sticker p-6 sticker-shadow border-4 border-stitch animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-navy uppercase tracking-widest">Add {activeTab}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-cream rounded-full text-navy/40"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-cream p-4 rounded-2xl border border-accent">
                <label className="text-[10px] font-black uppercase text-navy/30 mb-1 block tracking-widest">Item Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="e.g. Suntan Lotion"
                  className="w-full bg-transparent border-none p-0 font-black text-navy text-lg focus:ring-0 placeholder:text-navy/10"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-navy/30 mb-3 block px-1 tracking-widest">Assign To</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    onClick={() => setNewItemAssignee('All')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full font-black text-[10px] border-2 uppercase tracking-tighter transition-all ${newItemAssignee === 'All' ? 'bg-navy border-navy text-white' : 'bg-white border-accent text-navy/30'}`}
                  >
                    Everyone
                  </button>
                  {members.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setNewItemAssignee(m.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-[10px] border-2 uppercase transition-all ${newItemAssignee === m.id ? 'bg-stitch border-stitch text-white' : 'bg-white border-accent text-navy/30'}`}
                    >
                      <img src={m.avatar} className="w-4 h-4 rounded-full" />
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAddItem}
                disabled={!newItemTitle.trim()}
                className="w-full py-4 bg-navy text-white font-black rounded-xl-sticker sticker-shadow active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none uppercase text-xs tracking-widest"
              >
                ADD TO LIST
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planning;
