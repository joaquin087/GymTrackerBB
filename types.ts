
export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface Exercise {
  name: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  muscleGroups: string[];
  exercises: Exercise[];
  notes?: string;
}

export interface PrefabExercise {
  id: string;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string; // Comma-separated
  equipment: string;
  form: string;
}
