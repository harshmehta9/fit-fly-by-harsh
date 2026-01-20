'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import type { ProgressData } from '@/lib/storage';

interface ProgressTrackerProps {
  onRestart: () => void;
}

export default function ProgressTracker({ onRestart }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [completedExercises, setCompletedExercises] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const savedProgress = storage.getProgress();
    if (savedProgress) {
      setProgress(savedProgress);

      // Determine today's day (rotate through the 7-day cycle)
      const startDate = new Date(savedProgress.startDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentDay = (daysDiff % 7) + 1;
      setSelectedDay(currentDay);

      // Check if completed today
      const lastUpdated = new Date(savedProgress.lastUpdated);
      const isToday =
        lastUpdated.toDateString() === today.toDateString() && savedProgress.completedDays > daysDiff;
      setCompletedToday(isToday);
    }
  }, []);

  const handleCompleteExercise = (exerciseKey: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [exerciseKey]: !prev[exerciseKey],
    }));
  };

  const handleCompleteDay = () => {
    if (progress) {
      const updated = {
        ...progress,
        completedDays: progress.completedDays + 1,
        lastUpdated: new Date().toISOString(),
      };
      storage.setProgress(updated);
      setProgress(updated);
      setCompletedToday(true);
      setCompletedExercises({});
    }
  };

  if (!progress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    );
  }

  const currentDayRoutine = progress.routine.find((r) => r.day === selectedDay);
  const allExercisesCompleted =
    currentDayRoutine &&
    currentDayRoutine.exercises.every(
      (_, idx) => completedExercises[`${selectedDay}-${idx}`]
    );

  const progressPercentage = Math.round((progress.completedDays / 7) * 100);

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {progress.userProfile.name}!</h1>
          <p className="text-muted-foreground">Day {selectedDay} of your 7-day routine</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Overall Progress</h3>
            <span className="text-lg font-bold text-secondary">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary to-accent h-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {progress.completedDays} of 7 days completed
          </p>
        </div>

        {/* Day Selector */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">Select a Day</h3>
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setCompletedExercises({});
                }}
                className={`p-3 rounded-lg font-semibold transition-all ${
                  selectedDay === day
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card border border-border hover:border-primary'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises for Selected Day */}
        {currentDayRoutine && (
          <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">Day {selectedDay} Workout</h2>
            <p className="text-muted-foreground mb-6">
              {(currentDayRoutine as any).focus || 'Full Body'}
            </p>

            <div className="space-y-3 mb-6">
              {currentDayRoutine.exercises.map((exercise, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCompleteExercise(`${selectedDay}-${idx}`)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    completedExercises[`${selectedDay}-${idx}`]
                      ? 'bg-secondary/10 border-secondary'
                      : 'bg-muted/50 border-border hover:border-primary'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={completedExercises[`${selectedDay}-${idx}`] || false}
                      onChange={() => {}}
                      className="mt-1 w-5 h-5"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary">{exercise.name}</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground mt-2">
                        <span>{exercise.sets} sets</span>
                        <span>{exercise.reps} reps</span>
                        <span>{exercise.rest} rest</span>
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-2">{exercise.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Complete Day Button */}
            {!completedToday && (
              <Button
                onClick={handleCompleteDay}
                disabled={!allExercisesCompleted}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {allExercisesCompleted ? '✓ Complete Day' : 'Check all exercises to complete'}
              </Button>
            )}

            {completedToday && (
              <div className="bg-secondary/10 border border-secondary rounded-lg p-4 text-center">
                <p className="text-secondary font-semibold">✓ Day Completed!</p>
                <p className="text-xs text-muted-foreground mt-1">Great job! Come back tomorrow.</p>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold text-secondary">
              {progress.completedDays > 0 ? progress.completedDays : '0'} days
            </p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground">Days Left</p>
            <p className="text-2xl font-bold text-accent">{Math.max(0, 7 - progress.completedDays)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
