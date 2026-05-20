"use client";

import { useMemo } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterHorizontalIcon } from '@hugeicons/core-free-icons';
import { useFilter } from '@/context/FilterContext';
import { useWebHaptics } from 'web-haptics/react';
import { getProducts } from '@/lib/data';

export default function MobileHeaderTabs() {
  const { typeFilter, setTypeFilter, toggleDrawer, isDrawerOpen } = useFilter();
  const haptic = useWebHaptics();
  const allProducts = getProducts();

  const counts = useMemo(() => ({
    all: allProducts.length,
    product: allProducts.filter(p => p.type === 'product').length,
    service: allProducts.filter(p => p.type === 'service').length,
  }), [allProducts]);

  const tabs = [
    { label: 'All', value: 'all', count: counts.all },
    { label: 'Products', value: 'product', count: counts.product },
    { label: 'Services', value: 'service', count: counts.service },
  ];

  return (
    <div className="mobile-header-tabs flex items-center gap-4 px-[16px] md:hidden">
      {/* Filter Icon moved outside tabs for accessibility */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleDrawer(); haptic.trigger('selection'); }}
        className={`shrink-0 transition-colors ${isDrawerOpen ? 'text-[#6E5B98]' : 'text-[#86847F]'}`}
        aria-label="Toggle filters"
      >
        <HugeiconsIcon icon={FilterHorizontalIcon} size={18} />
      </button>

      <div className="flex-1 flex items-center justify-between">
        {tabs.map((tab) => (
          <div
            key={tab.value}
            onClick={() => { setTypeFilter(tab.value); haptic.trigger('selection'); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setTypeFilter(tab.value);
                haptic.trigger('selection');
              }
            }}
            role="button"
            tabIndex={0}
            className={`mobile-tab relative ${typeFilter === tab.value ? 'mobile-tab-active' : ''}`}
          >
            <span className={`text-[13px] ${typeFilter === tab.value ? 'font-semibold' : 'font-normal'}`}>{tab.label}</span>
            <span className="mobile-tab-count">{tab.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
