
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { Workout, Exercise } from '../types';
import { useSettings } from './useSettings';
import { getSheetData, saveWorkout as apiSaveWorkout, deleteWorkout as apiDeleteWorkout } from '../services/googleSheetsService';

interface WorkoutsContextType {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

const transformSheetDataToWorkouts = (data: string[][]): Workout[] => {
    if (!data || data.length < 2) return [];

    const workoutsMap = new Map<string, Workout>();
    
    // Start from 1 to skip header row
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const [
            workoutId, date, title, muscleGroupsStr, notes,
            exerciseName, weight, reps
        ] = row;

        if (!workoutId) continue;

        let workout = workoutsMap.get(workoutId);
        if (!workout) {
            workout = {
                id: workoutId,
                date,
                title,
                muscleGroups: muscleGroupsStr ? muscleGroupsStr.split(',').map(s => s.trim()) : [],
                notes: notes || '',
                exercises: []
            };
            workoutsMap.set(workoutId, workout);
        }

        let exercise = workout.exercises.find(e => e.name === exerciseName);
        if (!exercise) {
            exercise = { name: exerciseName, sets: [] };
            workout.exercises.push(exercise);
        }

        exercise.sets.push({ weight: parseFloat(weight) || 0, reps: parseInt(reps, 10) || 0 });
    }
    
    const allWorkouts = Array.from(workoutsMap.values());
    allWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return allWorkouts;
}

export const WorkoutsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { settings } = useSettings();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    if (!settings.apiKey || !settings.sheetId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getSheetData(settings.apiKey, settings.sheetId, 'Workouts');
      const transformedWorkouts = transformSheetDataToWorkouts(data);
      setWorkouts(transformedWorkouts);
    } catch (err: any) {
      setError("Error al cargar los entrenamientos desde Google Sheets. Revisa la configuración.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const addWorkout = async (workoutData: Omit<Workout, 'id'>) => {
    const newWorkout: Workout = {
      ...workoutData,
      id: new Date().toISOString() + Math.random().toString(36).substring(2, 9),
    };
    
    setLoading(true);
    try {
      await apiSaveWorkout(settings.scriptUrl!, newWorkout);
      await fetchWorkouts(); // Refetch to get the latest state
    } catch (err: any) {
      setError("No se pudo guardar el entrenamiento.");
      console.error(err);
      throw err;
    } finally {
        setLoading(false);
    }
  };

  const deleteWorkout = async (id: string) => {
    setLoading(true);
    try {
        await apiDeleteWorkout(settings.scriptUrl!, id);
        await fetchWorkouts(); // Refetch to get the latest state
    } catch (err: any)        {
        setError("No se pudo eliminar el entrenamiento.");
        console.error(err);
        throw err;
    } finally {
        setLoading(false);
    }
  };

  return React.createElement(WorkoutsContext.Provider, {
    value: { workouts, addWorkout, deleteWorkout, loading, error }
  }, children);
};

export const useWorkouts = (): WorkoutsContextType => {
  const context = useContext(WorkoutsContext);
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutsProvider');
  }
  return context;
};
