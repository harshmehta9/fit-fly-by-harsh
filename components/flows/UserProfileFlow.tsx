'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storage, calculateBMI, getBMICategory } from '@/lib/storage';

interface UserProfileFlowProps {
  onComplete: () => void;
}

export default function UserProfileFlow({ onComplete }: UserProfileFlowProps) {
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');

  const bmi = height && weight ? calculateBMI(parseFloat(height), parseFloat(weight)) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);

    if (!height || !weight || heightNum <= 0 || weightNum <= 0) {
      setError('Please enter valid height and weight');
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      setError('Height should be between 100 and 250 cm');
      return;
    }

    if (weightNum < 20 || weightNum > 300) {
      setError('Weight should be between 20 and 300 kg');
      return;
    }

    const userProfile = {
      name: name.trim(),
      height: heightNum,
      weight: weightNum,
      fitnessGoal: '',
      createdAt: new Date().toISOString(),
    };

    storage.setUserProfile(userProfile);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
          <p className="text-muted-foreground mb-8">
            Tell us about yourself so we can personalize your routine
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <Input
                  type="number"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <Input
                  type="number"
                  placeholder="75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* BMI Display */}
            {bmi && (
              <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">BMI</span>
                  <span className="text-lg font-bold text-secondary">{bmi}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{bmiCategory}</p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!name || !height || !weight}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
