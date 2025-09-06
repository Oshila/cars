// src/context/PlanContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlanContextType {
  selectedPlan: string | null;
  setSelectedPlan: (plan: string | null) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <PlanContext.Provider value={{ selectedPlan, setSelectedPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}