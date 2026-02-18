
import React, { useState } from 'react';
import type { Workout, Exercise, WorkoutSet } from '../types';
import { useWorkouts } from '../hooks/useWorkouts';
import { PlusIcon, TrashIcon } from './Icons';

interface LogWorkoutFormProps {
    onWorkoutAdded: () => void;
}

const LogWorkoutForm: React.FC<LogWorkoutFormProps> = ({ onWorkoutAdded }) => {
    const { addWorkout } = useWorkouts();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [title, setTitle] = useState('');
    const [muscleGroups, setMuscleGroups] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: [{ weight: 0, reps: 0 }] }]);
    const [error, setError] = useState('');

    const handleExerciseChange = (exIndex: number, field: 'name', value: string) => {
        const newExercises = [...exercises];
        newExercises[exIndex][field] = value;
        setExercises(newExercises);
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
        const newExercises = [...exercises];
        const numValue = parseFloat(value);
        newExercises[exIndex].sets[setIndex][field] = isNaN(numValue) ? 0 : numValue;
        setExercises(newExercises);
    };

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: [{ weight: 0, reps: 0 }] }]);
    };

    const removeExercise = (exIndex: number) => {
        setExercises(exercises.filter((_, index) => index !== exIndex));
    };

    const addSet = (exIndex: number) => {
        const newExercises = [...exercises];
        newExercises[exIndex].sets.push({ weight: 0, reps: 0 });
        setExercises(newExercises);
    };

    const removeSet = (exIndex: number, setIndex: number) => {
        const newExercises = [...exercises];
        newExercises[exIndex].sets = newExercises[exIndex].sets.filter((_, index) => index !== setIndex);
        setExercises(newExercises);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) {
            setError('Por favor, completa la fecha y el título.');
            return;
        }
        if (exercises.some(ex => !ex.name || ex.sets.length === 0)) {
            setError('Todos los ejercicios deben tener un nombre y al menos una serie.');
            return;
        }
        setError('');
        
        const workoutData: Omit<Workout, 'id'> = {
            date,
            title,
            muscleGroups: muscleGroups.split(',').map(s => s.trim()).filter(Boolean),
            exercises: exercises.filter(ex => ex.name.trim() !== '') // Filter out empty exercises
        };
        addWorkout(workoutData);
        onWorkoutAdded();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-emerald-400">Registrar Entrenamiento Manualmente</h2>
            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label htmlFor="date" className="mb-2 font-semibold text-gray-300">Fecha</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="title" className="mb-2 font-semibold text-gray-300">Título (Ej: Push, Pull, Legs)</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Push Day" className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
            </div>
            <div className="flex flex-col">
                <label htmlFor="muscleGroups" className="mb-2 font-semibold text-gray-300">Grupos Musculares (separados por coma)</label>
                <input type="text" id="muscleGroups" value={muscleGroups} onChange={e => setMuscleGroups(e.target.value)} placeholder="Pecho, Hombros, Tríceps" className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>

            {exercises.map((exercise, exIndex) => (
                <div key={exIndex} className="p-4 bg-gray-700/50 rounded-lg space-y-4">
                    <div className="flex justify-between items-center">
                        <input type="text" value={exercise.name} onChange={e => handleExerciseChange(exIndex, 'name', e.target.value)} placeholder={`Ejercicio #${exIndex + 1}`} className="bg-gray-600 border border-gray-500 rounded-md p-2 w-full focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold" />
                        <button type="button" onClick={() => removeExercise(exIndex)} className="ml-4 text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-gray-600">
                            <TrashIcon />
                        </button>
                    </div>
                    {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-2">
                            <span className="font-mono text-gray-400 w-10">Set {setIndex + 1}</span>
                            <input type="number" value={set.weight} onChange={e => handleSetChange(exIndex, setIndex, 'weight', e.target.value)} placeholder="Peso (kg)" className="bg-gray-600 border border-gray-500 rounded-md p-2 w-full" />
                            <span className="font-bold">x</span>
                            <input type="number" value={set.reps} onChange={e => handleSetChange(exIndex, setIndex, 'reps', e.target.value)} placeholder="Reps" className="bg-gray-600 border border-gray-500 rounded-md p-2 w-full" />
                            <button type="button" onClick={() => removeSet(exIndex, setIndex)} className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-600">
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                     <button type="button" onClick={() => addSet(exIndex)} className="w-full mt-2 flex items-center justify-center gap-2 text-emerald-400 hover:text-emerald-300 bg-emerald-900/50 hover:bg-emerald-800/50 rounded-md py-2 transition-colors">
                        <PlusIcon /> Añadir Serie
                    </button>
                </div>
            ))}
            <button type="button" onClick={addExercise} className="w-full flex items-center justify-center gap-2 text-white font-semibold bg-gray-600 hover:bg-gray-500 rounded-md py-2 transition-colors">
                 <PlusIcon /> Añadir Ejercicio
            </button>
            <button type="submit" className="w-full text-white font-bold bg-emerald-600 hover:bg-emerald-500 rounded-md py-3 transition-colors text-lg">
                Guardar Entrenamiento
            </button>
        </form>
    );
};

export default LogWorkoutForm;
