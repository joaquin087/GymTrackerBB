
import type { Workout, PrefabExercise } from '../types';

const SHEETS_API_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Fetches data using the public read-only API key
export const getSheetData = async (apiKey: string, sheetId: string, sheetName: string): Promise<string[][]> => {
    const url = `${SHEETS_API_BASE_URL}/${sheetId}/values/${sheetName}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Google Sheets API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.values || [];
};

// --- Functions interacting with the Google Apps Script Web App ---

interface ScriptPayload {
    action: string;
    payload: any;
}

const postToScript = async (scriptUrl: string, data: ScriptPayload) => {
    const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Apps Script request failed: ${errorText}`);
    }
    return response.json();
}

// Transforms a nested workout object into flat rows for the sheet
const workoutToSheetRows = (workout: Workout): string[][] => {
    const rows: string[][] = [];
    const muscleGroupsStr = workout.muscleGroups.join(', ');
    
    workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            rows.push([
                workout.id,
                workout.date,
                workout.title,
                muscleGroupsStr,
                workout.notes || '',
                exercise.name,
                set.weight.toString(),
                set.reps.toString()
            ]);
        });
    });
    return rows;
}

export const saveWorkout = async (scriptUrl: string, workout: Workout) => {
    const rows = workoutToSheetRows(workout);
    return postToScript(scriptUrl, {
        action: 'saveWorkout',
        payload: { workoutId: workout.id, rows }
    });
};

export const deleteWorkout = async (scriptUrl: string, workoutId: string) => {
    return postToScript(scriptUrl, {
        action: 'deleteWorkout',
        payload: { workoutId }
    });
}

// Transforms the list of exercises into a 2D array for the sheet
const exercisesToSheetRows = (exercises: PrefabExercise[]): string[][] => {
    const rows = exercises.map(ex => [ex.id, ex.name, ex.primaryMuscle, ex.secondaryMuscles, ex.equipment, ex.form]);
    // Add header row
    rows.unshift(['id', 'name', 'primaryMuscle', 'secondaryMuscles', 'equipment', 'form']);
    return rows;
}

export const updateExercises = async (scriptUrl: string, exercises: PrefabExercise[]) => {
    const rows = exercisesToSheetRows(exercises);
    return postToScript(scriptUrl, {
        action: 'updateExercises',
        payload: { rows }
    });
}
