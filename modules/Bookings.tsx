
import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Hotel, 
  Car, 
  Utensils, 
  Ticket as TicketIcon, 
  Plus, 
  X, 
  Camera, 
  Edit2, 
  Trash2, 
  MapPin, 
  Clock, 
  ChevronRight,
  Sparkles,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { Booking } from '../types';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('bookings');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        type: 'Flight',
        title: 'CX504 Pacific Air',
        cost: 0,
        imageUrl: 'https://picsum.photos/seed/flight/600/200',
        details: { from: 'HKG', to: 'NRT', date: '12 OCT', time: '09:15', seat: '24A', gate: 'B12', airline: 'Cathay' }
      },
      {
        id: '2',
        type: 'Hotel',
        title: 'Shinjuku Prince Hotel',
        cost: 45000,
        imageUrl: '',
        details: { address: 'Kabukicho, Tokyo', checkIn: '12 OCT', checkOut: '17 OCT', room: 'Superior King' }
      }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this booking?')) {
      setBookings(bookings.filter(b => b.id !== id));
    }
  };

  const handleSave = (booking: Booking) => {
    if (editingBooking) {
      setBookings(bookings.map(b => b.id === booking.id ? booking : b));
    } else {
      setBookings([...bookings, { ...booking, id: Date.now().toString() }]);
    }
    setIsModalOpen(false);
    setEditingBooking(null);
  };

  const renderBookingCard = (booking: Booking) => {
    const hasImage = !!booking.imageUrl;

    switch (booking.type) {
      case 'Flight':
        return (
          <div className="relative bg-navy text-white rounded-2xl-sticker overflow-hidden sticker-shadow group transition-transform active:scale-[0.98]">
            {/* Top Bar */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-navy/50">
              <div className="flex items-center gap-2">
                <Plane size={18} className="text-stitch" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Boarding Pass</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }} className="p-1 opacity-40 hover:opacity-100"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(booking.id)} className="p-1 opacity-40 hover:opacity-100 text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>

            {/* Optional Voucher Image Snapshot */}
            {hasImage && (
              <div className="w-full aspect-[21/9] overflow-hidden border-b border-white/5 relative group-hover:opacity-90">
                <img src={booking.imageUrl} alt="Voucher" className="w-full h-full object-cover grayscale-[30%] contrast-125" />
                <div className="absolute inset-0 bg-navy/20" />
              </div>
            )}

            {/* Boarding Info */}
            <div className="p-6 flex justify-between items-center relative ticket-edge">
              <div className="text-center">
                <p className="text-4xl font-black text-white">{booking.details.from || '---'}</p>
                <p className="text-[9px] font-bold opacity-40 uppercase">Origin</p>
              </div>
              <div className="flex-1 px-4 flex flex-col items-center">
                 <div className="w-full border-t-2 border-dashed border-white/20 relative">
                    <Plane size={14} className="text-stitch absolute left-1/2 -translate-x-1/2 -top-[9px] bg-navy px-1" />
                 </div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-white">{booking.details.to || '---'}</p>
                <p className="text-[9px] font-bold opacity-40 uppercase">Destination</p>
              </div>
            </div>
            <div className="px-6 pb-6 grid grid-cols-4 gap-2 border-t border-white/5 pt-4 bg-navy/20">
              <div><p className="text-[8px] font-black opacity-30 uppercase">Date</p><p className="text-xs font-bold">{booking.details.date || '-'}</p></div>
              <div><p className="text-[8px] font-black opacity-30 uppercase">Gate</p><p className="text-xs font-bold">{booking.details.gate || '-'}</p></div>
              <div><p className="text-[8px] font-black opacity-30 uppercase">Seat</p><p className="text-xs font-bold">{booking.details.seat || '-'}</p></div>
              <div><p className="text-[8px] font-black opacity-30 uppercase">Time</p><p className="text-xs font-bold">{booking.details.time || '-'}</p></div>
            </div>
          </div>
        );

      case 'Hotel':
        return (
          <div className="bg-white rounded-2xl-sticker overflow-hidden sticker-shadow border border-accent flex flex-col group transition-transform active:scale-[0.98]">
            {hasImage && (
              <div className="relative h-40 w-full overflow-hidden">
                <img src={booking.imageUrl} alt={booking.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-stitch/10 text-stitch rounded-lg"><Hotel size={18} /></div>
                  <div>
                    <h3 className="text-lg font-black text-navy">{booking.title}</h3>
                    <p className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">Accommodation</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }} className="p-2 text-navy/20 hover:text-stitch"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(booking.id)} className="p-2 text-navy/20 hover:text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-t border-accent/30">
                <div>
                  <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">Check In</p>
                  <p className="text-sm font-black text-navy">{booking.details.checkIn || '---'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">Check Out</p>
                  <p className="text-sm font-black text-navy">{booking.details.checkOut || '---'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-bold text-navy/40 mb-2">
                <MapPin size={12} className="text-stitch" />
                {booking.details.address}
              </div>
              
              {booking.cost > 0 && (
                <div className="mt-3 pt-3 border-t border-accent/20 flex justify-end">
                   <span className="text-sm font-black text-stitch">¥{booking.cost.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'Car':
        return (
          <div className="bg-paper rounded-2xl-sticker sticker-shadow border-2 border-accent relative ticket-edge p-6 group transition-transform active:scale-[0.98]">
             {hasImage && (
               <div className="mb-4 rounded-xl overflow-hidden border border-accent">
                 <img src={booking.imageUrl} alt="Car Rental" className="w-full h-24 object-cover" />
               </div>
             )}
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-donald/20 rounded-xl text-navy">
                    <Car size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-navy leading-none">{booking.title}</h3>
                    <p className="text-[9px] font-bold text-navy/40 uppercase mt-1 tracking-widest">Rental Ticket</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }} className="p-1 text-navy/20 hover:text-stitch"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(booking.id)} className="p-1 text-navy/20 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-6 bg-accent/10 p-4 rounded-xl">
                <div>
                   <p className="text-[8px] font-black opacity-30 uppercase mb-1">Pickup</p>
                   <p className="text-xs font-bold">{booking.details.pickUpDate} <span className="opacity-30">•</span> {booking.details.pickUpTime}</p>
                </div>
                <div>
                   <p className="text-[8px] font-black opacity-30 uppercase mb-1">Return</p>
                   <p className="text-xs font-bold">{booking.details.dropOffDate} <span className="opacity-30">•</span> {booking.details.dropOffTime}</p>
                </div>
             </div>
             <div className="mt-4 pt-4 border-t border-accent/30 flex justify-between items-center">
                <span className="text-[10px] font-black bg-donald px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{booking.details.plate || '---'}</span>
                {booking.cost > 0 && <span className="text-sm font-black text-navy">¥{booking.cost.toLocaleString()}</span>}
             </div>
          </div>
        );

      case 'Restaurant':
        return (
          <div className="bg-paper rounded-2xl-sticker sticker-shadow border border-accent flex overflow-hidden group transition-transform active:scale-[0.98]">
            <div className="w-2 bg-[#FF9E9E]" />
            <div className="flex-1 p-5">
               {hasImage && (
                 <div className="mb-4 rounded-xl overflow-hidden border border-accent h-20">
                   <img src={booking.imageUrl} alt="Restaurant" className="w-full h-full object-cover" />
                 </div>
               )}
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-50 text-red-400 rounded-lg"><Utensils size={16} /></div>
                    <span className="text-[10px] font-black uppercase text-red-400/50 tracking-widest">Reservation</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }} className="p-1 text-navy/20 hover:text-stitch"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(booking.id)} className="p-1 text-navy/20 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
               </div>
               <h3 className="text-xl font-black text-navy mb-2">{booking.title}</h3>
               <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy/60">
                    <Calendar size={14} className="text-red-300" /> {booking.details.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy/60">
                    <Clock size={14} className="text-red-300" /> {booking.details.time}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-navy/60">
                    <Plus size={14} className="text-red-300" /> {booking.details.pax} PAX
                  </div>
               </div>
            </div>
          </div>
        );

      case 'Amusement':
        return (
          <div className="bg-donald rounded-2xl-sticker sticker-shadow border-2 border-white relative p-6 group transition-transform active:scale-[0.98]">
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }} className="p-1.5 bg-white/40 rounded-full text-navy"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(booking.id)} className="p-1.5 bg-white/40 rounded-full text-red-500"><Trash2 size={14} /></button>
            </div>
            
            {hasImage && (
              <div className="mb-4 rounded-xl overflow-hidden border border-white/50 shadow-inner">
                <img src={booking.imageUrl} alt="Pass" className="w-full h-24 object-cover" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-white rounded-2xl shadow-sm text-donald"><Sparkles size={24} /></div>
               <div>
                  <h3 className="text-2xl font-black text-navy leading-none">{booking.title}</h3>
                  <p className="text-[10px] font-bold text-navy/40 uppercase mt-1 tracking-widest">Entry Voucher</p>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/50 p-3 rounded-xl">
                  <p className="text-[8px] font-black opacity-30 uppercase mb-1">Date</p>
                  <p className="text-sm font-black">{booking.details.date || '---'}</p>
               </div>
               <div className="bg-white/50 p-3 rounded-xl">
                  <p className="text-[8px] font-black opacity-30 uppercase mb-1">Type</p>
                  <p className="text-sm font-black">{booking.details.type || '---'}</p>
               </div>
            </div>
            
            <div className="mt-6 pt-5 border-t border-white/30 flex justify-between items-center">
               <div className="w-1/2 h-5 bg-navy/10 rounded flex items-center justify-around px-2">
                  {Array.from({length: 12}).map((_, i) => <div key={i} className="w-1 h-3 bg-navy/20 rounded-full" />)}
               </div>
               {booking.cost > 0 && <span className="text-lg font-black text-navy">¥{booking.cost.toLocaleString()}</span>}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-5 rounded-2xl-sticker sticker-shadow border border-accent group transition-transform active:scale-[0.98]">
            <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-2">
                 <div className="p-2 bg-accent/20 rounded-xl text-stitch"><TicketIcon size={20} /></div>
                 <div>
                    <h3 className="font-black text-navy">{booking.title}</h3>
                    <span className="text-[9px] font-black uppercase text-navy/30 tracking-widest">{booking.type}</span>
                 </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => { setEditingBooking(booking); setIsModalOpen(true); }} className="p-1 text-navy/20 hover:text-stitch"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(booking.id)} className="p-1 text-navy/20 hover:text-red-400"><Trash2 size={16} /></button>
               </div>
            </div>
            {hasImage && (
              <div className="my-4 rounded-xl overflow-hidden border border-accent">
                <img src={booking.imageUrl} alt="Voucher" className="w-full h-20 object-cover" />
              </div>
            )}
            {booking.cost > 0 && <p className="text-right text-sm font-black text-stitch mt-2">¥{booking.cost.toLocaleString()}</p>}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-black text-navy">Tickets & Stays</h2>
          <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em]">Booking Management</p>
        </div>
        <button 
          onClick={() => { setEditingBooking(null); setIsModalOpen(true); }}
          className="w-12 h-12 bg-donald rounded-full sticker-shadow border-2 border-white flex items-center justify-center text-navy active:scale-90 transition-transform shadow-lg"
        >
          <Plus size={28} />
        </button>
      </div>
      
      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="animate-in slide-in-from-bottom-2 duration-300">
              {renderBookingCard(booking)}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center opacity-30 flex flex-col items-center border-2 border-dashed border-accent rounded-3xl bg-paper/50">
          <TicketIcon size={56} className="mb-4 text-navy/20" />
          <p className="font-black text-xl">Empty Pocket</p>
          <p className="text-sm font-bold max-w-[200px] mx-auto">No travel vouchers yet. Tap the button to add your first one!</p>
        </div>
      )}

      {isModalOpen && (
        <BookingFormModal 
          initialData={editingBooking} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

const BookingFormModal: React.FC<{ initialData: Booking | null; onClose: () => void; onSave: (b: Booking) => void }> = ({ initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Booking>>(initialData || {
    type: 'Hotel',
    title: '',
    cost: 0,
    imageUrl: '',
    details: {}
  });

  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');

  const types: Booking['type'][] = ['Flight', 'Hotel', 'Car', 'Restaurant', 'Amusement', 'Ticket'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setFormData({ ...formData, imageUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData({ ...formData, imageUrl: '' });
  };

  const updateDetail = (key: string, value: any) => {
    setFormData({
      ...formData,
      details: { ...formData.details, [key]: value }
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-cream animate-in slide-in-from-bottom duration-300">
      <div className="p-4 flex justify-between items-center border-b border-accent bg-paper">
        <button onClick={onClose} className="text-navy/40 p-2"><X size={24} /></button>
        <h3 className="text-lg font-black text-navy uppercase tracking-widest">{initialData ? 'Edit Entry' : 'New Ticket'}</h3>
        <button onClick={() => onSave(formData as Booking)} className="text-stitch font-black p-2" disabled={!formData.title}>DONE</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20">
        {/* Type Selection */}
        <div className="bg-paper p-4 rounded-2xl-sticker border border-accent sticker-shadow">
          <label className="text-[10px] font-black uppercase text-navy/40 mb-3 block">Category</label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFormData({ ...formData, type: t })}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.type === t ? 'bg-navy text-white sticker-shadow scale-105' : 'bg-accent/20 text-navy/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Voucher Snapshot (Optional) */}
        <div 
          className="w-full aspect-[21/9] bg-white rounded-2xl-sticker sticker-shadow border-2 border-dashed border-accent flex flex-col items-center justify-center relative overflow-hidden group transition-all"
        >
          {imagePreview ? (
            <div className="relative w-full h-full">
               <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
               <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
               >
                 <X size={14} />
               </button>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center text-navy/20 w-full h-full justify-center"
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              <Camera size={40} className="mb-2" />
              <p className="text-[10px] font-black uppercase">Snap Ticket / Voucher</p>
              <p className="text-[8px] opacity-60 mt-1 uppercase">(Optional)</p>
            </div>
          )}
          <input id="imageInput" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Main Details */}
        <div className="bg-paper p-4 rounded-2xl-sticker border border-accent sticker-shadow space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-navy/40 mb-1 block">Title / Name</label>
            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Pacific Air CX504" className="w-full text-lg font-black bg-transparent border-none p-0 focus:ring-0 text-navy" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-accent/20">
             <div>
                <label className="text-[10px] font-black uppercase text-navy/40 mb-1 block">Cost (¥)</label>
                <input type="number" value={formData.cost} onChange={e => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })} className="w-full font-black bg-transparent border-none p-0 focus:ring-0" placeholder="0" />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase text-navy/40 mb-1 block">Date</label>
                <input type="text" value={formData.details.date || ''} onChange={e => updateDetail('date', e.target.value)} placeholder="12 OCT" className="w-full font-black bg-transparent border-none p-0 focus:ring-0" />
             </div>
          </div>
        </div>

        {/* Type-Specific Fields */}
        {formData.type === 'Flight' && (
          <div className="bg-paper p-4 rounded-2xl-sticker border border-accent sticker-shadow space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formData.details.from || ''} onChange={e => updateDetail('from', e.target.value.toUpperCase())} placeholder="FROM: HKG" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-black text-center" />
                <input type="text" value={formData.details.to || ''} onChange={e => updateDetail('to', e.target.value.toUpperCase())} placeholder="TO: NRT" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-black text-center" />
             </div>
             <div className="grid grid-cols-3 gap-4">
                <input type="text" value={formData.details.time || ''} onChange={e => updateDetail('time', e.target.value)} placeholder="TIME" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-center text-xs" />
                <input type="text" value={formData.details.seat || ''} onChange={e => updateDetail('seat', e.target.value)} placeholder="SEAT" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-center text-xs" />
                <input type="text" value={formData.details.gate || ''} onChange={e => updateDetail('gate', e.target.value)} placeholder="GATE" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-center text-xs" />
             </div>
          </div>
        )}

        {formData.type === 'Hotel' && (
          <div className="bg-paper p-4 rounded-2xl-sticker border border-accent sticker-shadow space-y-4">
             <input type="text" value={formData.details.address || ''} onChange={e => updateDetail('address', e.target.value)} placeholder="HOTEL ADDRESS" className="w-full p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-xs" />
             <div className="grid grid-cols-2 gap-4">
                <input type="text" value={formData.details.checkIn || ''} onChange={e => updateDetail('checkIn', e.target.value)} placeholder="IN: 12 OCT" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-black text-xs" />
                <input type="text" value={formData.details.checkOut || ''} onChange={e => updateDetail('checkOut', e.target.value)} placeholder="OUT: 17 OCT" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-black text-xs" />
             </div>
          </div>
        )}

        {formData.type === 'Restaurant' && (
          <div className="bg-paper p-4 rounded-2xl-sticker border border-accent sticker-shadow grid grid-cols-3 gap-4">
             <input type="text" value={formData.details.date || ''} onChange={e => updateDetail('date', e.target.value)} placeholder="DATE" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-xs text-center" />
             <input type="text" value={formData.details.time || ''} onChange={e => updateDetail('time', e.target.value)} placeholder="TIME" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-xs text-center" />
             <input type="number" value={formData.details.pax || ''} onChange={e => updateDetail('pax', e.target.value)} placeholder="PAX" className="p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-xs text-center" />
          </div>
        )}

        {(formData.type === 'Amusement' || formData.type === 'Ticket') && (
           <div className="bg-paper p-4 rounded-2xl-sticker border border-accent sticker-shadow space-y-4">
             <input type="text" value={formData.details.type || ''} onChange={e => updateDetail('type', e.target.value)} placeholder="TICKET TYPE (e.g. Adult 1-Day)" className="w-full p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-xs" />
             <input type="text" value={formData.details.open || ''} onChange={e => updateDetail('open', e.target.value)} placeholder="OPEN TIME" className="w-full p-3 bg-accent/5 rounded-xl border border-accent/20 font-bold text-xs" />
           </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
