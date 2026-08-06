"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebHaptics } from 'web-haptics/react';
import { ArrowUpRight, X, BookOpen, FileText, Award, Sparkles, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  readmeContent: string;
  attributionsContent: string;
  guidelinesContent: string;
}

export default function LandingPage({
  readmeContent,
  attributionsContent,
  guidelinesContent
}: LandingPageProps) {
  const router = useRouter();
  const haptic = useWebHaptics();
  
  const [londonTime, setLondonTime] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'readme' | 'guidelines' | 'attributions'>('readme');

  // Clock Synchronization (GMT +0 / Europe/London Time Zone)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setLondonTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEnterApp = () => {
    haptic.trigger('success');
    router.push('/discover');
  };

  const handleOpenModal = () => {
    haptic.trigger('light');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    haptic.trigger('light');
    setIsModalOpen(false);
  };

  // Custom high-fidelity inline markdown parser
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    if (text.includes('<!--') || text.includes('-->')) {
      return null;
    }
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const closeBracketIdx = part.indexOf(']');
        const label = part.slice(1, closeBracketIdx);
        const url = part.slice(closeBracketIdx + 2, -1);
        return (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-[#DDD6F3] underline hover:text-white font-bold transition-colors">
            {label}
          </a>
        );
      }
      return part;
    });
  };

  // Custom block-level markdown parser
  const parseMarkdown = (markdown: string) => {
    const cleanLines = markdown
      .split('\n')
      .filter(line => !line.trim().startsWith('<!--') && !line.trim().startsWith('-->') && !line.trim().startsWith('* General guidelines') && !line.trim().startsWith('* Design system guidelines'));

    let inList = false;
    const elements: React.ReactNode[] = [];

    cleanLines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      // Skip empty spaces at start/end of comments
      if (trimmed.startsWith('* Purpose :') || trimmed.startsWith('* Visual Style :') || trimmed.startsWith('* Usage :')) {
        return;
      }
      
      // Handle Headers
      if (trimmed.startsWith('# ')) {
        inList = false;
        elements.push(
          <h2 key={idx} className="text-3xl font-serif text-white tracking-tight mt-6 mb-4 border-b border-white/5 pb-2">
            {trimmed.replace('# ', '')}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        inList = false;
        elements.push(
          <h3 key={idx} className="text-xl font-bold text-[#DDD6F3] tracking-tight mt-5 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-[#6E5B98]" />
            {trimmed.replace('## ', '')}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('### ')) {
        inList = false;
        elements.push(
          <h4 key={idx} className="text-base font-bold text-white/90 mt-4 mb-2">
            {trimmed.replace('### ', '')}
          </h4>
        );
        return;
      }

      // Handle Bullet Points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        inList = true;
        const text = trimmed.substring(2);
        elements.push(
          <li key={idx} className="text-[#9E9B96] text-[14px] leading-relaxed ml-5 list-disc mb-1.5 pl-1">
            {parseInlineMarkdown(text)}
          </li>
        );
        return;
      }

      // Handle horizontal rule
      if (trimmed === '--------------' || trimmed === '---') {
        inList = false;
        elements.push(<hr key={idx} className="my-6 border-white/10" />);
        return;
      }

      // Handle Normal Paragraphs
      if (trimmed) {
        inList = false;
        elements.push(
          <p key={idx} className="text-[#9E9B96] text-[14px] leading-relaxed mb-3">
            {parseInlineMarkdown(line)}
          </p>
        );
      } else {
        if (inList) {
          inList = false; // exit list on double line break
        }
      }
    });

    return elements;
  };

  // Set default guidelines preview if template guidelines is completely empty or commented out
  const getRenderedGuidelines = () => {
    const parsed = parseMarkdown(guidelinesContent);
    // If parsed guidelines has only empty dividers or headers, render a high fidelity preview of guidelines instead of blank
    if (parsed.length <= 1) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif text-white mb-2">System Guidelines</h2>
          <p className="text-[#9E9B96] text-[14px] leading-relaxed">
            Here are the design engineering guidelines established for the <strong className="text-white">CultureConnect Showcase app</strong> to maintain visual excellence, responsiveness, and premium interaction:
          </p>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex gap-3">
              <ShieldCheck className="text-[#DDD6F3] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-[14px] font-bold text-white">General Layout Principles</h4>
                <p className="text-[12px] text-[#9E9B96] mt-1 leading-relaxed">
                  Only use absolute positioning when necessary. Opt for responsive layouts using Flexbox and CSS Grid. Refactor code continuously to preserve clean separation.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Award className="text-[#DDD6F3] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-[14px] font-bold text-white">Design & Typography Tokens</h4>
                <p className="text-[12px] text-[#9E9B96] mt-1 leading-relaxed">
                  Utilize DM Sans as primary typeface, and Libre Caslon Display for rich serif headings. Never exceed 4 active items in primary mobile toolbars.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Sparkles className="text-[#DDD6F3] shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-[14px] font-bold text-white">Liquid Glass Aesthetics</h4>
                <p className="text-[12px] text-[#9E9B96] mt-1 leading-relaxed">
                  Buttons and dialogs use standard luminosity overlays with precise 1.4px multi-stop border gradients for glass reflections. Sub-pixel spring haptics guide user actions.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return parsed;
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden font-sans flex items-center justify-center">
      
      {/* Immersive background with optimized styling */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/home/big-ben.png"
          alt="London City Background"
          fill
          priority
          className="object-cover opacity-90 scale-105 select-none pointer-events-none"
        />
        {/* Soft, rich dissolve overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/25 to-[#0C0B0A] pointer-events-none" />
      </div>

      {/* ─── DESKTOP VIEW SCREEN (screens 1024px and larger) ─── */}
      <div className="hidden lg:flex absolute inset-0 z-10 w-full h-full items-center justify-between px-16 py-12">
        {/* Top London Time Center Anchor */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-white/95 z-20">
          <span className="text-[10px] uppercase font-bold tracking-[2.5px] text-[#9E9B96] opacity-90">GMT +0</span>
          <span className="text-3xl font-light font-mono tracking-tight tabular-nums mt-1">{londonTime || "00:00:00"}</span>
        </div>

        {/* Left Side: Brand Showcase & Interactive Portal */}
        <div className="flex flex-col items-start justify-end h-full max-w-xl z-20 pb-4">
          {/* Collage Floating Card (Small Man) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-[152px] h-[246px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-8 group shrink-0"
          >
            <Image
              src="/home/small-man.png"
              alt="Collage Asset 1"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </motion.div>

          {/* Interactive Navigation Stack */}
          <div className="space-y-4 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnterApp}
              className="group flex items-center justify-between w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] px-8 py-5 text-left cursor-pointer pressable hover:border-white/20 shadow-xl transition-all"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#DDD6F3] tracking-widest uppercase mb-1">Enter Showcase</span>
                <span className="text-3xl font-serif text-white tracking-tight leading-none group-hover:text-[#DDD6F3] transition-colors">CULTURE CONNECT</span>
              </div>
              <div className="p-3.5 rounded-full bg-white/10 group-hover:bg-white/20 text-white transition-all shrink-0">
                <ArrowUpRight size={22} className="group-hover:rotate-45 transition-transform duration-300" />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenModal}
              className="group flex items-center justify-between w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] px-8 py-5 text-left cursor-pointer pressable hover:border-white/20 shadow-xl transition-all"
            >
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#9E9B96] tracking-widest uppercase mb-1">Project Details</span>
                <span className="text-3xl font-serif text-white/80 tracking-tight leading-none group-hover:text-white transition-colors">MEET THE GROUP</span>
              </div>
              <div className="p-3.5 rounded-full bg-white/5 group-hover:bg-white/15 text-[#9E9B96] group-hover:text-white transition-all shrink-0">
                <ArrowUpRight size={22} />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Right Side: Creative Rotated Typography & Secondary Floating Frame */}
        <div className="relative flex flex-col items-end justify-end h-full z-20 pb-4 pr-16 select-none">
          {/* Collage Item (105) floating layer */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="absolute right-0 bottom-64 w-[280px] h-[360px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
          >
            <Image
              src="/home/collage-105.png"
              alt="Collage Asset 2"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </motion.div>

          {/* Large vertical artist typography ribbon */}
          <div className="h-[500px] flex items-center justify-center overflow-visible select-none">
            <h1 className="text-white/10 text-[120px] font-serif font-black tracking-tighter whitespace-nowrap rotate-90 origin-center translate-y-32 translate-x-20">
              GROUP 19
            </h1>
          </div>
        </div>
      </div>


      {/* ─── PORTRAIT DEVICE PREVIEW & MOBILE FULL VIEW ─── */}
      {/* 
        On desktop (lg+), this renders inside a beautiful simulated iPhone 17 Pro Max container frame.
        On mobile/tablet (<lg), it covers 100% full screen perfectly!
      */}
      <div className="lg:hidden w-full h-screen absolute inset-0 z-15 flex flex-col justify-between p-6">
        
        {/* Mobile Header Clock & Status Bar */}
        <div className="w-full flex items-center justify-between pt-4 pb-2 z-20">
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-bold tracking-[1.5px] text-[#9E9B96]">GMT +0</span>
            <span className="text-xl font-bold font-mono tracking-tight tabular-nums text-white">{londonTime.substring(0, 5) || "00:00"}</span>
          </div>

          {/* Clean minimal cellular, wifi, and battery status items */}
          <div className="flex items-center gap-2 text-white/40 shrink-0">
            {/* Cellular */}
            <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 19 12">
              <path d="M1 10h2v2H1v-2zm4-2h2v4H5V8zm4-2h2v6H9V6zm4-2h2v8h-2V4zm4-3h2v11h-2V1z" opacity="0.8" />
            </svg>
            {/* Wifi */}
            <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 17 12">
              <path d="M8.5 2C5.5 2 2.7 3.2.7 5.2l1.4 1.4C3.8 5 6 4 8.5 4s4.7 1 6.4 2.6l1.4-1.4C14.3 3.2 11.5 2 8.5 2z M8.5 6c-1.8 0-3.4.7-4.6 1.9l1.4 1.4c.8-.8 2-1.3 3.2-1.3s2.4.5 3.2 1.3l1.4-1.4C11.9 6.7 10.3 6 8.5 6z M8.5 10c-.7 0-1.3.3-1.8.8l1.8 1.8 1.8-1.8c-.5-.5-1.1-.8-1.8-.8z" />
            </svg>
            {/* Battery */}
            <div className="w-6 h-3 rounded-sm border border-white/30 p-[1px] flex items-center">
              <div className="h-full w-4 bg-white/70 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Mobile Middle Layout: Small collage, rotated text */}
        <div className="flex-1 w-full flex items-center justify-between relative z-10 py-6">
          <div className="flex flex-col justify-end h-full">
            {/* Small Man Picture */}
            <div className="relative w-[76px] h-[123px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <Image
                src="/home/small-man.png"
                alt="Portrait collage"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Collage Item (105) */}
          <div className="absolute right-0 bottom-16 w-[120px] h-[180px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <Image
              src="/home/collage-105.png"
              alt="Collage 105 mobile"
              fill
              className="object-cover"
            />
          </div>

          {/* Group 19 Rotated Ribbon text */}
          <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 rotate-90 select-none">
            <h1 className="text-white/10 text-5xl font-serif font-black tracking-tight whitespace-nowrap">
              GROUP 19
            </h1>
          </div>
        </div>

        {/* Mobile Bottom: Action buttons using the custom liquid glass buttons styling */}
        <div className="space-y-3 w-full z-20 pb-8">
          <button
            onClick={handleEnterApp}
            className="w-full liquid-glass-strong-purple py-4 rounded-2xl text-white font-bold text-[14px] pressable shadow-lg flex items-center justify-between px-6"
          >
            <span className="font-serif text-lg tracking-tight uppercase">Culture Connect</span>
            <ArrowUpRight size={18} />
          </button>

          <button
            onClick={handleOpenModal}
            className="w-full liquid-glass py-4 rounded-2xl text-white/90 font-bold text-[14px] pressable shadow-md flex items-center justify-between px-6"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="font-serif text-lg tracking-tight uppercase text-white/80">Meet The Group</span>
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>

      {/* Simulated Device Portrait Preview Framework on Desktop (visible only on lg screens) */}
      <div className="hidden lg:flex absolute inset-0 w-full h-full items-center justify-center pointer-events-none z-15">
        <div className="w-full max-w-[402px] aspect-[402/874] rounded-[55px] border-[10px] border-white/5 bg-black/40 backdrop-blur-md shadow-2xl relative overflow-hidden pointer-events-auto flex flex-col justify-between p-6">
          {/* Background image for mobile preview */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/home/big-ben.png"
              alt="London City Background Mobile"
              fill
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/10 to-black/90 pointer-events-none" />
          </div>

          {/* Island Notch Shape */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-[22px] bg-black rounded-full z-30" />

          {/* Screen clock + status bar */}
          <div className="w-full flex items-center justify-between pt-3 pb-2 z-20">
            <div className="flex flex-col text-left">
              <span className="text-[7px] uppercase font-bold tracking-[1.5px] text-[#9E9B96]">GMT +0</span>
              <span className="text-sm font-bold font-mono tracking-tight tabular-nums text-white">{londonTime.substring(0, 5) || "00:00"}</span>
            </div>

            <div className="flex items-center gap-1.5 text-white/40 shrink-0 scale-90">
              <svg className="w-3.5 h-2.5" fill="currentColor" viewBox="0 0 19 12">
                <path d="M1 10h2v2H1v-2zm4-2h2v4H5V8zm4-2h2v6H9V6zm4-2h2v8h-2V4zm4-3h2v11h-2V1z" />
              </svg>
              <svg className="w-3.5 h-2.5" fill="currentColor" viewBox="0 0 17 12">
                <path d="M8.5 2C5.5 2 2.7 3.2.7 5.2l1.4 1.4C3.8 5 6 4 8.5 4s4.7 1 6.4 2.6l1.4-1.4C14.3 3.2 11.5 2 8.5 2z" />
              </svg>
              <div className="w-5 h-2.5 rounded-sm border border-white/20 p-[1px] flex items-center">
                <div className="h-full w-3 bg-white/60 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Portrait Preview Collage Layer */}
          <div className="flex-1 w-full flex items-center justify-between relative z-10 py-6">
            <div className="flex flex-col justify-end h-full">
              <div className="relative w-[70px] h-[110px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                <Image
                  src="/home/small-man.png"
                  alt="Portrait collage preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="absolute right-0 bottom-16 w-[100px] h-[150px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <Image
                src="/home/collage-105.png"
                alt="Collage 105 preview"
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute right-[-32px] top-1/2 -translate-y-1/2 rotate-90 select-none">
              <h1 className="text-white/5 text-4xl font-serif font-black tracking-tight whitespace-nowrap">
                GROUP 19
              </h1>
            </div>
          </div>

          {/* Action buttons inside simulation device */}
          <div className="space-y-2.5 w-full z-20 pb-4">
            <button
              onClick={handleEnterApp}
              className="w-full liquid-glass-strong-purple py-3 rounded-xl text-white font-bold text-[12px] pressable shadow-lg flex items-center justify-between px-5"
            >
              <span className="font-serif text-sm tracking-tight uppercase">Culture Connect</span>
              <ArrowUpRight size={14} />
            </button>

            <button
              onClick={handleOpenModal}
              className="w-full liquid-glass py-3 rounded-xl text-white/90 font-bold text-[12px] pressable shadow-md flex items-center justify-between px-5"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <span className="font-serif text-sm tracking-tight uppercase text-white/80">Meet The Group</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>


      {/* ─── "MEET THE GROUP" HIGH FIDELITY LIQUID-GLASS DRAWER MODAL ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 select-text">
            {/* Soft, blurred background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-40"
              aria-hidden="true"
            />

            {/* Modal Body Container with liquid glass styling */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-[#0C0B0A]/90 border border-white/10 rounded-[32px] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] advanced-filter-glass"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#6E5B98]/15 border border-[#6E5B98]/20">
                    <BookOpen size={18} className="text-[#DDD6F3]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-white font-semibold">Meet The Group</h3>
                    <p className="text-[11px] text-[#86847F] font-bold uppercase tracking-wider">Group 19 Documentation</p>
                  </div>
                </div>

                {/* Close Button with close haptic feedback */}
                <button
                  onClick={handleCloseModal}
                  className="p-2 bg-white/5 hover:bg-white/10 text-[#86847F] hover:text-white rounded-full transition-all pressable cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* High-fidelity Spring Action Tab Navigation */}
              <div className="px-6 py-3 bg-white/[0.01] border-b border-white/5 flex gap-2 flex-wrap">
                {(['readme', 'guidelines', 'attributions'] as const).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        haptic.trigger('selection');
                        setActiveTab(tab);
                      }}
                      className={`relative px-4 py-2 rounded-full text-[12px] font-bold tracking-tight transition-all pressable flex items-center gap-1.5 cursor-pointer capitalize z-10 ${
                        isActive ? 'text-black' : 'text-[#86847F] hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="modalActiveTabIndicator"
                          className="absolute inset-0 bg-white rounded-full shadow-lg z-[-1]"
                          transition={{ type: "spring", stiffness: 450, damping: 30 }}
                        />
                      )}
                      
                      {/* Icons for tabs */}
                      {tab === 'readme' && <FileText size={14} />}
                      {tab === 'guidelines' && <ShieldCheck size={14} />}
                      {tab === 'attributions' && <Award size={14} />}
                      
                      <span>{tab === 'readme' ? 'README' : tab}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Modal Markdown Content Area */}
              <div className="overflow-y-auto p-6 md:p-8 flex-1 space-y-4 text-left custom-scrollbar scroll-smooth scroll-area">
                {activeTab === 'readme' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {parseMarkdown(readmeContent)}
                  </div>
                )}
                
                {activeTab === 'guidelines' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {getRenderedGuidelines()}
                  </div>
                )}
                
                {activeTab === 'attributions' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {parseMarkdown(attributionsContent)}
                  </div>
                )}
              </div>

              {/* Dialog Footer Actions */}
              <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-[13px] font-bold hover:bg-white/10 transition-all pressable cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
