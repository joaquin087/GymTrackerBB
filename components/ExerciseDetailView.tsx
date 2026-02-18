
import React, { useMemo } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppNavigation } from '../hooks/useAppNavigation';

interface ExerciseDetailViewProps {
    exerciseName: string;
}

type ChartData = {
    date: string;
    maxWeight: number;
    totalVolume: number;
    estimated1RM: number;
};

// Epley formula for 1RM estimation
const calculate1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
};

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({ exerciseName }) => {
    const { workouts, loading } = useWorkouts();
    const { navigate } = useAppNavigation();

    const chartData = useMemo<ChartData[]>(() => {
        if (!exerciseName) return [];

        return workouts
            .map(workout => {
                const exerciseInstance = workout.exercises.find(e => e.name === exerciseName);
                if (!exerciseInstance || exerciseInstance.sets.length === 0) return null;

                const maxWeight = Math.max(...exerciseInstance.sets.map(s => s.weight));
                const totalVolume = exerciseInstance.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
                const estimated1RM = Math.max(...exerciseInstance.sets.map(s => calculate1RM(s.weight, s.reps)));

                return {
                    date: new Date(workout.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
                    maxWeight,
                    totalVolume,
                    estimated1RM
                };
            })
            .filter((item): item is ChartData => item !== null)
            .reverse();
    }, [workouts, exerciseName]);

    if (loading) return <p className="text-center">Cargando datos del ejercicio...</p>;
    
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('analysis-dashboard')} className="text-emerald-400 hover:text-emerald-300">&larr; Volver</button>
                <h2 className="text-3xl font-bold text-white tracking-tight">{exerciseName}</h2>
            </div>

            {chartData.length < 2 ? (
                <div className="text-center p-8 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">No hay suficientes datos para mostrar un gráfico. Se necesitan al menos 2 registros de este ejercicio.</p>
                </div>
            ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 bg-gray-800 rounded-lg shadow-lg h-96">
                    <h3 className="font-bold text-lg mb-4 text-emerald-400">Peso Máximo (kg)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="date" stroke="#A0AEC0" />
                            <YAxis stroke="#A0AEC0" />
                            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
                            <Line type="monotone" dataKey="maxWeight" name="Peso Máx." stroke="#34D399" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="p-4 bg-gray-800 rounded-lg shadow-lg h-96">
                    <h3 className="font-bold text-lg mb-4 text-emerald-400">Volumen Total (kg)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="date" stroke="#A0AEC0" />
                            <YAxis stroke="#A0AEC0" />
                            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
                            <Line type="monotone" dataKey="totalVolume" name="Volumen" stroke="#a855f7" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="p-4 bg-gray-800 rounded-lg shadow-lg h-96 lg:col-span-2">
                    <h3 className="font-bold text-lg mb-4 text-emerald-400">1RM Estimado (kg)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="date" stroke="#A0AEC0" />
                            <YAxis stroke="#A0AEC0" />
                            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} />
                            <Line type="monotone" dataKey="estimated1RM" name="1RM Est." stroke="#f59e0b" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
             </div>
            )}
        </div>
    );
};

export default ExerciseDetailView;
