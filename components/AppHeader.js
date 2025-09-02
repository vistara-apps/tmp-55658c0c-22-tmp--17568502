    'use client';

    import { Identity } from '@coinbase/onchainkit/identity';

    export default function AppHeader() {
      return (
        <header className="flex justify-between items-center py-4 border-b">
          <h1 className="display">VibeFinder</h1>
          <Identity />
        </header>
      );
    }
  