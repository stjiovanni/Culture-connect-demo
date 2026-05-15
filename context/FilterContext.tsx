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

  const toggleDrawer = () => setIsDrawerOpen(prev => !prev);

  const clearAllFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSelectedCategories([]);
    setSelectedAreas([]);
    setPriceMin(0);
    setPriceMax(2000);
  };

  const isAdvancedFilterActive = 
    selectedCategories.length > 0 || 
    (selectedAreas.length > 0 && !selectedAreas.includes('')) || 
    priceMin !== 0 || 
    priceMax !== 2000;

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
