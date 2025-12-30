'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';

export default function SignOutPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    
    // Simulate sign out process
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // TODO: Implement actual sign out logic (clear tokens, session, etc.)
    console.log('User signed out');
    
    router.push('/');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
      <Card variant="elevated" padding="lg" className="w-full max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-amber-600 dark:text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Sign Out
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Are you sure you want to sign out of your account?
        </p>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth isLoading={isSigningOut} onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
