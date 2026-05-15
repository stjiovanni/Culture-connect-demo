"use client";

import Image from 'next/image';
import Link from 'next/link';
import { getProducts, getAreas, type Product } from '@/lib/data';
import { useWebHaptics } from 'web-haptics/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon, Location01Icon, ArrowRight01Icon, Cancel01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { useVotes } from '@/context/VoteContext';

import CategoryStack from '@/components/CategoryStack';

function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  return (
    <div className="profile-edit-overlay animate-in fade-in duration-200" onClick={onCancel}>
      <div className="confirm-dialog animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <h3 className="text-white text-lg font-bold mb-2">Discard Changes?</h3>
        <p className="text-[#9E9B96] text-[14px] mb-8 leading-relaxed">You have unsaved changes to your profile. Are you sure you want to discard them?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-6 py-3 rounded-full border border-white/10 text-white text-[13px] font-bold hover:bg-white/5 transition-all pressable">Keep Editing</button>
          <button onClick={onConfirm} className="flex-1 px-6 py-3 rounded-full bg-[#FF7575]/10 text-[#FF7575] text-[13px] font-bold hover:bg-[#FF7575]/20 border border-[#FF7575]/20 transition-all pressable">Discard</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{message}</div>;
}

export default function ProfilePage() {
  const haptic = useWebHaptics();
  const allProducts = getProducts();
  const areas = getAreas();
  const { votes, voteCount } = useVotes();
  const [activeTab, setActiveTab] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    firstName: 'Admin', lastName: 'Account', username: 'admin_cul',
    bio: '', occupation: '', locationId: 1,
    avatar: '/uploads/avatar_7_1776873674.jpeg',
    banner: '/uploads/cultural-textiles-craft.jpeg',
    interests: 0,
  });

  const [draft, setDraft] = useState({ ...profile });

  const displayName = `${profile.firstName} ${profile.lastName}`;
  const locationName = areas.find(a => a.id === profile.locationId)?.name || 'Unknown';

  const votedProducts = useMemo(() => allProducts.filter(p => votes.some(v => v.productId === p.id)), [allProducts, votes]);

  const categorizedVotes = useMemo(() => {
    const map = new Map<string, Product[]>();
    const items = activeTab === 'all' ? votedProducts : votedProducts.filter(p => p.type === activeTab.slice(0, -1));
    items.forEach(p => { const arr = map.get(p.category) || []; arr.push(p); map.set(p.category, arr); });
    return Array.from(map.entries());
  }, [votedProducts, activeTab]);

  const hasDraftChanges = JSON.stringify(draft) !== JSON.stringify(profile);

  const startEditing = () => { setDraft({ ...profile }); setIsEditing(true); haptic.trigger('light'); };
  const saveProfile = () => { 
    setProfile({ ...draft }); 
    try {
      sessionStorage.setItem('user_profile', JSON.stringify(draft));
    } catch (e) {
      const { avatar, banner, ...rest } = draft;
      sessionStorage.setItem('user_profile', JSON.stringify({ ...rest, avatar: profile.avatar, banner: profile.banner }));
    }
    setIsEditing(false); 
    haptic.trigger('success'); 
    setToast('Profile saved successfully'); 
  };
  const cancelEditing = () => { if (hasDraftChanges) { setShowDiscard(true); } else { setIsEditing(false); haptic.trigger('light'); } };
  const confirmDiscard = () => { setDraft({ ...profile }); setIsEditing(false); setShowDiscard(false); haptic.trigger('warning'); };

  useEffect(() => {
    const saved = sessionStorage.getItem('user_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && isEditing && !showDiscard) cancelEditing(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isEditing, showDiscard, hasDraftChanges]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDraft(prev => ({ ...prev, [type]: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
      haptic.trigger('selection');
    }
    e.target.value = '';
  };

  const currentAvatar = isEditing ? draft.avatar : profile.avatar;
  const currentBanner = isEditing ? draft.banner : profile.banner;
  const currentName = isEditing ? `${draft.firstName} ${draft.lastName}` : displayName;

  /* ─── EDITING VIEW ─── */
  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen font-sans">
        {/* Banner — 40% height */}
        <div className="relative h-[40vh] w-full overflow-hidden">
          <Image src={currentBanner} alt="Banner" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A] via-transparent to-transparent" />

          {/* Mobile: Cancel/Save at top */}
          <div className="md:hidden absolute top-4 left-4 right-4 z-20 flex justify-between">
            <button onClick={cancelEditing} className="bg-[#DC2626]/80 text-white px-4 py-1.5 rounded-full text-[13px] font-bold pressable">Cancel</button>
            <button onClick={saveProfile} className="bg-[#6E5B98]/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[13px] font-bold pressable">Save</button>
          </div>


          {/* Avatar with edit overlay */}
          <div className="absolute bottom-[-40px] left-10 z-30">
            <div className="relative w-[90px] h-[90px] rounded-full border-[3px] border-[#0C0B0A] overflow-hidden shadow-2xl">
              <Image src={currentAvatar} alt="Avatar" fill className="object-cover" />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer pressable">
                <HugeiconsIcon icon={PencilEdit01Icon} size={18} className="text-white" />
                <input type="file" title="Upload Avatar" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'avatar')} />
              </label>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="max-w-[1400px] mx-auto w-full px-6 md:px-10 pt-16 pb-12">
          {/* Desktop: action buttons */}
          <div className="hidden md:flex justify-end gap-3 mb-8">
            <button onClick={cancelEditing} className="px-6 py-2.5 rounded-full border border-white/10 text-white text-[13px] font-bold hover:bg-white/5 transition-all pressable">Cancel</button>
            <button onClick={saveProfile} className="px-6 py-2.5 rounded-full bg-[#6E5B98] text-white text-[13px] font-bold hover:bg-[#5C4A85] transition-all pressable shadow-xl shadow-[#6E5B98]/20">Save Changes</button>
          </div>

          {/* Desktop & Mobile: image choosers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[#86847F] text-[12px] font-bold mb-3">Profile Picture</p>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10 shrink-0">
                  <Image src={currentAvatar} alt="Avatar" fill className="object-cover" />
                </div>
                <label className="cursor-pointer bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-white/10 transition-all pressable">
                  Choose new image…
                  <input type="file" title="Choose new image" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'avatar')} />
                </label>
              </div>
            </div>
            <div>
              <p className="text-[#86847F] text-[12px] font-bold mb-3">Header / Cover Image</p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0">
                  <Image src={currentBanner} alt="Banner" fill className="object-cover" />
                </div>
                <label className="cursor-pointer bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-full text-[13px] font-bold hover:bg-white/10 transition-all pressable">
                  Choose cover…
                  <input type="file" title="Choose cover image" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'banner')} />
                </label>
              </div>
            </div>
          </div>

          <div className="field-divider mb-6" />

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
            {/* First Name */}
            <div className="py-4">
              <label htmlFor="first-name" className="text-[#86847F] text-[12px] font-bold mb-2 block">First Name</label>
              <input id="first-name" title="First Name" placeholder="First Name" type="text" value={draft.firstName} onChange={e => setDraft(p => ({ ...p, firstName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#6E5B98] transition-colors" />
            </div>
            <div className="field-divider md:hidden" />

            {/* Last Name */}
            <div className="py-4">
              <label htmlFor="last-name" className="text-[#86847F] text-[12px] font-bold mb-2 block">Last Name</label>
              <input id="last-name" title="Last Name" placeholder="Last Name" type="text" value={draft.lastName} onChange={e => setDraft(p => ({ ...p, lastName: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#6E5B98] transition-colors" />
            </div>

            <div className="field-divider col-span-1 md:col-span-2" />

            {/* Username */}
            <div className="py-4">
              <label htmlFor="username" className="text-[#86847F] text-[12px] font-bold mb-2 block">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86847F] text-[14px]">@</span>
                <input id="username" title="Username" placeholder="Username" type="text" value={draft.username} onChange={e => setDraft(p => ({ ...p, username: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-[14px] outline-none focus:border-[#6E5B98] transition-colors" />
              </div>
            </div>
            <div className="field-divider md:hidden" />

            {/* Occupation */}
            <div className="py-4">
              <label htmlFor="occupation" className="text-[#86847F] text-[12px] font-bold mb-2 block">Occupation</label>
              <input id="occupation" title="Occupation" type="text" value={draft.occupation} onChange={e => setDraft(p => ({ ...p, occupation: e.target.value }))} placeholder="e.g. Graphic Designer" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#6E5B98] transition-colors placeholder-[#86847F]/50" />
            </div>

            <div className="field-divider col-span-1 md:col-span-2" />

            {/* Location (dropdown) */}
            <div className="py-4">
              <label htmlFor="location" className="text-[#86847F] text-[12px] font-bold mb-2 block">Location (Area)</label>
              <select id="location" title="Location (Area)" value={draft.locationId} onChange={e => setDraft(p => ({ ...p, locationId: parseInt(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[14px] outline-none focus:border-[#6E5B98] transition-colors appearance-none cursor-pointer">
                {areas.map(a => <option key={a.id} value={a.id} className="bg-[#161412] text-white">{a.name}</option>)}
              </select>
            </div>
            <div className="field-divider md:hidden" />
          </div>
        </div>

        {showDiscard && <ConfirmDialog onConfirm={confirmDiscard} onCancel={() => setShowDiscard(false)} />}
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </div>
    );
  }

  /* ─── DEFAULT VIEW ─── */
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Banner — 40% height */}
      <div className="relative h-[30vh] md:h-[40vh] w-full overflow-hidden shrink-0">
        <Image src={profile.banner} alt="Banner" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A]/40 to-transparent" />
        
        {/* Profile Avatar overlaying the banner bottom */}
        <div className="absolute bottom-[-30px] left-6 md:left-10 z-20">
          <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full border-[4px] border-[#0C0B0A] overflow-hidden shadow-2xl bg-[#161412]">
            <Image src={profile.avatar} alt="Avatar" fill className="object-cover" />
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto w-full px-6 md:px-10 py-10 flex flex-col flex-1 overflow-visible">
        {/* Top actions & Heading */}
        <div className="flex justify-between items-start mb-10">
          <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tighter leading-none [text-wrap:balance]">
            {["Your", "Profile"].map((word, i) => (
              <span 
                key={i} 
                className="inline-block animate-in fade-in slide-in-from-bottom-2"
                style={{ 
                  animationDuration: '700ms',
                  animationDelay: `${i * 70}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both'
                }}
              >
                {word}{i < 1 ? '\u00A0' : ''}
              </span>
            ))}
          </h1>
          <button onClick={startEditing} className="px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white font-bold text-[13px] backdrop-blur-md hover:bg-white/20 transition-all pressable flex items-center gap-2">
            <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
            Edit Profile
          </button>
        </div>

        <div className="flex flex-col gap-6 mb-16">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-[#86847F] text-sm font-bold w-1/3">Name</span>
            <span className="text-[#DDD6F3] text-[15px] font-bold w-2/3 text-right md:text-left">{displayName}</span>
          </div>
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-[#86847F] text-sm font-bold w-1/3">Username</span>
            <span className="text-[#DDD6F3] text-[15px] font-bold w-2/3 text-right md:text-left">@{profile.username}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-[#86847F] text-sm font-bold w-1/3">Occupation</span>
            <span className="text-[#DDD6F3] text-[15px] font-bold w-2/3 text-right md:text-left">{profile.occupation || '—'}</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-[#86847F] text-sm font-bold w-1/3">Location</span>
            <span className="text-[#DDD6F3] text-[15px] font-bold w-2/3 text-right md:text-left flex items-center justify-end md:justify-start gap-1">
              <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#6E5B98]" /> {locationName}
            </span>
          </div>
        </div>

        {/* Votes Section */}
        <h2 className="text-5xl font-bold text-white mb-8 [text-wrap:balance]">
          {["Your", "Votes"].map((word, i) => (
            <span 
              key={i} 
              className="inline-block animate-in fade-in slide-in-from-bottom-2"
              style={{ 
                animationDuration: '700ms',
                animationDelay: `${i * 70}ms`,
                animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                animationFillMode: 'both'
              }}
            >
              {word}{i < 1 ? '\u00A0' : ''}
            </span>
          ))}
        </h2>
        <div className="flex justify-start mb-10">
          <div className="bg-[#161412]/85 backdrop-blur-xl border border-white/[0.08] p-1 rounded-full flex items-center">
            {['all', 'products', 'services'].map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); haptic.trigger('selection'); }} className={`px-8 py-2.5 rounded-full text-[14px] font-bold transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-[#9E9B96] hover:text-white'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {categorizedVotes.map(([category, items], i) => (
            <div key={category} className={`animate-in fade-in slide-in-from-bottom-4 duration-500 animation-delay-${i * 100}`}>
              <CategoryStack category={category} items={items} haptic={haptic} />
            </div>
          ))}
        </div>

        {categorizedVotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <p className="text-white text-lg font-bold tracking-tight">No votes yet.</p>
            <Link href="/discover" className="text-[11px] font-bold text-[#6E5B98] hover:underline">Discover products & services</Link>
          </div>
        )}
      </main>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
