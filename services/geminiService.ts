
import { GoogleGenAI, Type } from "@google/genai";
import type { Workout, PrefabExercise } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder check. The environment is expected to have the API key.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const workoutSchema = {
  type: Type.OBJECT,
  properties: {
    date: { type: Type.STRING, description: "La fecha del entrenamiento en formato YYYY-MM-DD." },
    title: { type: Type.STRING, description: "Un título corto para el entrenamiento, ej: 'Push'." },
    muscleGroups: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de grupos musculares trabajados, extraídos de los encabezados."
    },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Nombre del ejercicio, debe coincidir EXACTAMENTE con uno de los nombres de la biblioteca de ejercicios proporcionada." },
          sets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weight: { type: Type.NUMBER, description: "Peso levantado en kg." },
                reps: { type: Type.NUMBER, description: "Número de repeticiones." }
              },
              required: ["weight", "reps"]
            }
          }
        },
        required: ["name", "sets"]
      }
    },
    notes: { type: Type.STRING, description: "Notas adicionales, comentarios, resúmenes de calentamiento o notas sobre futuros entrenamientos." }
  },
  required: ["date", "title", "muscleGroups", "exercises"]
};

export const parseWorkoutText = async (text: string, prefabExercises: PrefabExercise[]): Promise<Omit<Workout, 'id'>> => {
  const prefabExercisesString = JSON.stringify(prefabExercises, null, 2);
  
  const prompt = `
    Eres un experto analista de datos de fitness. Tu tarea es analizar un registro de entrenamiento no estructurado y detallado de un usuario y convertirlo en un objeto JSON estructurado y limpio.

    El usuario tiene una biblioteca personal de ejercicios con detalles específicos. Tu objetivo es hacer coincidir el ejercicio del registro del usuario con el MEJOR y MÁS LÓGICO ejercicio de esta biblioteca.
    
    Aquí está la biblioteca de ejercicios del usuario en formato JSON:
    ---
    ${prefabExercisesString}
    ---

    Aquí está el registro de entrenamiento del usuario:
    ---
    ${text}
    ---

    Sigue estas reglas ESTRICTAMENTE para analizar el texto:
    1.  **Formato de Salida:** El resultado DEBE ser un único objeto JSON que se ajuste al esquema proporcionado.
    2.  **Fecha y Título:** Extrae el título (ej. "PUSH") y la fecha (ej. "13/02/2026") de la primera línea. Convierte la fecha al formato YYYY-MM-DD.
    3.  **Grupos Musculares:** Identifica los grupos musculares principales de los encabezados en el texto (ej. "- PECHO", "- Hombros"). Crea una lista de estos grupos para el campo 'muscleGroups'.
    4.  **Matching de Ejercicios (REGLA CRÍTICA):** Para cada ejercicio en el registro del usuario (ej. "Press inclinado banco con mancuerna"), analiza el nombre, el instrumento ("mancuerna") y la forma ("banco inclinado"). Luego, busca en la biblioteca JSON el ejercicio que MEJOR coincida con todas estas características. En tu respuesta JSON, DEBES usar el valor exacto del campo 'name' del ejercicio que has emparejado de la biblioteca. Por ejemplo, si el usuario escribe "apertura en banco inclinado con mancuernas" y en la biblioteca hay un ejercicio con name: "Aperturas Inclinadas con Mancuernas", debes usar "Aperturas Inclinadas con Mancuernas".
    5.  **Ignorar Calentamiento y Aproximación:** Descarta completamente cualquier sección etiquetada como "Estiramientos", "Bici fija", "Movimientos aeróbicos". También ignora cualquier serie de aproximación que esté entre paréntesis, como "(aprox con barra 0x15, 8x5, 12.5x2)". Solo procesa las series de trabajo reales.
    6.  **Análisis de Series:**
        -   Una serie se representa como "peso x repeticiones" (ej. "17.5x10").
        -   **Drop Sets:** Si una serie se anota como "20x10(+10x10 sin descanso)" o similar, trátala como DOS series separadas: una de 20kg x 10 reps y otra de 10kg x 10 reps.
    7.  **Cálculo de Peso (Reglas Críticas):**
        -   **Barra (recta, EZ, etc.):** Si el ejercicio usa una "barra", el peso anotado es 'por lado'. DEBES duplicar este peso para el valor final (ej. "2.5x10" se convierte en un peso de 5). Si el peso es 0, permanece 0.
        -   **Mancuerna:** Si usa "mancuerna", el peso anotado es el de UNA SOLA mancuerna. Usa este valor directamente (ej. "15x10" es un peso de 15). Ignora aclaraciones entre paréntesis como "(dos mancuernas de 5)"; el valor principal es el que cuenta.
        -   **Máquina o Polea:** Si es una "máquina" o "polea", el peso anotado es el peso total. Úsalo directamente.
        -   **Peso Corporal:** Si es un ejercicio de peso corporal (ej. "Goblet squat"), el peso es el de la mancuerna/kettlebell utilizada, no 0. Si no se usa peso adicional, es 0.
    8.  **Recopilación de Notas:** Cualquier texto que no sea un ejercicio (comentarios que empiezan con '*', notas sobre la sesión, planes para futuros entrenamientos como "El próximo entrenamiento es mañana...") debe ser recopilado en un único campo 'notes' de nivel superior.
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: workoutSchema,
            temperature: 0.05
        },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("La respuesta de la API estaba vacía.");
    }
    
    return JSON.parse(jsonText) as Omit<Workout, 'id'>;

  } catch (error) {
    console.error("Error al procesar el texto del entrenamiento con Gemini:", error);
    throw new Error("No se pudo analizar el texto del entrenamiento. La IA no pudo interpretar el formato. Por favor, revisa el texto y vuelve a intentarlo.");
  }
};
