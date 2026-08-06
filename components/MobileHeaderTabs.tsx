"use client";

import type { RefObject } from 'react';
import { useMemo } from 'react';
import { useFilter } from '@/context/FilterContext';
import { useWebHaptics } from 'web-haptics/react';
import { getProducts } from '@/lib/data';

export default function MobileHeaderTabs({ tabsRef, dimmed }: { tabsRef?: RefObject<HTMLDivElement | null>; dimmed?: boolean }) {
  const { typeFilter, setTypeFilter } = useFilter();
  const haptic = useWebHaptics();
  const products = getProducts();

  const counts = useMemo(() => ({
    all: products.length,
    product: products.filter((product) => product.type === 'product').length,
    service: products.filter((product) => product.type === 'service').length,
  }), [products]);

  const tabs = [
    { label: 'All', value: 'all', count: counts.all },
    { label: 'Products', value: 'product', count: counts.product },
    { label: 'Services', value: 'service', count: counts.service },
  ];

  return (
    <div ref={tabsRef} className={`mobile-header-tabs aps-bar ${dimmed ? 'mobile-header-tabs--dimmed' : ''}`}>
      {tabs.map((tab, index) => {
        const isActive = typeFilter === tab.value;
        const align = index === 0 ? 'justify-start' : index === tabs.length - 1 ? 'justify-end' : 'justify-center';
        return (
          <button
            key={tab.value}
            onClick={() => { setTypeFilter(tab.value); haptic.trigger('selection'); }}
            className={`mobile-tab-button text-[24px] transition-all pressable flex ${align} items-start focus:outline-none border-none bg-transparent leading-none ${
              isActive
                ? 'text-white font-black'
                : 'text-[#9E9B96] font-semibold'
            }`}
            data-cuelume-toggle
          >
            <span>{tab.label}</span>
            <span className="mobile-tab-count">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}
