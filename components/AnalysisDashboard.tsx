
import React, { useMemo } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useAppNavigation } from '../hooks/useAppNavigation';

const AnalysisDashboard: React.FC = () => {
    const { workouts, loading } = useWorkouts();
    const { navigateToDetail } = useAppNavigation();

    const uniqueExercisesWithStats = useMemo(() => {
        const exerciseMap = new Map<string, { count: number; lastDate: string }>();

        // Iterate backwards to find the last date efficiently
        for (let i = workouts.length - 1; i >= 0; i--) {
            const workout = workouts[i];
            workout.exercises.forEach(exercise => {
                if (!exerciseMap.has(exercise.name)) {
                    exerciseMap.set(exercise.name, { count: 0, lastDate: workout.date });
                }
            });
        }
        
        // Iterate forwards to get the total count
        workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if(exerciseMap.has(exercise.name)){
                   const current = exerciseMap.get(exercise.name)!;
                   current.count++;
                   exerciseMap.set(exercise.name, current);
                }
            });
        });

        const sortedExercises = Array.from(exerciseMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        return sortedExercises;

    }, [workouts]);

    if (loading) return <p className="text-center">Cargando datos de análisis...</p>;
    if (workouts.length === 0) return (
        <div className="text-center p-8 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-2">Página de Análisis</h2>
            <p className="text-gray-400">Aún no hay datos para analizar. ¡Registra un entrenamiento para empezar!</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">Análisis por Ejercicio</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg">
                <ul className="divide-y divide-gray-700">
                    {uniqueExercisesWithStats.map(([name, stats]) => (
                        <li key={name}>
                            <button 
                                onClick={() => navigateToDetail(name)} 
                                className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors"
                            >
                                <div>
                                    <p className="font-semibold text-white">{name}</p>
                                    <p className="text-sm text-gray-400">
                                        Registrado {stats.count} {stats.count === 1 ? 'vez' : 'veces'}. 
                                        Última vez: {new Date(stats.lastDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                                <span className="text-emerald-400 font-bold">&rarr;</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
