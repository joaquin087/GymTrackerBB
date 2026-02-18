
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { PrefabExercise } from '../types';
import { useSettings } from './useSettings';
import { getSheetData, updateExercises as apiUpdateExercises } from '../services/googleSheetsService';

interface ExercisesContextType {
  exercises: PrefabExercise[];
  addExercise: (exercise: Omit<PrefabExercise, 'id'>) => Promise<void>;
  updateExercise: (id: string, updatedExercise: Omit<PrefabExercise, 'id'>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ExercisesContext = createContext<ExercisesContextType | undefined>(undefined);

const transformSheetDataToExercises = (data: string[][]): PrefabExercise[] => {
    if (!data || data.length < 2) return [];
    // New structure: id, name, primaryMuscle, secondaryMuscles, equipment, form
    return data.slice(1).map(row => ({
        id: row[0],
        name: row[1],
        primaryMuscle: row[2] || '',
        secondaryMuscles: row[3] || '',
        equipment: row[4] || '',
        form: row[5] || '',
    })).filter(ex => ex.id && ex.name);
}

export const ExercisesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [exercises, setExercises] = useState<PrefabExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async () => {
    if (!settings.apiKey || !settings.sheetId) {
        setLoading(false);
        return;
    };
    setLoading(true);
    setError(null);
    try {
        const data = await getSheetData(settings.apiKey, settings.sheetId, 'Exercises');
        const transformed = transformSheetDataToExercises(data);
        setExercises(transformed);
    } catch (err: any) {
        setError("Error al cargar los ejercicios desde Google Sheets.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  }, [settings]);
  
  useEffect(() => {
      fetchExercises();
  }, [fetchExercises]);
  
  const updateRemoteExercises = async (updatedExercises: PrefabExercise[]) => {
      setLoading(true);
      try {
          await apiUpdateExercises(settings.scriptUrl!, updatedExercises);
          setExercises(updatedExercises); // Optimistic update
      } catch (err) {
          setError("No se pudo actualizar la lista de ejercicios.");
          console.error(err);
          await fetchExercises(); // Revert on failure
          throw err;
      } finally {
          setLoading(false);
      }
  };

  const addExercise = async (exerciseData: Omit<PrefabExercise, 'id'>) => {
    const newExercise: PrefabExercise = {
      ...exerciseData,
      id: new Date().toISOString() + Math.random().toString(36).substring(2, 9),
    };
    const updatedExercises = [...exercises, newExercise];
    await updateRemoteExercises(updatedExercises);
  };

  const updateExercise = async (id: string, updatedData: Omit<PrefabExercise, 'id'>) => {
    const updatedExercises = exercises.map(ex => ex.id === id ? { id, ...updatedData } : ex);
    await updateRemoteExercises(updatedExercises);
  };

  const deleteExercise = async (id: string) => {
    const updatedExercises = exercises.filter(e => e.id !== id);
    await updateRemoteExercises(updatedExercises);
  };

  return React.createElement(ExercisesContext.Provider, {
    value: { exercises, addExercise, updateExercise, deleteExercise, loading, error }
  }, children);
};

export const useExercises = (): ExercisesContextType => {
  const context = useContext(ExercisesContext);
  if (context === undefined) {
    throw new Error('useExercises must be used within an ExercisesProvider');
  }
  return context;
};
