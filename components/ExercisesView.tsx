
import React, { useState, useEffect } from 'react';
import { useExercises } from '../hooks/useExercises';
import { PlusIcon, TrashIcon, EditIcon } from './Icons';
import type { PrefabExercise } from '../types';

const ExercisesView: React.FC = () => {
    const { exercises, addExercise, updateExercise, deleteExercise, loading } = useExercises();
    
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingExercise, setEditingExercise] = useState<PrefabExercise | null>(null);

    const [name, setName] = useState('');
    const [primaryMuscle, setPrimaryMuscle] = useState('');
    const [secondaryMuscles, setSecondaryMuscles] = useState('');
    const [equipment, setEquipment] = useState('');
    const [form, setForm] = useState('');
    
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (editingExercise) {
            setName(editingExercise.name);
            setPrimaryMuscle(editingExercise.primaryMuscle);
            setSecondaryMuscles(editingExercise.secondaryMuscles);
            setEquipment(editingExercise.equipment);
            setForm(editingExercise.form);
            setIsFormVisible(true);
        }
    }, [editingExercise]);

    const resetForm = () => {
        setName('');
        setPrimaryMuscle('');
        setSecondaryMuscles('');
        setEquipment('');
        setForm('');
        setError('');
        setEditingExercise(null);
        setIsFormVisible(false);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !primaryMuscle || !equipment || !form) {
            setError('Nombre, Músculo Primario, Equipamiento y Forma son obligatorios.');
            return;
        }

        const exerciseData = { name, primaryMuscle, secondaryMuscles, equipment, form };

        if (editingExercise) {
            updateExercise(editingExercise.id, exerciseData);
        } else {
            addExercise(exerciseData);
        }
        resetForm();
    };

    const handleEdit = (exercise: PrefabExercise) => {
        setEditingExercise(exercise);
        window.scrollTo(0, 0);
    };

    const handleAddNew = () => {
        resetForm();
        setIsFormVisible(true);
    };

    const ExerciseCard: React.FC<{ exercise: PrefabExercise }> = ({ exercise }) => (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col justify-between">
            <div>
                <h4 className="font-bold text-lg text-white">{exercise.name}</h4>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="bg-emerald-900 text-emerald-300 px-2 py-1 rounded-full">
                        <strong>Primario:</strong> {exercise.primaryMuscle}
                    </span>
                    {exercise.secondaryMuscles && (
                        <span className="bg-sky-900 text-sky-300 px-2 py-1 rounded-full">
                            <strong>Secundario:</strong> {exercise.secondaryMuscles}
                        </span>
                    )}
                     <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{exercise.equipment}</span>
                     <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{exercise.form}</span>
                </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => handleEdit(exercise)} className="text-gray-400 hover:text-emerald-400 p-2 rounded-full hover:bg-gray-700" aria-label="Editar">
                    <EditIcon />
                </button>
                <button onClick={() => deleteExercise(exercise.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-700" aria-label="Eliminar">
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-tight">Biblioteca de Ejercicios</h2>
                {!isFormVisible && (
                     <button onClick={handleAddNew} className="text-white font-bold bg-emerald-600 hover:bg-emerald-500 rounded-md py-2 px-4 transition-colors flex items-center justify-center gap-2">
                        <PlusIcon /> Añadir Nuevo
                    </button>
                )}
            </div>
            
            {isFormVisible && (
                <form onSubmit={handleSubmit} className="p-6 bg-gray-800 rounded-lg shadow-lg space-y-4">
                    <h3 className="text-xl font-bold text-emerald-400">{editingExercise ? 'Editar Ejercicio' : 'Añadir Nuevo Ejercicio'}</h3>
                    {error && <p className="text-red-400 bg-red-900/50 p-2 rounded">{error}</p>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Ejercicio</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Press de Banca con Barra" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Músculo Primario</label>
                            <input type="text" value={primaryMuscle} onChange={e => setPrimaryMuscle(e.target.value)} placeholder="Ej: Pecho (Medio)" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Músculos Secundarios (coma)</label>
                            <input type="text" value={secondaryMuscles} onChange={e => setSecondaryMuscles(e.target.value)} placeholder="Ej: Hombros, Tríceps" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Equipamiento</label>
                            <input type="text" value={equipment} onChange={e => setEquipment(e.target.value)} placeholder="Ej: Barra" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Forma / Postura</label>
                            <input type="text" value={form} onChange={e => setForm(e.target.value)} placeholder="Ej: Banco Plano" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500" />
                        </div>
                    </div>
                    
                    <div className="flex gap-4 pt-2">
                        <button type="submit" className="flex-1 text-white font-bold bg-emerald-600 hover:bg-emerald-500 rounded-md py-2 transition-colors flex items-center justify-center gap-2">
                            {editingExercise ? 'Guardar Cambios' : 'Añadir Ejercicio'}
                        </button>
                        <button type="button" onClick={resetForm} className="flex-1 text-white font-bold bg-gray-600 hover:bg-gray-500 rounded-md py-2 transition-colors">
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <p className="text-center text-gray-400 md:col-span-2">Cargando...</p>
                ) : exercises.length > 0 ? (
                    exercises.sort((a,b) => a.name.localeCompare(b.name)).map(ex => (
                        <ExerciseCard key={ex.id} exercise={ex} />
                    ))
                ) : (
                    <p className="p-4 text-center text-gray-400 md:col-span-2">No has añadido ningún ejercicio todavía.</p>
                )}
            </div>
        </div>
    );
};

export default ExercisesView;
