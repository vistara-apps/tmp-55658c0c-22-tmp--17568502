'use client';

import { useAccount } from 'wagmi';
import { Identity } from '@coinbase/onchainkit/identity';

export default function AppHeader({ onProfileClick }) {
  const { isConnected } = useAccount();
  
  return (
    <header className="flex justify-between items-center py-4 border-b mb-6">
      <div className="flex items-center">
        <h1 className="display text-primary">VibeFinder</h1>
        <span className="ml-2 text-xs bg-accent text-white px-2 py-1 rounded-full">Beta</span>
      </div>
      
      <div className="flex items-center">
        {isConnected && onProfileClick && (
          <button
            onClick={onProfileClick}
            className="mr-4 text-primary hover:underline flex items-center"
          >
            <span className="mr-1">👤</span> Profile
          </button>
        )}
        <Identity />
      </div>
    </header>
  );
}
