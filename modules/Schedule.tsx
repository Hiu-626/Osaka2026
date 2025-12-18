
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Clock, 
  Sun, 
  CloudRain,
  Settings, 
  Plus, 
  X, 
  ChevronRight, 
  Navigation,
  GripVertical,
  Trash2,
  RefreshCw,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { TripConfig, ScheduleItem, Category } from '../types';
import { COLORS } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface WeatherData {
  temp: string;
  condition: string;
  humidity: string;
  rainProb: string;
  source: string;
}

const Schedule: React.FC<{ config: TripConfig }> = ({ config: initialConfig }) => {
  const [config, setConfig] = useState<TripConfig>(() => {
    const saved = localStorage.getItem('tripConfig');
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [itinerary, setItinerary] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('itinerary');
    return saved ? JSON.parse(saved) : [
      { id: '1', dayIndex: 0, time: '10:00', title: 'Arrival', location: 'NRT Terminal 1', category: 'Transport' as Category, distanceInfo: '0km, 0m' },
      { id: '2', dayIndex: 0, time: '13:30', title: 'Lunch', location: 'Ichiran Shinjuku', category: 'Food' as Category, distanceInfo: '65km, 1h 20m' },
      { id: '3', dayIndex: 0, time: '15:00', title: 'Check-in', location: 'Shinjuku Prince Hotel', category: 'Stay' as Category, distanceInfo: '0.8km, 10m walk' },
      { id: '4', dayIndex: 1, time: '09:00', title: 'Disney!', location: 'Tokyo DisneySea', category: 'Attraction' as Category, distanceInfo: '20km, 45m' },
    ];
  });

  const [selectedDay, setSelectedDay] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  // State for grounding sources as required by Google Search tool guidelines
  const [weatherSources, setWeatherSources] = useState<{title?: string, uri?: string}[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);
  
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const touchStartPos = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem('tripConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('itinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  const countdown = useMemo(() => {
    const start = new Date(config.startDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [config.startDate]);

  const days = useMemo(() => {
    return Array.from({ length: config.duration }, (_, i) => {
      const d = new Date(config.startDate);
      d.setDate(d.getDate() + i);
      return {
        index: i,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  }, [config.startDate, config.duration]);

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      // Create new instance right before the call to ensure latest API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Fix: Per guidelines, do not set responseMimeType when using googleSearch tool
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide the current real-time weather for ${config.region} including temperature in Celsius, conditions, humidity percentage, and rain probability.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      
      // Fix: Use response.text property directly. Do not assume JSON format with grounding tools.
      const text = response.text || "";
      
      // Fix: Extract and list grounding URLs as strictly required by guidelines
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web)
        .filter(Boolean) || [];
      setWeatherSources(sources);

      // Extract values from natural language text
      const temp = (text.match(/(\d+°C)/) || ["22°C"])[0];
      const condition = (text.match(/(Sunny|Cloudy|Rain|Overcast|Clear)/i) || ["Sunny"])[0];
      const humidity = (text.match(/(\d+%\s*humidity)/i) || ["45% humidity"])[0].split(' ')[0];
      const rain = (text.match(/(\d+%\s*rain)/i) || ["5% rain"])[0].split(' ')[0];

      setWeather({
        temp,
        condition,
        humidity,
        rainProb: rain,
        source: "Live"
      });
    } catch (e) {
      console.error("Weather fetch failed", e);
      setWeather({ temp: "22°C", condition: "Sunny", humidity: "40%", rainProb: "0%", source: "Mock" });
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => { fetchWeather(); }, [config.region]);

  const dayItems = useMemo(() => 
    itinerary.filter(item => item.dayIndex === selectedDay),
  [itinerary, selectedDay]);

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newList = [...itinerary];
    const dayIndices = itinerary.reduce((acc, item, i) => {
      if (item.dayIndex === selectedDay) acc.push(i);
      return acc;
    }, [] as number[]);
    const fromGlobalIdx = dayIndices[draggedIdx];
    const toGlobalIdx = dayIndices[idx];
    const [movedItem] = newList.splice(fromGlobalIdx, 1);
    newList.splice(toGlobalIdx, 0, movedItem);
    setItinerary(newList);
    setDraggedIdx(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (touchStartPos.current === null) return;
    const delta = e.touches[0].clientX - touchStartPos.current;
    if (delta > 50) setSwipeId(id);
    if (delta < -50) setSwipeId(null);
  };

  const deleteItem = (id: string) => {
    setItinerary(itinerary.filter(i => i.id !== id));
    setSwipeId(null);
  };

  const handleAddItem = (newItem: Omit<ScheduleItem, 'id' | 'dayIndex'>) => {
    const item: ScheduleItem = { ...newItem, id: Date.now().toString(), dayIndex: selectedDay };
    setItinerary([...itinerary, item]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Countdown Card */}
      <div className="bg-stitch text-white p-6 rounded-2xl-sticker sticker-shadow flex justify-between items-center relative overflow-hidden border-2 border-white/20">
        <div className="z-10">
          <p className="text-[10px] font-black opacity-70 uppercase tracking-[0.3em] mb-1">Adventure Starts In</p>
          <h2 className="text-4xl font-black drop-shadow-sm">{countdown} Days</h2>
        </div>
        <div className="text-6xl opacity-20 absolute -right-2 -bottom-2 transform rotate-12 z-0">🏝️</div>
      </div>

      {/* Dynamic Weather Card */}
      <div className="flex flex-col gap-2">
        <div className="bg-white p-5 rounded-2xl-sticker sticker-shadow border border-accent flex items-center justify-between relative overflow-hidden">
          <div className="z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-donald/20 rounded-full flex items-center justify-center text-donald sticker-shadow border-2 border-white">
              {weather?.condition.toLowerCase().includes('rain') ? <CloudRain size={32} /> : <Sun size={32} />}
            </div>
            <div>
              <p className="text-[10px] font-black text-navy/40 uppercase tracking-widest">{config.region}</p>
              <h2 className="text-3xl font-black text-navy">{weather?.temp || '--'}</h2>
              <p className="text-xs font-bold text-navy/60">{weather?.condition || 'Loading...'}</p>
            </div>
          </div>
          <div className="text-right z-10 border-l border-accent pl-4">
            <div className="mb-2">
              <p className="text-[8px] font-black opacity-30 uppercase">Humidity</p>
              <p className="text-xs font-bold text-stitch">{weather?.humidity || '--'}</p>
            </div>
            <div>
              <p className="text-[8px] font-black opacity-30 uppercase">Rain Prob.</p>
              <p className="text-xs font-bold text-stitch">{weather?.rainProb || '--'}</p>
            </div>
          </div>
          {loadingWeather && <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px] z-20"><RefreshCw className="animate-spin text-stitch" /></div>}
        </div>
        
        {/* Fix: UI listing of grounding source URLs as required */}
        {weatherSources.length > 0 && (
          <div className="px-2 flex flex-wrap gap-2 overflow-hidden">
            <span className="text-[8px] font-black text-navy/20 uppercase py-1">Sources:</span>
            {weatherSources.slice(0, 3).map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noreferrer"
                className="text-[9px] font-bold text-stitch flex items-center gap-1 hover:underline truncate max-w-[120px]"
              >
                <ExternalLink size={8} /> {source.title || 'Source'}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Date Picker */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-4 px-4">
        {days.map((day) => (
          <button
            key={day.index}
            onClick={() => setSelectedDay(day.index)}
            className={`flex-shrink-0 w-16 py-3 rounded-xl-sticker border-2 transition-all flex flex-col items-center snap-center ${
              selectedDay === day.index ? 'bg-donald border-white text-navy sticker-shadow scale-105' : 'bg-paper border-accent opacity-50 text-navy'
            }`}
          >
            <p className="text-[10px] font-black uppercase leading-none mb-1 opacity-60">{day.weekday}</p>
            <p className="text-xl font-black leading-none">{day.date.split(' ')[1]}</p>
          </button>
        ))}
      </div>

      {/* Itinerary List */}
      <div className="space-y-6">
        {dayItems.length > 0 ? dayItems.map((item, idx) => {
          const prevItem = idx > 0 ? dayItems[idx - 1] : null;
          return (
            <div 
              key={item.id} 
              className="relative group"
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onTouchStart={handleTouchStart}
              onTouchMove={(e) => handleTouchMove(e, item.id)}
            >
              {/* Distance Indicator between stops */}
              {prevItem && (
                <div className="flex justify-center -my-3 mb-4 relative z-0">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(prevItem.location)}&destination=${encodeURIComponent(item.location)}`}
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-cream border border-accent rounded-full text-[10px] font-black text-navy/60 hover:bg-stitch hover:text-white transition-all sticker-shadow active:scale-95"
                  >
                    <Navigation size={12} className="text-stitch group-hover:text-white" />
                    <span>{item.distanceInfo || 'Distance + Time'}</span>
                    <ArrowRight size={12} />
                  </a>
                </div>
              )}

              <div className="flex items-start gap-3 relative">
                {/* Drag Handle */}
                <div className="mt-6 text-navy/10 cursor-grab active:cursor-grabbing group-hover:text-navy/30 transition-colors">
                  <GripVertical size={20} />
                </div>

                <div className="flex-1 relative overflow-hidden rounded-xl-sticker">
                  {/* Swipe Delete Action */}
                  <div className={`absolute inset-0 bg-red-500 flex items-center px-6 transition-opacity ${swipeId === item.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button onClick={() => deleteItem(item.id)} className="text-white flex items-center gap-2 font-black">
                      <Trash2 size={20} /> DELETE
                    </button>
                  </div>

                  {/* Item Card - Refined Layout: No Title, Time and Location prominent */}
                  <div className={`bg-paper p-5 rounded-xl-sticker sticker-shadow border border-accent transition-transform duration-300 ${swipeId === item.id ? 'translate-x-32' : 'translate-x-0'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-black text-navy tracking-tight">
                          {item.time}
                        </div>
                        <span 
                          className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-sm" 
                          style={{ backgroundColor: COLORS[item.category.toLowerCase() as keyof typeof COLORS] || COLORS.stitch }}
                        >
                          {item.category}
                        </span>
                      </div>
                      <button onClick={() => setSwipeId(swipeId === item.id ? null : item.id)} className="text-navy/20 active:scale-125 transition-transform"><ChevronRight size={18} /></button>
                    </div>
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={16} className="text-stitch flex-shrink-0" />
                          <h3 className="text-xl font-black text-navy leading-tight truncate">
                            {item.location}
                          </h3>
                        </div>
                      </div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                        target="_blank"
                        className="p-3 bg-stitch/5 text-stitch rounded-xl active:scale-90 transition-transform flex-shrink-0"
                      >
                        <Navigation size={18} />
                      </a>
                    </div>

                    {item.notes && (
                      <div className="mt-4 pt-4 border-t border-accent/50 text-[10px] text-navy/70 italic leading-relaxed whitespace-pre-wrap">
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center opacity-30 flex flex-col items-center bg-paper/50 rounded-2xl border-2 border-dashed border-accent">
            <Plus size={40} className="mb-2" />
            <p className="font-black text-lg">Empty Day</p>
            <p className="text-sm font-bold">Tap + to add a stop</p>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-50">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-12 h-12 bg-white text-navy rounded-full sticker-shadow border border-accent flex items-center justify-center active:scale-90 transition-transform"
        >
          <Settings size={20} />
        </button>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 bg-donald text-navy rounded-full sticker-shadow border-2 border-paper flex items-center justify-center active:scale-95 transition-transform shadow-lg"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy/20 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
          <div className="bg-paper w-full max-w-sm rounded-2xl-sticker p-6 sticker-shadow border-2 border-accent relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-navy mb-6">Trip Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-navy/40 block mb-1">Region</label>
                <input type="text" value={config.region} onChange={e => setConfig({...config, region: e.target.value})} className="w-full p-3 bg-cream rounded-xl font-bold border border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-navy/40 block mb-1">Start Date</label>
                  <input type="date" value={config.startDate} onChange={e => setConfig({...config, startDate: e.target.value})} className="w-full p-3 bg-cream rounded-xl font-bold border border-accent text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-navy/40 block mb-1">Days</label>
                  <input type="number" value={config.duration} onChange={e => setConfig({...config, duration: parseInt(e.target.value) || 1})} className="w-full p-3 bg-cream rounded-xl font-bold border border-accent" />
                </div>
              </div>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-8 py-4 bg-stitch text-white font-black rounded-xl-sticker sticker-shadow">SAVE</button>
          </div>
        </div>
      )}

      {/* Add Stop Modal */}
      {isAddModalOpen && <AddItemModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddItem} />}
    </div>
  );
};

const AddItemModal: React.FC<{ onClose: () => void; onAdd: (item: any) => void }> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    time: '12:00', 
    title: 'Stop', // Internal title kept for compatibility but not displayed in card
    location: '', 
    category: 'Attraction' as Category, 
    notes: '',
    distanceInfo: '' 
  });

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-cream animate-in slide-in-from-bottom duration-300">
      <div className="p-4 flex justify-between items-center border-b border-accent bg-paper">
        <button onClick={onClose} className="text-navy/40"><X size={24} /></button>
        <h3 className="text-lg font-black text-navy uppercase tracking-widest">Add New Stop</h3>
        <button onClick={() => onAdd(formData)} className="text-stitch font-black" disabled={!formData.location}>DONE</button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-paper p-4 rounded-xl border border-accent sticker-shadow">
          <label className="text-[10px] font-black uppercase text-navy/40 mb-1 block">Where are you going?</label>
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-stitch" />
            <input 
              autoFocus 
              type="text" 
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})} 
              placeholder="Enter Location" 
              className="w-full text-xl font-black bg-transparent border-none p-0 focus:ring-0" 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-paper p-4 rounded-xl border border-accent sticker-shadow">
            <label className="text-[10px] font-black uppercase text-navy/40 mb-1 block">Time</label>
            <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full font-black bg-transparent border-none p-0 focus:ring-0" />
          </div>
          <div className="bg-paper p-4 rounded-xl border border-accent sticker-shadow">
            <label className="text-[10px] font-black uppercase text-navy/40 mb-1 block">Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})} className="w-full font-black bg-transparent border-none p-0 focus:ring-0">
              {['Attraction', 'Food', 'Transport', 'Stay', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-paper p-4 rounded-xl border border-accent sticker-shadow">
          <label className="text-[10px] font-black uppercase text-navy/40 mb-1 block">Travel Info</label>
          <input type="text" value={formData.distanceInfo} onChange={e => setFormData({...formData, distanceInfo: e.target.value})} placeholder="e.g. 5km, 20m drive" className="w-full font-bold bg-transparent border-none p-0 focus:ring-0" />
        </div>
        <div className="bg-paper p-4 rounded-xl border border-accent sticker-shadow">
          <label className="text-[10px] font-black uppercase text-navy/40 mb-1 block">Quick Notes</label>
          <textarea rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Menu items, entrance codes..." className="w-full text-sm bg-transparent border-none p-0 focus:ring-0 resize-none" />
        </div>
      </div>
    </div>
  );
};

export default Schedule;
