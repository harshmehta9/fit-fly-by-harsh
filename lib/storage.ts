export interface UserProfile {
  name: string;
  height: number; // in cm
  weight: number; // in kg
  fitnessGoal: string;
  createdAt: string;
}

export interface Routine {
  day: number;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface ProgressData {
  userProfile: UserProfile;
  routine: Routine[];
  startDate: string;
  completedDays: number;
  lastUpdated: string;
}

const STORAGE_KEYS = {
  API_KEY: 'fitflow_api_key',
  USER_PROFILE: 'fitflow_user_profile',
  ROUTINE: 'fitflow_routine',
  PROGRESS: 'fitflow_progress',
} as const;

export const storage = {
  setApiKey: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    }
  },

  getApiKey: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.API_KEY);
    }
    return null;
  },

  setUserProfile: (profile: UserProfile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    }
  },

  getUserProfile: (): UserProfile | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  setRoutine: (routine: Routine[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(routine));
    }
  },

  getRoutine: (): Routine[] | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.ROUTINE);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  setProgress: (progress: ProgressData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    }
  },

  getProgress: (): ProgressData | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },

  clearAll: () => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    }
  },
};

export const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal Weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};
