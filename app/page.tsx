'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ApiKeyFlow from '@/components/flows/ApiKeyFlow';
import UserProfileFlow from '@/components/flows/UserProfileFlow';
import FitnessGoalFlow from '@/components/flows/FitnessGoalFlow';
import RoutineGenerationFlow from '@/components/flows/RoutineGenerationFlow';
import RoutineDisplay from '@/components/flows/RoutineDisplay';
import ProgressTracker from '@/components/flows/ProgressTracker';
import { storage } from '@/lib/storage';
import { usePWAInstall } from '@/hooks/usePWAInstall';

type AppFlow = 'api-key' | 'profile' | 'goal' | 'generating' | 'routine-display' | 'progress';

export default function Home() {
  const [currentFlow, setCurrentFlow] = useState<AppFlow>('api-key');
  const [isHydrated, setIsHydrated] = useState(false);
  const { isInstallable, install } = usePWAInstall();

  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service worker registration failed');
      });
    }

    // Check if user has completed initial setup
    const apiKey = storage.getApiKey();
    const userProfile = storage.getUserProfile();
    const routine = storage.getRoutine();

    if (apiKey && userProfile && routine) {
      setCurrentFlow('progress');
    } else if (apiKey && userProfile) {
      setCurrentFlow('routine-display');
    } else if (apiKey) {
      setCurrentFlow('profile');
    }

    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto"></div>
          </div>
          <p className="text-foreground text-lg font-medium">Loading FitFlow...</p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    storage.clearAll();
    setCurrentFlow('api-key');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with reset button and install prompt */}
      {currentFlow !== 'api-key' && (
        <div className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold">FitFlow by Harsh</h1>
            <div className="flex items-center gap-2">
              {isInstallable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={install}
                  className="text-foreground bg-transparent"
                >
                  Install App
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {currentFlow === 'api-key' && (
          <ApiKeyFlow onComplete={() => setCurrentFlow('profile')} />
        )}

        {currentFlow === 'profile' && (
          <UserProfileFlow onComplete={() => setCurrentFlow('goal')} />
        )}

        {currentFlow === 'goal' && (
          <FitnessGoalFlow onComplete={() => setCurrentFlow('generating')} />
        )}

        {currentFlow === 'generating' && (
          <RoutineGenerationFlow onComplete={() => setCurrentFlow('routine-display')} />
        )}

        {currentFlow === 'routine-display' && (
          <RoutineDisplay onStart={() => setCurrentFlow('progress')} />
        )}

        {currentFlow === 'progress' && (
          <ProgressTracker onRestart={() => setCurrentFlow('progress')} />
        )}
      </div>
    </div>
  );
}
