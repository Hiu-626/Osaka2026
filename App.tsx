
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Ticket, 
  Wallet, 
  Camera, 
  CheckSquare, 
  Users
} from 'lucide-react';
import { MOCK_MEMBERS, MOCK_TRIP_CONFIG } from './constants';
import { TripMember } from './types';
import Schedule from './modules/Schedule';
import Bookings from './modules/Bookings';
import Expense from './modules/Expense';
import Journal from './modules/Journal';
import Planning from './modules/Planning';
import Members from './modules/Members';

type Tab = 'schedule' | 'bookings' | 'expense' | 'journal' | 'planning' | 'members';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('schedule');
  const [members, setMembers] = useState<TripMember[]>(() => {
    const saved = localStorage.getItem('trip_members');
    return saved ? JSON.parse(saved) : MOCK_MEMBERS;
  });
  const [currentUser, setCurrentUser] = useState<TripMember>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const exists = members.find(m => m.id === parsed.id);
      return exists || members[0];
    }
    return members[0];
  });
  const [tripConfig, setTripConfig] = useState(MOCK_TRIP_CONFIG);

  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab') as Tab;
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('trip_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleSwitchUser = (user: TripMember) => {
    setCurrentUser(user);
  };

  const handleAddMember = (name: string, avatar: string) => {
    const newMember: TripMember = {
      id: Date.now().toString(),
      name,
      avatar
    };
    setMembers([...members, newMember]);
  };

  const handleDeleteMember = (id: string) => {
    if (id === currentUser.id) {
      alert("Ohana! 你不能刪除目前正在使用的成員。請先切換身分。");
      return;
    }
    if (confirm("確定要移除這位成員嗎？這不會刪除已記錄的支出，但會影響未來的分帳顯示。")) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule': return <Schedule config={tripConfig} />;
      case 'bookings': return <Bookings />;
      case 'expense': return <Expense currentUser={currentUser} members={members} />;
      case 'journal': return <Journal currentUser={currentUser} members={members} />;
      case 'planning': return <Planning members={members} />;
      case 'members': return (
        <Members 
          currentUser={currentUser} 
          members={members} 
          onSwitch={handleSwitchUser} 
          onAdd={handleAddMember}
          onDelete={handleDeleteMember}
        />
      );
      default: return <Schedule config={tripConfig} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-cream shadow-2xl relative overflow-hidden">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-6">
        {renderContent()}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-paper border-t border-accent px-2 py-3 flex justify-around items-center z-50 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <NavButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<Calendar size={22} />} label="行程" />
        <NavButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<Ticket size={22} />} label="預訂" />
        <NavButton active={activeTab === 'expense'} onClick={() => setActiveTab('expense')} icon={<Wallet size={22} />} label="記帳" />
        <NavButton active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} icon={<Camera size={22} />} label="日誌" />
        <NavButton active={activeTab === 'planning'} onClick={() => setActiveTab('planning')} icon={<CheckSquare size={22} />} label="清單" />
        <NavButton active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon={<Users size={22} />} label="成員" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-200 ${active ? 'text-stitch scale-110' : 'text-navy/40'}`}
  >
    <div className={`p-1 rounded-xl ${active ? 'bg-stitch/10' : ''}`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
