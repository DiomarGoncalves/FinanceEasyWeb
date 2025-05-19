import React from 'react';
import { CreditCard } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-blue-900 text-white">
      <div className="animate-pulse-slow">
        <CreditCard size={64} className="mb-4" />
      </div>
      <h1 className="text-2xl font-semibold mb-4">FinControl</h1>
      <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <div className="h-full bg-white animate-[progress_1.5s_ease-in-out_infinite]" 
             style={{width: '0%', animation: 'progress 1.5s ease-in-out infinite'}}></div>
      </div>
      <style>
        {`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;