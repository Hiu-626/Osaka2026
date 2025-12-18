
import React, { useState, useEffect } from 'react';
import { TripMember, JournalPost } from '../types';
import { 
  Share2, 
  MoreHorizontal, 
  Plus, 
  X, 
  Camera, 
  Edit2, 
  Trash2,
  Send,
  UserCircle2,
  Check
} from 'lucide-react';

const Journal: React.FC<{ 
  currentUser: TripMember; 
  members: TripMember[];
}> = ({ currentUser, members }) => {
  const [posts, setPosts] = useState<JournalPost[]>(() => {
    const saved = localStorage.getItem('journal_posts');
    return saved ? JSON.parse(saved) : [
      { id: '1', authorId: '1', content: "Just landed in Tokyo! The weather is amazing. First meal: Ichiran Ramen! 🍜 #TokyoAdventure", imageUrl: 'https://picsum.photos/seed/tokyo/600/400', date: 'Oct 12, 11:30 AM' },
      { id: '2', authorId: '2', content: "Our hotel view is incredible. Can see the Tokyo Metropolitan Building from here. 🏨✨", imageUrl: 'https://picsum.photos/seed/view/600/400', date: 'Oct 12, 4:00 PM' }
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<JournalPost | null>(null);

  useEffect(() => {
    localStorage.setItem('journal_posts', JSON.stringify(posts));
  }, [posts]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this memory?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleSave = (post: JournalPost) => {
    if (editingPost) {
      setPosts(posts.map(p => p.id === post.id ? post : p));
    } else {
      setPosts([post, ...posts]);
    }
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleShare = async (post: JournalPost) => {
    const author = members.find(m => m.id === post.authorId);
    const shareData = {
      title: `Memory by ${author?.name || 'Friend'}`,
      text: post.content,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${post.content} - Shared from Ohana Trip Planner`);
      alert('Copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-black text-navy">Travel Journal</h2>
          <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em]">Our Shared Memories</p>
        </div>
        <button 
          onClick={() => { setEditingPost(null); setIsModalOpen(true); }}
          className="w-12 h-12 bg-stitch rounded-full sticker-shadow border-2 border-white flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-8">
        {posts.map((post) => {
          const author = members.find(m => m.id === post.authorId);
          return (
            <JournalCard 
              key={post.id} 
              post={post} 
              author={author}
              isAuthor={post.authorId === currentUser.id}
              onEdit={() => { setEditingPost(post); setIsModalOpen(true); }}
              onDelete={() => handleDelete(post.id)}
              onShare={() => handleShare(post)}
            />
          );
        })}

        {posts.length === 0 && (
          <div className="py-20 text-center opacity-30 flex flex-col items-center bg-paper/50 rounded-2xl border-2 border-dashed border-accent">
            <Camera size={48} className="mb-2" />
            <p className="font-black">No memories yet</p>
            <p className="text-sm font-bold">Tap + to record your first moment!</p>
          </div>
        )}
      </div>

      {/* Decorative Footer */}
      <div className="pt-4 flex justify-center opacity-30">
         <div className="px-6 py-2 bg-donald border-2 border-navy rounded-full transform -rotate-2">
            <span className="text-xs font-black uppercase tracking-[0.2em]">Ohana Memories</span>
         </div>
      </div>

      {isModalOpen && (
        <JournalModal 
          currentUser={currentUser}
          members={members}
          initialData={editingPost}
          onClose={() => { setIsModalOpen(false); setEditingPost(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const JournalCard: React.FC<{ 
  post: JournalPost; 
  author?: TripMember;
  isAuthor: boolean; 
  onEdit: () => void; 
  onDelete: () => void;
  onShare: () => void;
}> = ({ post, author, isAuthor, onEdit, onDelete, onShare }) => {
  const [showMenu, setShowMenu] = useState(false);
  const authorHandle = author?.name.toLowerCase().replace(' ', '_') || 'friend';

  return (
    <div className="bg-paper rounded-2xl-sticker overflow-hidden sticker-shadow border border-accent flex flex-col animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-stitch overflow-hidden bg-cream shadow-sm">
            <img src={author?.avatar} alt="author" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-black text-sm text-navy leading-none">{author?.name}</h4>
            <p className="text-[9px] font-black text-navy/30 uppercase mt-1 tracking-wider">{post.date}</p>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-navy/40 hover:text-navy active:scale-90 transition-all">
            <MoreHorizontal size={20} />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 w-32 bg-white rounded-xl sticker-shadow border border-accent z-20 overflow-hidden py-1">
                <button onClick={() => { onShare(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-xs font-black text-navy/60 hover:bg-cream flex items-center gap-2">
                  <Share2 size={12} /> SHARE
                </button>
                {isAuthor && (
                  <button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-xs font-black text-navy hover:bg-cream flex items-center gap-2">
                    <Edit2 size={12} className="text-stitch" /> EDIT
                  </button>
                )}
                {isAuthor && (
                  <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-xs font-black text-red-400 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 size={12} /> DELETE
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {post.imageUrl && (
        <div className="w-full aspect-[4/3] bg-cream overflow-hidden border-y border-accent/30 relative">
          <img src={post.imageUrl} alt="post content" className="w-full h-full object-cover" />
          <div className="absolute bottom-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-lg sticker-shadow">
             <Share2 size={18} className="text-white drop-shadow-md cursor-pointer active:scale-90" onClick={onShare} />
          </div>
        </div>
      )}
      
      <div className="p-5">
        <p className="text-sm leading-relaxed text-navy/80">
          <span className="font-black mr-2 text-navy">@{authorHandle}</span>
          {post.content}
        </p>
      </div>
    </div>
  );
};

const JournalModal: React.FC<{ 
  currentUser: TripMember;
  members: TripMember[];
  initialData: JournalPost | null; 
  onClose: () => void; 
  onSave: (p: JournalPost) => void 
}> = ({ currentUser, members, initialData, onClose, onSave }) => {
  const [content, setContent] = useState(initialData?.content || '');
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '');
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>(initialData?.authorId || currentUser.id);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDone = () => {
    const post: JournalPost = {
      id: initialData?.id || Date.now().toString(),
      authorId: selectedAuthorId,
      content: content,
      imageUrl: imagePreview,
      date: initialData?.date || new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
    };
    onSave(post);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-cream animate-in slide-in-from-bottom duration-300">
      <div className="p-4 flex justify-between items-center border-b border-accent bg-paper">
        <button onClick={onClose} className="text-navy/40 p-2 active:scale-90"><X size={24} /></button>
        <h3 className="text-lg font-black text-navy uppercase tracking-widest">{initialData ? 'Edit Entry' : 'New Journal'}</h3>
        <button 
          onClick={handleDone} 
          className="text-stitch font-black p-2 active:scale-90 disabled:opacity-30"
          disabled={!content.trim()}
        >
          <Send size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Post Composition */}
        <div className="bg-paper p-5 rounded-3xl-sticker border border-accent sticker-shadow flex flex-col min-h-[180px]">
          <textarea 
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Record a memory... #JapanTrip"
            className="flex-1 w-full bg-transparent border-none focus:ring-0 p-0 text-navy placeholder:text-navy/20 text-lg leading-relaxed resize-none"
          />
        </div>

        {/* Member Selection - Included in Edit/New View */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
             <UserCircle2 size={14} className="text-navy/30" />
             <label className="text-[10px] font-black uppercase text-navy/30 tracking-widest">Post as</label>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedAuthorId(member.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all border-2 ${
                  selectedAuthorId === member.id 
                    ? 'bg-navy border-navy text-white sticker-shadow scale-105' 
                    : 'bg-white border-accent text-navy opacity-60'
                }`}
              >
                <div className="relative">
                  <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                  {selectedAuthorId === member.id && (
                    <div className="absolute -top-1 -right-1 bg-stitch rounded-full p-0.5 border border-white">
                      <Check size={8} className="text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tight">{member.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div 
          className="w-full aspect-[4/3] bg-white rounded-3xl-sticker border-2 border-dashed border-accent flex flex-col items-center justify-center sticker-shadow relative overflow-hidden group transition-all active:scale-95"
          onClick={() => document.getElementById('imageInput')?.click()}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="text-white" size={32} />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setImagePreview(''); }}
                className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 shadow-lg"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center text-navy/20">
              <Camera size={48} />
              <p className="text-xs font-black mt-2 uppercase tracking-widest">Snap or Upload</p>
            </div>
          )}
          <input id="imageInput" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>
      </div>

      <div className="p-8 bg-paper border-t border-accent flex flex-col items-center justify-center gap-1">
         <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.4em]">Stitch & Donald Adventure</p>
         <div className="w-12 h-1 bg-accent/30 rounded-full" />
      </div>
    </div>
  );
};

export default Journal;
