"use client";

import type { RefObject } from 'react';
import { useFilter } from '@/context/FilterContext';
import { useWebHaptics } from 'web-haptics/react';

export default function MobileHeaderTabs({ tabsRef, dimmed }: { tabsRef?: RefObject<HTMLDivElement | null>; dimmed?: boolean }) {
  const { typeFilter, setTypeFilter } = useFilter();
  const haptic = useWebHaptics();

  const tabs = [
    { label: 'All', value: 'all' },
    { label: 'Products', value: 'product' },
    { label: 'Services', value: 'service' },
  ];

  return (
    <div ref={tabsRef} className={`mobile-header-tabs flex items-center justify-between ${dimmed ? 'mobile-header-tabs--dimmed' : ''}`}>
      {tabs.map((tab) => {
        const isActive = typeFilter === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => { setTypeFilter(tab.value); haptic.trigger('selection'); }}
            className={`text-[24px] transition-all pressable flex-1 flex justify-center items-start focus:outline-none border-none bg-transparent leading-none ${
              isActive
                ? 'text-white font-black'
                : 'text-[#9E9B96] font-semibold'
            }`}
            data-cuelume-toggle
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}