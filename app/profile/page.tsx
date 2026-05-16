"use client";

import Image from 'next/image';
import Link from 'next/link';
import { getProducts, getAreas, type Product } from '@/lib/data';
import { useWebHaptics } from 'web-haptics/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PencilEdit01Icon, Location01Icon, ArrowRight01Icon, 
  Cancel01Icon, Tick01Icon, Camera01Icon, 
  ImageAdd01Icon, ImageUpload01Icon, Delete02Icon
} from '@hugeicons/core-free-icons';
import { useVotes } from '@/context/VoteContext';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import CategoryStack from '@/components/CategoryStack';

function CropUI({ 
  src, 
  aspect, 
  circular, 
  onConfirm, 
  onCancel 
}: { 
  src: string; 
  aspect?: number; 
  circular?: boolean; 
  onConfirm: (dataUrl: string) => void; 
  onCancel: () => void 
}) {
  const [crop, setCrop] = useState<Crop>();
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
        width,
        height
      ));
    }
    setImgRef(e.currentTarget);
  }

  const handleApply = () => {
    if (!imgRef || !crop) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        imgRef,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
      onConfirm(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full flex flex-col gap-8">
        <div className="relative bg-[#1A1814] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center min-h-[300px]">
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            aspect={aspect}
            circularCrop={circular}
            className="max-h-[60vh]"
          >
            <img src={src} onLoad={onImageLoad} alt="Crop" className="max-h-[60vh] object-contain" />
          </ReactCrop>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={onCancel}
            className="px-8 py-3 rounded-full border border-white/10 text-white font-bold text-[13px] hover:bg-white/5 transition-all pressable"
          >
            Cancel
          </button>
          <button 
            onClick={handleApply}
            className="px-8 py-3 rounded-full bg-white text-black font-bold text-[13px] hover:bg-[#E8E6E1] transition-all pressable"
          >
            Apply crop
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6" onClick={onCancel}>
      <div className="bg-[#161412] p-8 rounded-2xl border border-white/10 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <h3 className="text-white text-lg font-bold mb-2">Discard changes?</h3>
        <p className="text-[#9E9B96] text-[14px] mb-8 leading-relaxed">You have unsaved changes to your profile. Are you sure you want to discard them?</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-6 py-3 rounded-full border border-white/10 text-white text-[13px] font-bold hover:bg-white/5 transition-all pressable">Keep editing</button>
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

  const [profile, setProfile] = useState(() => {
    const defaultVal = {
      firstName: 'Admin', lastName: 'Account', username: 'admin_cul',
      bio: '', occupation: 'Design Engineer', locationId: 1,
      avatar: '/uploads/avatar_7_1776873674.jpeg',
      banner: '/uploads/cultural-textiles-craft.jpeg',
      interests: 12,
    };
    if (typeof window === 'undefined') return defaultVal;
    try {
      const saved = sessionStorage.getItem('user_profile');
      return saved ? { ...defaultVal, ...JSON.parse(saved) } : defaultVal;
    } catch {
      return defaultVal;
    }
  });

  const [draft, setDraft] = useState({ ...profile });
  const [cropping, setCropping] = useState<{ src: string; type: 'avatar' | 'banner' } | null>(null);

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

  // Profile initialization is now handled in useState initializer to avoid sync setState in useEffect

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

  const currentAvatar = isEditing ? draft.avatar : profile.avatar;
  const currentBanner = isEditing ? draft.banner : profile.banner;
  const currentName = isEditing ? `${draft.firstName} ${draft.lastName}` : displayName;

  /* ─── EDITING VIEW (Modal & Sheet) ─── */
  if (isEditing) {
    return (
      <>
        {/* Desktop: Modal Layout */}
        <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={cancelEditing} aria-hidden="true" />
          
          <div className="relative w-full max-w-lg bg-[#0C0B0A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <button onClick={cancelEditing} className="p-2 hover:bg-white/5 rounded-full transition-colors pressable" aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} size={20} className="text-[#86847F]" />
              </button>
              <span className="text-[14px] font-bold text-white">Edit profile</span>
              <button onClick={saveProfile} className="bg-white text-black px-5 py-1.5 rounded-full text-[13px] font-bold hover:bg-[#E8E6E1] transition-all pressable">
                Save
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto max-h-[75vh]">
              {/* Banner Area */}
              <div className="relative h-36 w-full overflow-hidden">
                <Image src={currentBanner} alt="Banner" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-black/20" />
                {/* Banner Controls */}
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <label className="p-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-all pressable">
                    <HugeiconsIcon icon={Camera01Icon} size={20} className="text-white" />
                    <input type="file" title="Upload banner" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'banner')} />
                  </label>
                  <label className="p-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-all pressable">
                    <HugeiconsIcon icon={Camera01Icon} size={20} className="text-white" />
                    <input type="file" title="Swap banner" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'banner')} />
                  </label>
                  <button onClick={() => { setDraft(p => ({ ...p, banner: '/uploads/cultural-textiles-craft.jpeg' })); haptic.trigger('warning'); }} className="p-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/20 transition-all pressable" aria-label="Remove banner">
                    <HugeiconsIcon icon={Delete02Icon} size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Avatar Overlap */}
              <div className="relative px-6 pt-0 pb-4">
                <div className="absolute top-[-28px] left-6 z-30 group">
                  <div className="relative w-[84px] h-[84px] rounded-full border-[4px] border-[#0C0B0A] overflow-hidden shadow-2xl bg-[#161412]">
                    <Image src={currentAvatar} alt="Avatar" fill className="object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity pressable">
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
                    <label htmlFor="modal-fn" className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">First name</label>
                    <input id="modal-fn" type="text" aria-label="First name" value={draft.firstName} onChange={e => setDraft(p => ({ ...p, firstName: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="modal-ln" className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">Last name</label>
                    <input id="modal-ln" type="text" aria-label="Last name" value={draft.lastName} onChange={e => setDraft(p => ({ ...p, lastName: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-un" className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86847F]">@</span>
                    <input id="modal-un" type="text" aria-label="Username" value={draft.username} onChange={e => setDraft(p => ({ ...p, username: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98]" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-occ" className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">Occupation</label>
                  <input id="modal-occ" type="text" aria-label="Occupation" value={draft.occupation} onChange={e => setDraft(p => ({ ...p, occupation: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98]" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="modal-loc" className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">Location</label>
                  <select id="modal-loc" aria-label="Location" value={draft.locationId} onChange={e => setDraft(p => ({ ...p, locationId: parseInt(e.target.value) }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] outline-none focus:border-[#6E5B98] appearance-none cursor-pointer">
                    {areas.map(a => <option key={a.id} value={a.id} className="bg-[#0C0B0A]">{a.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Bottom Sheet Layout */}
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={cancelEditing} aria-hidden="true" />
          
          <div className="relative bg-[#0C0B0A] border-t border-white/10 rounded-t-2xl z-50 animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
            {/* Drag handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-2 shrink-0" />
            
            {/* Title pill */}
            <div className="flex justify-center mb-4 shrink-0">
              <span className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[13px] font-bold text-white">
                Edit profile
              </span>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-4 pb-24">
              {/* Banner */}
              <div className="relative h-28 w-full rounded-xl overflow-hidden mb-8">
                <Image src={currentBanner} alt="Banner" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-center justify-center gap-3">
                  <label className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full cursor-pointer transition-all pressable">
                    <HugeiconsIcon icon={Camera01Icon} size={18} className="text-white" />
                    <input type="file" title="Upload banner" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'banner')} />
                  </label>
                  <label className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full cursor-pointer transition-all pressable">
                    <HugeiconsIcon icon={Camera01Icon} size={18} className="text-white" />
                    <input type="file" title="Swap banner" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'banner')} />
                  </label>
                  <button onClick={() => { setDraft(p => ({ ...p, banner: '/uploads/cultural-textiles-craft.jpeg' })); haptic.trigger('warning'); }} className="p-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full transition-all pressable" aria-label="Remove banner">
                    <HugeiconsIcon icon={Delete02Icon} size={18} className="text-white" />
                  </button>
                </div>
                
                {/* Avatar */}
                <div className="absolute bottom-[-16px] left-4 z-30">
                  <div className="relative w-16 h-16 rounded-full border-[3px] border-[#0C0B0A] overflow-hidden bg-[#161412]">
                    <Image src={currentAvatar} alt="Avatar" fill className="object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer transition-opacity pressable">
                      <HugeiconsIcon icon={Camera01Icon} size={20} className="text-white" />
                      <input type="file" title="Upload avatar" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'avatar')} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-6 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">First name</label>
                  <input type="text" aria-label="First name" value={draft.firstName} onChange={e => setDraft(p => ({ ...p, firstName: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">Last name</label>
                  <input type="text" aria-label="Last name" value={draft.lastName} onChange={e => setDraft(p => ({ ...p, lastName: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86847F]">@</span>
                    <input type="text" aria-label="Username" value={draft.username} onChange={e => setDraft(p => ({ ...p, username: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-[15px] outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">Occupation</label>
                  <input type="text" aria-label="Occupation" value={draft.occupation} onChange={e => setDraft(p => ({ ...p, occupation: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#86847F] text-[11px] font-bold uppercase tracking-wider">Location</label>
                  <select aria-label="Location" value={draft.locationId} onChange={e => setDraft(p => ({ ...p, locationId: parseInt(e.target.value) }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] outline-none appearance-none">
                    {areas.map(a => <option key={a.id} value={a.id} className="bg-[#0C0B0A]">{a.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Sticky mobile buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A] to-transparent flex gap-3 shrink-0">
              <button onClick={cancelEditing} className="flex-1 py-3 rounded-full border border-white/10 text-white font-bold text-[14px] pressable">
                Cancel
              </button>
              <button onClick={saveProfile} className="flex-1 py-3 rounded-full bg-[#6E5B98] text-white font-bold text-[14px] pressable">
                Save changes
              </button>
            </div>
          </div>
        </div>

        {/* Edit Flow Modals */}
        {cropping && (
          <CropUI 
            src={cropping.src}
            aspect={cropping.type === 'avatar' ? 1 : undefined}
            circular={cropping.type === 'avatar'}
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
          <Image 
            src={profile.banner} 
            alt="Profile banner" 
            fill 
            className="object-cover"
            priority
          />
          {/* High-fidelity dissolve gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A]/40 to-transparent" />
          
          {/* Identity Overlay — anchored to bottom left */}
          <div className="absolute bottom-8 left-10 z-20 flex items-end gap-8 w-full pr-20">
            {/* Avatar overlap */}
            <div className="relative w-[100px] h-[100px] rounded-full border-[4px] border-[#0C0B0A] overflow-hidden shadow-2xl shrink-0">
              <Image 
                src={profile.avatar} 
                alt="Profile avatar" 
                fill 
                className="object-cover"
              />
            </div>

            {/* Typography with mix-blend-mode for auto-contrast */}
            <div className="flex-1 pb-1 isolation-auto">
              {/* eslint-disable-next-line react/no-unknown-property */}
              <div style={{ mixBlendMode: 'difference' }} className="text-white">
                <h1 className="text-5xl font-serif tracking-tight leading-tight mb-1">{displayName}</h1>
                <p className="text-lg font-bold opacity-90 tracking-tight">@{profile.username}</p>
              </div>
              
              {/* Profile Details — Location & Occupation */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                  <HugeiconsIcon icon={Location01Icon} size={14} className="text-[#DDD6F3]" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">{locationName}</span>
                </div>
                {profile.occupation && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">{profile.occupation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Block */}
            <div className="flex gap-10 items-center mr-10 mb-2">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white tabular-nums">{profile.interests}</span>
                <span className="text-[9px] font-black text-[#86847F] uppercase tracking-[0.2em]">Interests</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white tabular-nums">{voteCount}</span>
                <span className="text-[9px] font-black text-[#86847F] uppercase tracking-[0.2em]">Votes</span>
              </div>
            </div>

            {/* Edit Trigger */}
            <button 
              onClick={startEditing}
              className="absolute bottom-0 right-20 glass-pill px-6 py-2.5 rounded-full text-[13px] font-bold text-white hover:bg-white/10 transition-all pressable"
            >
              Edit profile
            </button>
          </div>
        </div>

        {/* Mobile Header Tabs (<md) */}
        <div className="md:hidden py-4">
          <div className="flex items-center justify-between px-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
                <Image src={profile.avatar} alt="Profile" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">{displayName}</h1>
                <p className="text-[13px] text-[#86847F] font-bold">@{profile.username}</p>
              </div>
            </div>
            <button 
              onClick={startEditing}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white pressable"
              aria-label="Edit profile"
            >
              <HugeiconsIcon icon={Camera01Icon} size={20} />
            </button>
          </div>

          <div className="flex px-6 gap-6 mb-2">
             <div className="flex flex-col">
                <span className="text-xl font-black text-white">{profile.interests}</span>
                <span className="text-[10px] font-bold text-[#86847F] uppercase">Interests</span>
             </div>
             <div className="flex flex-col">
                <span className="text-xl font-black text-white">{voteCount}</span>
                <span className="text-[10px] font-bold text-[#86847F] uppercase">Votes</span>
             </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 md:px-10 pb-32">
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/5 mt-10 mb-10 overflow-x-auto no-scrollbar">
          {['all', 'products', 'services'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); haptic.trigger('selection'); }}
              className={`pb-4 text-[13px] font-bold tracking-tight transition-all relative shrink-0 ${
                activeTab === tab ? 'text-white' : 'text-[#86847F] hover:text-[#9E9B96]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6E5B98] animate-in fade-in duration-300" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-16">
          {categorizedVotes.length > 0 ? (
            categorizedVotes.map(([category, items]) => (
              <CategoryStack 
                key={category} 
                category={category} 
                items={items} 
                haptic={haptic}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <HugeiconsIcon icon={ArrowRight01Icon} size={24} className="text-[#86847F] opacity-20" />
              </div>
              <p className="text-[#86847F] font-medium">No votes yet in this category.</p>
              <Link href="/discover" className="mt-4 text-[#6E5B98] font-bold text-sm hover:underline">
                Explore offerings
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Global Overlays */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
