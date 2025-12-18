
import React, { useState } from 'react';
import { TripMember } from '../types';
import { 
  LogOut, 
  Settings, 
  Award, 
  Map, 
  Plus, 
  UserPlus, 
  X, 
  Trash2, 
  Check,
  Sparkles
} from 'lucide-react';

interface MembersProps {
  currentUser: TripMember;
  members: TripMember[];
  onSwitch: (user: TripMember) => void;
  onAdd: (name: string, avatar: string) => void;
  onDelete: (id: string) => void;
}

const Members: React.FC<MembersProps> = ({ currentUser, members, onSwitch, onAdd, onDelete }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('https://picsum.photos/seed/new_member/200');

  const avatarOptions = [
    'https://picsum.photos/seed/stitch/200',
    'https://picsum.photos/seed/donald/200',
    'https://picsum.photos/seed/lilo/200',
    'https://picsum.photos/seed/daisy/200',
    'https://picsum.photos/seed/mickey/200',
    'https://picsum.photos/seed/minnie/200',
    'https://picsum.photos/seed/goofy/200'
  ];

  const handleAddSubmit = () => {
    if (newName.trim()) {
      onAdd(newName.trim(), selectedAvatar);
      setNewName('');
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Current User Profile Section */}
      <div className="text-center py-4 bg-white/40 rounded-3xl-sticker p-6 border border-white/60 sticker-shadow">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full border-4 border-donald sticker-shadow overflow-hidden mb-4 p-1 bg-white">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="absolute bottom-4 right-0 w-10 h-10 bg-stitch text-white rounded-full flex items-center justify-center border-4 border-paper sticker-shadow animate-pulse">
            <Sparkles size={18} />
          </div>
        </div>
        <h2 className="text-3xl font-black text-navy">{currentUser.name}</h2>
        <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mt-1">Active Trip Planner</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white p-4 rounded-xl-sticker sticker-shadow border border-accent flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-stitch/10 text-stitch rounded-full flex items-center justify-center mb-2">
               <Award size={20} />
            </div>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Badges</p>
            <p className="text-sm font-black text-navy">12 Collected</p>
         </div>
         <div className="bg-white p-4 rounded-xl-sticker sticker-shadow border border-accent flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-donald/10 text-donald rounded-full flex items-center justify-center mb-2">
               <Map size={20} />
            </div>
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Visited</p>
            <p className="text-sm font-black text-navy">4 Spots</p>
         </div>
      </div>

      {/* Trip Members Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-black text-navy uppercase tracking-[0.2em]">Trip Ohana</h3>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 bg-stitch/10 text-stitch rounded-full hover:bg-stitch hover:text-white transition-all active:scale-90"
          >
            <UserPlus size={18} />
          </button>
        </div>
        
        <div className="space-y-3">
          {members.map((member) => (
            <div 
              key={member.id}
              className={`w-full p-4 rounded-xl-sticker sticker-shadow border-2 flex items-center gap-4 transition-all group ${
                currentUser.id === member.id ? 'bg-stitch/5 border-stitch' : 'bg-white border-accent'
              }`}
            >
              <button 
                onClick={() => onSwitch(member)}
                className="flex flex-1 items-center gap-4 text-left"
              >
                <div className={`relative w-12 h-12 rounded-full border-2 overflow-hidden flex-shrink-0 ${currentUser.id === member.id ? 'border-stitch' : 'border-accent'}`}>
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  {currentUser.id === member.id && (
                    <div className="absolute inset-0 bg-stitch/20 flex items-center justify-center">
                      <Check size={20} className="text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-navy text-sm">{member.name}</h4>
                  <p className="text-[9px] font-bold text-navy/30 uppercase tracking-wider">
                    {currentUser.id === member.id ? 'Currently Controlling' : 'View Stats'}
                  </p>
                </div>
              </button>
              
              {/* Show delete only for non-current user */}
              {member.id !== currentUser.id && (
                <button 
                  onClick={() => onDelete(member.id)}
                  className="p-2 text-navy/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/20 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-paper w-full max-w-sm rounded-3xl-sticker p-6 sticker-shadow border-4 border-stitch animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-navy uppercase tracking-widest">New Traveler</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-cream rounded-full text-navy/40"><X size={20} /></button>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-stitch overflow-hidden mb-4 p-1 bg-white sticker-shadow">
                  <img src={selectedAvatar} alt="preview" className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
                  {avatarOptions.map((av, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedAvatar(av)}
                      className={`flex-shrink-0 w-10 h-10 rounded-full border-2 transition-all ${selectedAvatar === av ? 'border-stitch scale-110' : 'border-transparent opacity-50'}`}
                    >
                      <img src={av} alt="option" className="w-full h-full rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-cream p-4 rounded-2xl border border-accent">
                <label className="text-[10px] font-black uppercase text-navy/30 mb-1 block tracking-widest">Member Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Lilo"
                  className="w-full bg-transparent border-none p-0 font-black text-navy text-lg focus:ring-0 placeholder:text-navy/10"
                />
              </div>

              <button 
                onClick={handleAddSubmit}
                disabled={!newName.trim()}
                className="w-full py-4 bg-stitch text-white font-black rounded-xl-sticker sticker-shadow active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                JOIN THE OHANA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Logout Styled Button */}
      <button className="w-full py-4 text-red-300 font-black flex items-center justify-center gap-2 mt-8 active:scale-95 transition-all text-xs tracking-widest uppercase">
        <LogOut size={16} />
        Leave Trip
      </button>
    </div>
  );
};

export default Members;
