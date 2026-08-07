'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useWebHaptics } from 'web-haptics/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

const navBtnClass =
  "btn-text font-bold text-white inline-flex items-center gap-2 hover:opacity-70 transition-opacity";

const teamMembers = [
  { name: 'TOLU A. OPALEYE', role: 'DEVELOPER/DESIGNER', url: 'https://toluopaleye.xyz' },
  { name: 'TOMIWA M. OSUNSAKIN', role: 'PRODUCT OWNER', url: 'https://www.linkedin.com/in/tomiwa-osunsakin' },
  { name: 'ISHAKU LANNA', role: 'SCRUM MASTER', url: '' },
  { name: 'CHIGOZILI D. OJUKWU', role: 'PROJECT MANAGER', url: '' },
  { name: 'PRUDTHVI VIJAY SIMHA', role: 'SOFTWARE TESTER', url: '' },
];

const revealFrom = { opacity: 0, y: 17, filter: 'blur(6px)' };
const revealTo = { opacity: 1, y: 0, filter: 'blur(0px)' };
const revealEasing = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function AboutOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const haptic = useWebHaptics();
  const aboutRef = useRef<HTMLSpanElement>(null);

  const handleCultureConnect = () => {
    haptic.trigger('success');

    try {
      const saved = sessionStorage.getItem('user_profile');
      if (!saved) {
        sessionStorage.setItem(
          'user_profile',
          JSON.stringify({
            firstName: 'Giorno',
            lastName: 'Giovanna',
            username: 'GioGio',
            locationId: 1,
            avatar: '/uploads/avatar_7_1776873674.jpeg',
            banner: '/uploads/header_7_1776873674.jpeg',
          })
        );
        window.dispatchEvent(new Event('profile-updated'));
      }
    } catch (err) {
      console.error('Error logging in:', err);
    }

    setPendingNav('/discover');
    setIsOpen(false);
  };

  useEffect(() => {
    if (pathname !== '/landing') return;

    const findTrigger = () => {
      const links = document.querySelectorAll<HTMLElement>('.landing-link');
      for (const el of links) {
        if (el.textContent?.trim() === 'ABOUT') {
          return el;
        }
      }
      return null;
    };

    const trigger = findTrigger();
    if (!trigger) return;

    trigger.style.opacity = '1';
    trigger.style.cursor = 'pointer';
    trigger.style.transition = 'opacity 0.2s ease';

    const onEnter = () => { trigger.style.opacity = '0.7'; };
    const onLeave = () => { trigger.style.opacity = '1'; };
    const onClick = (e: Event) => {
      e.preventDefault();
      setIsOpen(true);
    };

    trigger.addEventListener('mouseenter', onEnter);
    trigger.addEventListener('mouseleave', onLeave);
    trigger.addEventListener('click', onClick);
    return () => {
      trigger.removeEventListener('mouseenter', onEnter);
      trigger.removeEventListener('mouseleave', onLeave);
      trigger.removeEventListener('click', onClick);
    };
  }, [pathname]);

  useEffect(() => {
    if (aboutRef.current) {
      aboutRef.current.style.setProperty('color', '#0C0B0A', 'important');
    }
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <AnimatePresence onExitComplete={() => { if (pendingNav) { router.push(pendingNav); setPendingNav(null); } }}>
      {isOpen && (
        <div
          id="about-dialog"
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-dialog-title"
        >
          {/* Black content panel */}
          <motion.div
            className="absolute inset-x-0 top-0 bottom-[80px] bg-[#0C0B0A]"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={transition}
          >
            <div className="flex flex-col h-full p-8 md:p-12 pt-12 md:pt-14">
              {/* Navigation row: BACK | CULTURE CONNECT ↗ */}
              <div className="flex justify-between items-center">
                <button type="button" onClick={close} className={navBtnClass}>
                  BACK
                </button>
                <button
                  onClick={handleCultureConnect}
                  className={navBtnClass}
                >
                  CULTURE CONNECT <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} strokeWidth={3} />
                </button>
              </div>

              {/* Spacer: nav → first heading */}
              <div className="h-6 md:h-8 lg:h-12" />

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto scroll-area">
                {/* Section 1: ABOUT CULTURE CONNECT */}
                <h2 id="about-dialog-title" className="heading uppercase text-white">ABOUT CULTURE CONNECT</h2>
                <div className="overflow-hidden">
                  <motion.p
                    className="body-text text-[#9E9B96] font-normal"
                    initial={revealFrom}
                    animate={revealTo}
                    transition={{ duration: 0.55, ease: revealEasing }}
                  >
                    Culture Connect links residents, councils, and local creatives to discover, vote on, and shape community cultural offerings.
                  </motion.p>
                </div>

                {/* Section 2: TEAM */}
                <div className="mt-6 lg:mt-8">
                  <h2 className="heading uppercase text-white">TEAM</h2>
                  <motion.div
                    className="flex flex-col gap-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: { staggerChildren: 0.065 },
                      },
                    }}
                  >
                    {teamMembers.map((member) => (
                      <div key={member.name} className="overflow-hidden">
                        <motion.div
                          className="team-name text-white flex justify-between items-center"
                          variants={{
                            hidden: revealFrom,
                            visible: {
                              ...revealTo,
                              transition: { duration: 0.55, ease: revealEasing },
                            },
                          }}
                        >
                          {member.url ? (
                            <a
                              href={member.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex justify-between items-center w-full"
                            >
                              <span>{member.name} — {member.role}</span>
                              <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} strokeWidth={3} className="shrink-0" />
                            </a>
                          ) : (
                            <span>{member.name} — {member.role}</span>
                          )}
                        </motion.div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* White footer strip */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-[80px] bg-white flex items-center px-8"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={transition}
          >
            <span ref={aboutRef} className="landing-link about-label">ABOUT</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
