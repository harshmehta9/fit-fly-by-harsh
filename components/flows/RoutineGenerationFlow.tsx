'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import type { Routine } from '@/lib/storage';
import { GoogleGenAI } from '@google/genai';

interface RoutineGenerationFlowProps {
  onComplete: () => void;
}

export default function RoutineGenerationFlow({ onComplete }: RoutineGenerationFlowProps) {
  const [status, setStatus] = useState('Starting routine generation...');
  const [error, setError] = useState('');

  useEffect(() => {
    const generateRoutine = async () => {
      try {
        const apiKey = storage.getApiKey();
        const userProfile = storage.getUserProfile();

        if (!apiKey || !userProfile) {
          setError('Missing API key or profile data');
          return;
        }

        setStatus('Analyzing your profile...');

        const goalLabels: { [key: string]: string } = {
          'fat-loss': 'Fat Loss',
          'muscle-gain': 'Muscle Gain',
          'recomposition': 'Recomposition (Fat Loss + Muscle Gain)',
          'strength': 'Strength',
          'general-fitness': 'General Fitness',
          'rehab-mobility': 'Rehab / Mobility',
        };

        const prompt = `Create a detailed 7-day gym routine for:
Name: ${userProfile.name}
Height: ${userProfile.height} cm
Weight: ${userProfile.weight} kg
Goal: ${goalLabels[userProfile.fitnessGoal]}

Provide the routine in JSON format with this exact structure:
{
  "routine": [
    {
      "day": 1,
      "dayName": "Monday",
      "focus": "Chest & Triceps",
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "sets": 4,
          "reps": "8-10",
          "rest": "90 seconds",
          "notes": "Warm up with lighter weights"
        }
      ]
    }
  ]
}

Make the routine realistic, safe, and tailored to the ${userProfile.fitnessGoal} goal. Include 5-7 exercises per day.`;

        setStatus('Generating your personalized routine...');

        // Initialize Google GenAI with API key
        const ai = new GoogleGenAI({ apiKey });

        // Generate content using gemini-3-flash-preview
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });

        const content = result.text;

        if (!content) {
          throw new Error('Invalid response from AI');
        }

        // Parse the JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse routine data');
        }

        const parsedData = JSON.parse(jsonMatch[0]);
        const routine: Routine[] = parsedData.routine.map((day: any) => ({
          day: day.day,
          dayName: day.dayName,
          focus: day.focus,
          exercises: day.exercises,
        }));

        setStatus('Saving your routine...');
        storage.setRoutine(routine);

        setTimeout(() => {
          onComplete();
        }, 500);
      } catch (err) {
        console.error('Error generating routine:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to generate routine. Please try again.'
        );
      }
    };

    generateRoutine();
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          {error ? (
            <>
              <div className="mb-6">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-destructive mb-2">Generation Failed</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold mb-4">Creating Your Routine</h2>
                <p className="text-muted-foreground">{status}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse animation-delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse animation-delay-200"></div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
