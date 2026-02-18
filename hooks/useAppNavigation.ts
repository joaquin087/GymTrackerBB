
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export type View = 'dashboard' | 'log' | 'ai-log' | 'analysis-dashboard' | 'analysis-detail' | 'exercises';

interface NavigationContextType {
  currentView: View;
  selectedExercise: string | null;
  navigate: (view: View) => void;
  navigateToDetail: (exerciseName: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const navigate = useCallback((view: View) => {
    setCurrentView(view);
    setSelectedExercise(null); // Reset exercise selection on general navigation
  }, []);

  const navigateToDetail = useCallback((exerciseName: string) => {
    setSelectedExercise(exerciseName);
    setCurrentView('analysis-detail');
  }, []);

  return React.createElement(NavigationContext.Provider, {
    value: { currentView, selectedExercise, navigate, navigateToDetail }
  }, children);
};

export const useAppNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useAppNavigation must be used within a NavigationProvider');
  }
  return context;
};
