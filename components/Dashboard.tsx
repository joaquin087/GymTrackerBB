
import React from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { TrashIcon } from './Icons';
import type { Workout } from '../types';
import { useAppNavigation } from '../hooks/useAppNavigation';

const WorkoutCard: React.FC<{ workout: Workout; onDelete: (id: string) => void }> = ({ workout, onDelete }) => {
  const { navigateToDetail } = useAppNavigation();

  const totalVolume = workout.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exTotal, set) => exTotal + set.weight * set.reps, 0);
  }, 0);

  const totalSets = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const correctedDate = new Date(date.getTime() + (offset*60*1000));
    return correctedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };


  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform transform hover:-translate-y-1">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-emerald-400 font-semibold">{formatDate(workout.date)}</p>
            <h3 className="text-xl font-bold text-white mt-1">{workout.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {workout.muscleGroups.map(group => (
                <span key={group} className="text-xs font-medium bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{group}</span>
              ))}
            </div>
          </div>
          <button onClick={() => onDelete(workout.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-700" aria-label="Eliminar entrenamiento">
            <TrashIcon />
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {workout.exercises.map((ex, index) => (
              <li key={index} className="text-sm text-gray-300 flex justify-between">
                <button onClick={() => navigateToDetail(ex.name)} className="text-left hover:text-emerald-400 transition-colors">
                  {ex.name}
                </button>
                <span className="font-mono text-gray-400">{ex.sets.length} sets</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-around bg-gray-700/50 rounded-lg p-2 text-center">
            <div>
                <p className="text-xs text-gray-400">Ejercicios</p>
                <p className="font-bold text-lg">{workout.exercises.length}</p>
            </div>
            <div>
                <p className="text-xs text-gray-400">Sets</p>
                <p className="font-bold text-lg">{totalSets}</p>
            </div>
            <div>
                <p className="text-xs text-gray-400">Volumen</p>
                <p className="font-bold text-lg">{totalVolume.toLocaleString('es-ES')} kg</p>
            </div>
        </div>
      </div>
    </div>
  );
};


const Dashboard: React.FC = () => {
  const { workouts, loading, deleteWorkout } = useWorkouts();

  if (loading) {
    return <div className="text-center text-gray-400">Cargando entrenamientos...</div>;
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido a Gym Tracker AI!</h2>
        <p className="text-gray-400">Parece que aún no has registrado ningún entrenamiento.</p>
        <p className="text-gray-400 mt-1">Usa la barra de navegación de abajo para empezar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <h2 className="text-3xl font-bold text-white tracking-tight">Historial de Entrenamientos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workouts.map(workout => (
          <WorkoutCard key={workout.id} workout={workout} onDelete={deleteWorkout} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
