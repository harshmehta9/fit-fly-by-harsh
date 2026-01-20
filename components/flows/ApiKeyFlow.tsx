'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storage } from '@/lib/storage';
import Image from 'next/image';

interface ApiKeyFlowProps {
  onComplete: () => void;
}

export default function ApiKeyFlow({ onComplete }: ApiKeyFlowProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }

    // Store the API key without validation
    storage.setApiKey(apiKey);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Image */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg h-64">
          <Image
            src="/fitness-onboard.jpg"
            alt="Start your fitness journey"
            width={400}
            height={300}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Card */}
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FitFlow</h1>
            <p className="text-muted-foreground">Your AI-powered personalized gym routine</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Gemini API Key
              </label>
              <Input
                type="password"
                placeholder="AIzaSy... from Google AI Studio"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Get your free API key from{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!apiKey.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
