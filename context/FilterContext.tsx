"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAreas: (number | '')[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<(number | '')[]>>;
  priceMin: number;
  setPriceMin: (val: number) => void;
  priceMax: number;
  setPriceMax: (val: number) => void;
  clearAllFilters: () => void;
  isAdvancedFilterActive: boolean;

  // Global committed filter states
  appliedCategories: string[];
  appliedAreas: (number | '')[];
  appliedPriceMin: number;
  appliedPriceMax: number;
  applyFilters: () => void;
  setAppliedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setAppliedAreas: React.Dispatch<React.SetStateAction<(number | '')[]>>;
  setAppliedPriceMin: (val: number) => void;
  setAppliedPriceMax: (val: number) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<(number | '')[]>([]);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(2000);

  // Global committed states
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedAreas, setAppliedAreas] = useState<(number | '')[]>([]);
  const [appliedPriceMin, setAppliedPriceMin] = useState(0);
  const [appliedPriceMax, setAppliedPriceMax] = useState(2000);

  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  const applyFilters = () => {
    setAppliedCategories(selectedCategories);
    setAppliedAreas(selectedAreas);
    setAppliedPriceMin(priceMin);
    setAppliedPriceMax(priceMax);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSelectedCategories([]);
    setSelectedAreas([]);
    setPriceMin(0);
    setPriceMax(2000);
    setAppliedCategories([]);
    setAppliedAreas([]);
    setAppliedPriceMin(0);
    setAppliedPriceMax(2000);
  };

  const isAdvancedFilterActive = 
    appliedCategories.length > 0 || 
    (appliedAreas.length > 0 && !appliedAreas.includes('')) || 
    appliedPriceMin !== 0 || 
    appliedPriceMax !== 2000;

  return (
    <FilterContext.Provider value={{
      isDrawerOpen, toggleDrawer,
      typeFilter, setTypeFilter,
      searchQuery, setSearchQuery,
      selectedCategories, setSelectedCategories,
      selectedAreas, setSelectedAreas,
      priceMin, setPriceMin,
      priceMax, setPriceMax,
      clearAllFilters,
      isAdvancedFilterActive,
      appliedCategories,
      appliedAreas,
      appliedPriceMin,
      appliedPriceMax,
      applyFilters,
      setAppliedCategories,
      setAppliedAreas,
      setAppliedPriceMin,
      setAppliedPriceMax,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
