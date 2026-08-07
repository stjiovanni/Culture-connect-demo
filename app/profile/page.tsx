"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProducts, getAreas, type Product } from '@/lib/data';
import { useWebHaptics } from 'web-haptics/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  PencilEdit01Icon, Location01Icon, ArrowRight01Icon,
  Cancel01Icon, Tick01Icon, Camera01Icon,
  ImageAdd01Icon, ImageUpload01Icon, Delete02Icon,
  LogoutSquare01Icon
} from '@hugeicons/core-free-icons';
import { useVotes } from '@/context/VoteContext';
import ImageEditor from '@/components/ImageEditor';

import CategoryStack from '@/components/CategoryStack';
import { motion } from 'framer-motion';

function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6" onClick={onCancel}>
      <div className="liquid-glass-modal p-8 rounded-2xl max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <h3 className="heading text-white font-bold">Discard changes</h3>
        <p className="body-text text-[#9E9B96] mb-8">Unsaved changes will be lost. Select discard to proceed.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-text flex-1 px-6 py-3 rounded-full bg-[#6E5B98]/90 text-white font-bold hover:bg-[#6E5B98] backdrop-blur-md transition-all pressable">Keep editing</button>
          <button onClick={onConfirm} className="btn-text flex-1 px-6 py-3 rounded-full bg-[#FF7575]/10 text-[#FF7575] font-bold hover:bg-[#FF7575]/20 border border-[#FF7575]/20 backdrop-blur-md transition-all pressable">Discard</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{message}</div>;
}

function LocationDropdown({
  value,
  onChange,
  areas,
  size = 'md',
}: {
  value: number;
  onChange: (id: number) => void;
  areas: { id: number; name: string }[];
  size?: 'md' | 'lg';
}) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceNeeded = Math.min(areas.length * 44, 220);
      setOpenUp(spaceBelow < spaceNeeded);
    }
    setOpen(prev => !prev);
  };

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  const selected = areas.find(a => a.id === value);
  const py = size === 'lg' ? 'py-3' : 'py-2.5';
  const textSize = size === 'lg' ? 'text-[15px]' : 'text-[14px]';
  const itemPy = size === 'lg' ? 'py-3' : 'py-2.5';

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        data-cuelume-press
        className={`w-full bg-white/5 border ${open ? 'border-[#6E5B98]' : 'border-white/10'} rounded-full px-4 ${py} text-white ${textSize} outline-none text-left flex items-center justify-between transition-colors hover:border-white/20`}
      >
        <span>{selected?.name ?? 'Select location'}</span>
        <svg
          className={`w-4 h-4 text-[#86847F] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 z-[60] bg-[#1A1714] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-150 ${
            openUp ? 'bottom-[calc(100%+8px)] slide-in-from-bottom-2' : 'top-[calc(100%+8px)] slide-in-from-top-2'
          }`}
          style={{ maxHeight: '220px', overflowY: 'auto' }}
        >
          {areas.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => { onChange(a.id); setOpen(false); }}
              data-cuelume-hover="tick"
              className={`w-full text-left px-4 ${itemPy} ${textSize} transition-colors pressable ${
                a.id === value
                  ? 'text-white font-semibold bg-[#6E5B98]/20'
                  : 'text-[#9E9B96] hover:text-white hover:bg-white/5'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const haptic = useWebHaptics();
  const router = useRouter();
  const allProducts = getProducts();
  const areas = getAreas();
  const { votes, voteCount } = useVotes();
  const [activeTab, setActiveTab] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAvatarLightbox, setShowAvatarLightbox] = useState(false);
  const [showBannerLightbox, setShowBannerLightbox] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'User', lastName: 'One', username: 'user1',
    bio: '', occupation: 'Design Engineer', locationId: 1,
    avatar: '/uploads/avatar_7_1776873674.jpeg',
    banner: '/uploads/header_7_1776873674.jpeg',
    interests: 12,
  });

  useEffect(() => {
    setMounted(true);
    try {
      const saved = sessionStorage.getItem('user_profile');
      if (saved) {
        setProfile(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch { }
  }, []);

  const [draft, setDraft] = useState({ ...profile });
  const [cropping, setCropping] = useState<{ src: string; type: 'avatar' | 'banner' } | null>(null);

  const editSheetRef = useRef<HTMLDivElement>(null);
  const editDragY = useRef(0);
  const editTouchStartY = useRef(0);

  const displayName = mounted ? `${profile.firstName} ${profile.lastName}` : 'User One';
  const bannerSrc = mounted ? profile.banner : '/uploads/header_7_1776873674.jpeg';
  const avatarSrc = mounted ? profile.avatar : '/uploads/avatar_7_1776873674.jpeg';
  const displayUsername = mounted ? profile.username : 'user1';
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
    window.dispatchEvent(new Event('profile-updated'));
    setIsEditing(false);
    haptic.trigger('success');
    setToast('Profile saved.');
  };
  const cancelEditing = () => { if (hasDraftChanges) { setShowDiscard(true); } else { setIsEditing(false); haptic.trigger('light'); } };
  const confirmDiscard = () => { setDraft({ ...profile }); setIsEditing(false); setShowDiscard(false); haptic.trigger('warning'); };

  const handleEditTouchStart = (e: React.TouchEvent) => {
    editTouchStartY.current = e.touches[0].clientY;
  };

  const handleEditTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - editTouchStartY.current;
    if (deltaY > 0 && editSheetRef.current) {
      editDragY.current = deltaY;
      editSheetRef.current.style.transform = `translateY(${deltaY}px)`;
      editSheetRef.current.style.opacity = `${Math.max(0.4, 1 - deltaY / 400)}`;
    }
  };

  const handleEditTouchEnd = () => {
    if (editDragY.current > 120) {
      if (hasDraftChanges) {
        if (editSheetRef.current) {
          editSheetRef.current.style.transform = 'translateY(0)';
          editSheetRef.current.style.opacity = '1';
        }
        editDragY.current = 0;
        setShowDiscard(true);
      } else {
        haptic.trigger('light');
        setIsEditing(false);
      }
    } else {
      haptic.trigger('selection');
      if (editSheetRef.current) {
        editSheetRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        editSheetRef.current.style.transform = 'translateY(0)';
        editSheetRef.current.style.opacity = '1';
        setTimeout(() => {
          if (editSheetRef.current) {
            editSheetRef.current.style.transition = '';
          }
        }, 300);
      }
      editDragY.current = 0;
    }
  };

  // Profile initialization is now handled in useEffect to avoid hydration mismatch and sync setState during render

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && isEditing && !showDiscard && !cropping) cancelEditing(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isEditing, showDiscard, cropping, hasDraftChanges]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCropping({ src: event.target.result as string, type });
        }
      };
      reader.readAsDataURL(file);
      haptic.trigger('selection');
    }
    e.target.value = '';
  };

  const applyCrop = (dataUrl: string) => {
    if (cropping) {
      setDraft(prev => ({ ...prev, [cropping.type]: dataUrl }));
      setCropping(null);
      haptic.trigger('success');
    }
  };

  const currentAvatar = isEditing ? draft.avatar : avatarSrc;
  const currentBanner = isEditing ? draft.banner : bannerSrc;
  const currentName = isEditing ? `${draft.firstName} ${draft.lastName}` : displayName;

  /* ─── EDITING VIEW (Modal & Sheet) ─── */
  if (isEditing) {
    return (
      <>
        {/* Desktop: Modal Layout */}
        <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelEditing} aria-hidden="true" />

          <div className="relative w-full max-w-lg bg-[#0C0B0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in zoom-in-95 translate-y-6 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <button onClick={cancelEditing} className="p-2 hover:bg-white/5 rounded-full transition-colors pressable" aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} size={20} className="text-[#86847F]" />
              </button>
              <span className="btn-text font-bold text-white">Edit profile</span>
              <button onClick={saveProfile} className="btn-text liquid-glass-strong-purple text-white px-5 py-1.5 rounded-full font-bold transition-all pressable">
                Save
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto max-h-[75vh] scroll-area">
              {/* Banner Area */}
              <div className="relative h-36 w-full overflow-hidden">
                <Image src={currentBanner} alt="Banner" fill sizes="100vw" className="object-cover" priority />
                <div className="absolute inset-0 bg-black/40" />
                {/* Banner Controls */}
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <label className="p-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-all pressable">
                    <HugeiconsIcon icon={Camera01Icon} size={20} className="text-white" />
                    <input type="file" title="Upload banner" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'banner')} />
                  </label>
                  <button onClick={() => { setDraft(p => ({ ...p, banner: '/uploads/header_7_1776873674.jpeg' })); haptic.trigger('warning'); }} className="p-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/20 transition-all pressable" aria-label="Remove banner">
                    <HugeiconsIcon icon={Delete02Icon} size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Avatar Overlap */}
              <div className="relative px-6 pt-0 pb-4">
                <div className="absolute top-[-28px] left-6 z-30 group">
                  <div className="relative w-[84px] h-[84px] rounded-full border-[4px] border-[#0C0B0A] overflow-hidden shadow-2xl bg-[#161412]">
                    <Image src={currentAvatar} alt="Avatar" fill sizes="96px" className="object-cover" />
                    <label data-cuelume-press className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity pressable">
                      <HugeiconsIcon icon={Camera01Icon} size={24} className="text-white" />
                      <input type="file" title="Upload avatar" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'avatar')} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="px-6 pt-16 pb-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modal-fn" className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">First name</label>
                    <input id="modal-fn" type="text" aria-label="First name" value={draft.firstName} onChange={e => setDraft(p => ({ ...p, firstName: e.target.value }))} className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modal-ln" className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">Last name</label>
                    <input id="modal-ln" type="text" aria-label="Last name" value={draft.lastName} onChange={e => setDraft(p => ({ ...p, lastName: e.target.value }))} className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-un" className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86847F]">@</span>
                    <input id="modal-un" type="text" aria-label="Username" value={draft.username} onChange={e => setDraft(p => ({ ...p, username: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-full pl-8 pr-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-occ" className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">Occupation</label>
                  <input id="modal-occ" type="text" aria-label="Occupation" value={draft.occupation} onChange={e => setDraft(p => ({ ...p, occupation: e.target.value }))} className="bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98]" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">Location</label>
                  <LocationDropdown
                    value={draft.locationId}
                    onChange={(id) => { setDraft(p => ({ ...p, locationId: id })); haptic.trigger('selection'); }}
                    areas={areas}
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Bottom Sheet Layout */}
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/60" onClick={cancelEditing} aria-hidden="true" />

          <div ref={editSheetRef} className="relative bg-[#0C0B0A] border-t border-white/10 rounded-t-2xl z-50 animate-in slide-in-from-bottom duration-300 flex flex-col h-full mt-auto">
            <div
              className="shrink-0"
              onTouchStart={handleEditTouchStart}
              onTouchMove={handleEditTouchMove}
              onTouchEnd={handleEditTouchEnd}
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-2" />

              {/* Top Action Bar */}
              <div className="flex items-center justify-between px-4 py-3">
                <button onClick={cancelEditing} className="btn-text liquid-glass-red px-5 py-2 rounded-full text-[#FF7575] font-bold pressable">
                  Cancel
                </button>
                <button onClick={saveProfile} className="btn-text liquid-glass-strong-purple px-5 py-2 rounded-full text-white font-bold pressable">
                  Save
                </button>
              </div>
            </div>

            {/* Banner — full width, no padding, no rounding, outside scroll container */}
            <div className="relative h-28 w-full overflow-hidden shrink-0">
              <Image src={currentBanner} alt="Banner" fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center gap-3">
                <label data-cuelume-press className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full cursor-pointer pressable">
                  <HugeiconsIcon icon={Camera01Icon} size={18} className="text-white" />
                  <input type="file" title="Upload banner" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'banner')} />
                </label>
                <button onClick={() => { setDraft(p => ({ ...p, banner: '/uploads/header_7_1776873674.jpeg' })); haptic.trigger('warning'); }} data-cuelume-press className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full pressable" aria-label="Remove banner">
                  <HugeiconsIcon icon={Delete02Icon} size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Avatar overlap — outside scroll, full width reference */}
            <div className="relative h-10 shrink-0 px-4">
              <div className="absolute top-[-20px] left-4 z-30">
                <div className="relative w-16 h-16 rounded-full border-[3px] border-[#0C0B0A] overflow-hidden shadow-2xl bg-[#161412]">
                  <Image src={currentAvatar} alt="Avatar" fill className="object-cover" />
                  <label data-cuelume-press className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer pressable">
                    <HugeiconsIcon icon={Camera01Icon} size={20} className="text-white" />
                    <input type="file" title="Upload avatar" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'avatar')} />
                  </label>
                </div>
              </div>
            </div>

            {/* Scrollable form fields — no banner inside here */}
            <div className="overflow-y-auto px-4 scroll-area" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
              <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">First name</label>
                  <input id="profile-fn" name="firstName" type="text" aria-label="First name" value={draft.firstName} onChange={e => setDraft(p => ({ ...p, firstName: e.target.value }))} className="bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white text-[15px] outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">Last name</label>
                  <input id="profile-ln" name="lastName" type="text" aria-label="Last name" value={draft.lastName} onChange={e => setDraft(p => ({ ...p, lastName: e.target.value }))} className="bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white text-[15px] outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86847F]">@</span>
                    <input id="profile-un" name="username" type="text" aria-label="Username" value={draft.username} onChange={e => setDraft(p => ({ ...p, username: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-full pl-8 pr-4 py-3 text-white text-[15px] outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">Occupation</label>
                  <input id="profile-occ" name="occupation" type="text" aria-label="Occupation" value={draft.occupation} onChange={e => setDraft(p => ({ ...p, occupation: e.target.value }))} className="bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white text-[15px] outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold tracking-[-0.5px]">Location</label>
                  <LocationDropdown
                    value={draft.locationId}
                    onChange={(id) => { setDraft(p => ({ ...p, locationId: id })); haptic.trigger('selection'); }}
                    areas={areas}
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Flow Modals */}
        {cropping && (
          <ImageEditor
            src={cropping.src}
            aspect={cropping.type === 'avatar' ? 1 : 3}
            circular={cropping.type === 'avatar'}
            label={cropping.type === 'avatar' ? 'Profile photo' : 'Profile header'}
            onConfirm={applyCrop}
            onCancel={() => setCropping(null)}
          />
        )}
        {showDiscard && <ConfirmDialog onConfirm={confirmDiscard} onCancel={() => setShowDiscard(false)} />}
      </>
    );
  }

  /* ─── DEFAULT VIEW ─── */
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* 1. Header Section — Desktop: 55vh Banner, Mobile: Inline Profile */}
      <div className="relative">
        {/* Desktop Banner (md+) */}
        <div className="hidden md:block relative h-[55vh] w-full overflow-hidden shrink-0">
          <div 
            className="absolute inset-0 cursor-zoom-in z-0" 
            onClick={() => setShowBannerLightbox(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowBannerLightbox(true); } }}
            role="button"
            tabIndex={0}
            aria-label="View banner full screen"
          >
            <Image
              src={bannerSrc}
              alt="Profile banner"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            {/* High-fidelity dissolve gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A]/40 to-transparent" />
          </div>

          {/* Identity Overlay — anchored to bottom */}
          <div className="absolute bottom-8 left-10 right-10 z-20 flex items-end justify-between gap-8">
            <div className="flex items-center gap-8">
              {/* Avatar overlap */}
              <button
                onClick={() => setShowAvatarLightbox(true)}
                className="relative w-[100px] h-[100px] rounded-full border-[4px] border-[#0C0B0A] overflow-hidden shadow-2xl shrink-0 cursor-zoom-in hover:scale-105 transition-transform duration-300 pressable"
                aria-label="View profile photo full screen"
              >
                <Image
                  src={avatarSrc}
                  alt="Profile avatar"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>

              {/* Typography with mix-blend-mode for auto-contrast */}
              <div className="isolation-auto">
                {/* eslint-disable-next-line react/no-unknown-property */}
                <div style={{ mixBlendMode: 'difference' }} className="text-white">
                  <h1 className="heading font-serif text-white tracking-tight">{displayName}</h1>
                  <p className="body-text opacity-90 tracking-tight">@{displayUsername}</p>
                </div>

                {/* Profile Details — Location & Occupation */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#6E5B98]/20 backdrop-blur-md border border-[#6E5B98]/30">
                    <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#DDD6F3]" />
                    <span className="text-[13px] font-bold text-white tracking-[-0.5px]">{locationName}</span>
                  </div>
                  {profile.occupation && (
                    <div className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#6E5B98]/20 backdrop-blur-md border border-[#6E5B98]/30">
                      <span className="text-[13px] font-black text-white tracking-[-0.5px]">{profile.occupation}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button — moved to the far right */}
            <div className="mb-2 shrink-0">
              <button
                onClick={startEditing}
                className="btn-text liquid-glass-strong-purple px-6 py-2.5 rounded-full font-bold text-white transition-all pressable"
              >
                Edit profile
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Banner Header */}
        <div className="md:hidden relative h-[55vh] w-full overflow-hidden shrink-0">
          <div 
            className="absolute inset-0 cursor-zoom-in z-0" 
            onClick={() => setShowBannerLightbox(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowBannerLightbox(true); } }}
            role="button"
            tabIndex={0}
            aria-label="View banner full screen"
          >
            <Image
              src={bannerSrc}
              alt="Profile banner"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            {/* High-fidelity dissolve gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A]/40 to-transparent" />
          </div>

          {/* Mobile Logout Button (top right) */}
          <button
            onClick={() => {
              haptic.trigger('warning');
              router.push('/landing');
            }}
            className="absolute top-4 right-4 z-30 liquid-glass-strong-red text-white px-4 py-2 rounded-full text-[13px] font-bold pressable flex items-center gap-1.5"
            style={{ position: 'absolute' }}
            aria-label="Log out"
          >
            <HugeiconsIcon icon={LogoutSquare01Icon} size={15} />
            <span>Logout</span>
          </button>

          {/* Identity Overlay */}
          <div className="absolute bottom-6 left-4 right-4 z-20">
            {/* Row 1: Avatar + Name/Username */}
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => setShowAvatarLightbox(true)}
                className="relative w-[48px] h-[48px] shrink-0 rounded-full border-[3px] border-[#0C0B0A] overflow-hidden shadow-xl cursor-zoom-in active:scale-95 transition-transform pressable"
                aria-label="View profile photo full screen"
              >
                <Image src={avatarSrc} alt="Profile avatar" fill sizes="96px" className="object-cover" />
              </button>
              <div>
                <h1 className="heading font-serif text-white">{displayName}</h1>
                <p className="text-[12px] font-bold text-white/70">@{displayUsername}</p>
              </div>
            </div>
            {/* Row 2: Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6E5B98]/20 backdrop-blur-md border border-[#6E5B98]/30">
                <HugeiconsIcon icon={Location01Icon} size={12} className="text-[#DDD6F3]" />
                <span className="text-[12px] font-bold text-white tracking-[-0.5px]">{locationName}</span>
              </div>
              {profile.occupation && (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6E5B98]/20 backdrop-blur-md border border-[#6E5B98]/30">
                  <span className="text-[12px] font-bold text-white tracking-[-0.5px]">
                    {profile.occupation.slice(0, 20)}{profile.occupation.length > 20 ? '…' : ''}
                  </span>
                </div>
              )}
              <button onClick={startEditing} className="btn-text ml-auto shrink-0 liquid-glass-strong-purple px-4 py-2 rounded-full font-bold text-white transition-all pressable">
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-10 pb-32">
        {/* Section Header */}
        <div className="mt-12 text-left max-w-lg">
          <h2 className="heading font-serif text-white tracking-tight">Votes</h2>
          <p className="body-text text-[#86847F]">
            Review and manage all items you selected across products and services within the community showcase.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-center mt-8 mb-10">
          <div className="glass-pill p-1 rounded-full flex items-center relative">
            {['all', 'products', 'services'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); haptic.trigger('selection'); }}
                className={`relative px-6 md:px-8 py-2 md:py-2.5 rounded-full text-[13px] md:text-[14px] transition-colors pressable z-10 ${activeTab === tab
                    ? 'text-black font-semibold'
                    : 'text-[#9E9B96] font-normal hover:text-white'
                  }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="profileTabIndicator"
                    className="absolute inset-0 bg-white rounded-full shadow-xl z-0"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content - Category-Grouped Stacked Cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } },
          }}
          initial="hidden"
          animate="show"
        >
          {categorizedVotes.length > 0 ? (
            categorizedVotes.map(([category, items]) => (
              <motion.div
                key={category}
                variants={{
                  hidden: { opacity: 0, y: 12, rotate: -2 },
                  show: { opacity: 1, y: 0, rotate: 0 },
                }}
              >
                <CategoryStack
                  category={category}
                  items={items}
                  haptic={haptic}
                />
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <HugeiconsIcon icon={ArrowRight01Icon} size={24} className="text-[#86847F] opacity-20" />
              </div>
              <p className="text-[#86847F] font-medium">No votes yet.</p>
              <Link href="/discover" className="mt-4 text-[#6E5B98] font-bold text-sm hover:underline">
                Explore offerings
              </Link>
            </div>
          )}
        </motion.div>
      </main>

      {/* Global Overlays */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Avatar Lightbox */}
      {showAvatarLightbox && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setShowAvatarLightbox(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowAvatarLightbox(false); }}
          tabIndex={-1}
          ref={(el) => el?.focus()}
          role="dialog"
          aria-modal="true"
          aria-label="Avatar photo"
        >
          <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <Image src={avatarSrc} alt="Profile photo" fill sizes="100vw" className="object-cover" />
          </div>
        </div>
      )}

      {/* Banner Lightbox */}
      {showBannerLightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setShowBannerLightbox(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowBannerLightbox(false); }}
          tabIndex={-1}
          ref={(el) => el?.focus()}
          role="dialog"
          aria-modal="true"
          aria-label="Profile banner"
        >
          <div className="relative w-full max-w-3xl aspect-[3/1] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <Image src={bannerSrc} alt="Profile banner" fill sizes="100vw" className="object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}
