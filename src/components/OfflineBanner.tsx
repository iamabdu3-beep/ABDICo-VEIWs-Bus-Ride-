import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Language } from '../types';

export const OfflineBanner: React.FC<{ lang: Language }> = ({ lang }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  const isAm = lang === 'am';

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50 flex items-center justify-between gap-3 bg-amber-500 text-neutral-950 px-4 py-2.5 rounded-2xl shadow-xl border border-amber-600 animate-in slide-in-from-bottom-4"
    >
      <div className="flex items-center gap-2 text-xs font-semibold">
        <WifiOff className="w-4 h-4 shrink-0 text-neutral-900" />
        <span>
          {isAm
            ? 'ከመስመር ውጭ ሞድ፡ የተያዙ ትኬቶችዎ እና የጣቢያ ዝርዝር በስልክዎ ላይ ተቀምጠዋል'
            : 'Offline Mode: Your booked tickets and station guides are cached safely.'}
        </span>
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="p-1 rounded-lg hover:bg-amber-600/30 transition text-neutral-900 shrink-0"
        title={isAm ? 'እንደገና ሞክር' : 'Refresh'}
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
