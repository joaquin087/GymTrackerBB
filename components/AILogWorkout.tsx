
import React, { useState } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useExercises } from '../hooks/useExercises';
import { parseWorkoutText } from '../services/geminiService';
import { useAppNavigation } from '../hooks/useAppNavigation';

interface AILogWorkoutProps {
    onWorkoutAdded: () => void;
}

const AILogWorkout: React.FC<AILogWorkoutProps> = ({ onWorkoutAdded }) => {
    const { addWorkout } = useWorkouts();
    const { exercises } = useExercises();
    const { navigate } = useAppNavigation();

    const [workoutText, setWorkoutText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const exampleText = `17/12 - Push (Pecho, hombros, triceps)

- Pecho
Press plano con barra recta 0kgx15, 7.5x12, 12.5x10, 17.5x10
Apertura en banco inclinado con mancuerna 8x12, 10x13

- Hombros
Press militar con mancuernas 8kgx10, 10x8

- Triceps
Extension de triceps en polea alta 10x15, 15x12, 20x8`;

    const handleParse = async () => {
        if (!workoutText.trim()) {
            setError("Por favor, introduce el texto de tu entrenamiento.");
            return;
        }
        if (exercises.length === 0) {
            setError("Primero debes añadir ejercicios a tu biblioteca. Ve a la pestaña 'Ejercicios'.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const parsedWorkout = await parseWorkoutText(workoutText, exercises);
            addWorkout(parsedWorkout);
            setWorkoutText('');
            onWorkoutAdded();
        } catch (err: any) {
            setError(err.message || "Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUseExample = () => {
        setWorkoutText(exampleText);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-emerald-400">Registrar con IA</h2>
                <p className="text-gray-400 mt-2">Pega las notas de tu entrenamiento y deja que la IA las organice por ti.</p>
                 {exercises.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-900/50 text-yellow-300 rounded-md">
                        <p>No tienes ejercicios en tu biblioteca. <button onClick={() => navigate('exercises')} className="font-bold underline hover:text-yellow-200">Añade algunos</button> para que la IA funcione correctamente.</p>
                    </div>
                )}
            </div>

            {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-center">{error}</p>}
            
            <div className="flex flex-col space-y-4">
                <textarea
                    value={workoutText}
                    onChange={(e) => setWorkoutText(e.target.value)}
                    placeholder="Pega aquí tu registro de entrenamiento..."
                    className="w-full h-64 bg-gray-900 border border-gray-700 rounded-md p-4 focus:ring-emerald-500 focus:border-emerald-500 resize-y font-mono text-sm"
                    disabled={isLoading}
                />
                 <button 
                    onClick={handleUseExample} 
                    className="text-sm text-emerald-400 hover:text-emerald-300 self-start"
                    disabled={isLoading}>
                    Usar texto de ejemplo
                </button>
            </div>

            <button
                onClick={handleParse}
                disabled={isLoading || exercises.length === 0}
                className="w-full flex justify-center items-center text-white font-bold bg-emerald-600 hover:bg-emerald-500 rounded-md py-3 transition-colors text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                    </>
                ) : (
                    'Analizar y Guardar Entrenamiento'
                )}
            </button>
        </div>
    );
};

export default AILogWorkout;
