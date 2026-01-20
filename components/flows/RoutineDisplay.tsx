'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import Image from 'next/image';
import type { Routine } from '@/lib/storage';

interface RoutineDisplayProps {
  onStart: () => void;
}

export default function RoutineDisplay({ onStart }: RoutineDisplayProps) {
  const [routine, setRoutine] = useState<Routine[] | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Load routine
  if (!routine) {
    const savedRoutine = storage.getRoutine();
    if (savedRoutine) {
      setRoutine(savedRoutine);
    }
  }

  if (!routine || routine.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground">No routine found</p>
        </div>
      </div>
    );
  }

  const userProfile = storage.getUserProfile();

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your 7-Day Routine</h1>
          <p className="text-muted-foreground">
            Personalized routine for {userProfile?.name || 'you'}
          </p>
        </div>

        {/* Image */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-64">
          <Image
            src="/fitness-progress.jpg"
            alt="Your fitness routine"
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Routine Days */}
        <div className="space-y-3 mb-8">
          {routine.map((dayRoutine) => (
            <div
              key={dayRoutine.day}
              className="bg-card rounded-lg border border-border overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedDay(expandedDay === dayRoutine.day ? null : dayRoutine.day)
                }
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-lg">
                    Day {dayRoutine.day}: {(dayRoutine as any).dayName || 'Workout'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {(dayRoutine as any).focus || `${dayRoutine.exercises.length} exercises`}
                  </p>
                </div>
                <span
                  className={`transform transition-transform ${
                    expandedDay === dayRoutine.day ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>

              {expandedDay === dayRoutine.day && (
                <div className="bg-muted/50 border-t border-border p-4 space-y-4">
                  {dayRoutine.exercises.map((exercise, idx) => (
                    <div key={idx} className="bg-card rounded p-3">
                      <h4 className="font-semibold text-primary mb-2">{exercise.name}</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sets</span>
                          <p className="font-medium">{exercise.sets}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reps</span>
                          <p className="font-medium">{exercise.reps}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rest</span>
                          <p className="font-medium text-xs">{exercise.rest}</p>
                        </div>
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Start Button */}
        <div className="space-y-3">
          <Button
            onClick={() => {
              const progress = {
                userProfile: userProfile!,
                routine,
                startDate: new Date().toISOString(),
                completedDays: 0,
                lastUpdated: new Date().toISOString(),
              };
              storage.setProgress(progress);
              onStart();
            }}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg"
          >
            Start Program
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You can track your progress and complete exercises once you start
          </p>
        </div>
      </div>
    </div>
  );
}
