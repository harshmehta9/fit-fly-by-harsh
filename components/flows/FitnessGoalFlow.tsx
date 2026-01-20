'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';

interface FitnessGoalFlowProps {
  onComplete: () => void;
}

const FITNESS_GOALS = [
  {
    id: 'fat-loss',
    label: 'Fat Loss',
    description: 'Lose weight and reduce body fat',
    icon: '🔥',
  },
  {
    id: 'muscle-gain',
    label: 'Muscle Gain',
    description: 'Build lean muscle and strength',
    icon: '💪',
  },
  {
    id: 'recomposition',
    label: 'Recomposition',
    description: 'Lose fat while gaining muscle',
    icon: '⚖️',
  },
  {
    id: 'strength',
    label: 'Strength',
    description: 'Increase your maximum strength',
    icon: '🏋️',
  },
  {
    id: 'general-fitness',
    label: 'General Fitness',
    description: 'Improve overall health and fitness',
    icon: '🏃',
  },
  {
    id: 'rehab-mobility',
    label: 'Rehab / Mobility',
    description: 'Recover and improve mobility',
    icon: '🧘',
  },
];

export default function FitnessGoalFlow({ onComplete }: FitnessGoalFlowProps) {
  const [selectedGoal, setSelectedGoal] = useState('');

  const handleSelect = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleContinue = () => {
    if (selectedGoal) {
      const userProfile = storage.getUserProfile();
      if (userProfile) {
        userProfile.fitnessGoal = selectedGoal;
        storage.setUserProfile(userProfile);
      }
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">What's Your Fitness Goal?</h2>
          <p className="text-muted-foreground mb-8">
            Select the goal that best matches what you want to achieve
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {FITNESS_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleSelect(goal.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedGoal === goal.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">{goal.icon}</div>
                <h3 className="font-semibold mb-1">{goal.label}</h3>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
              </button>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!selectedGoal}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Generate My Routine
          </Button>
        </div>
      </div>
    </div>
  );
}
