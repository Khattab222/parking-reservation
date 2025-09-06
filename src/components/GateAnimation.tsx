
import { useEffect } from 'react';

interface GateAnimationProps {
  isOpen: boolean;
  onAnimationComplete?: () => void;
}

export default function GateAnimation({ isOpen, onAnimationComplete }: GateAnimationProps) {
  useEffect(() => {
    if (isOpen && onAnimationComplete) {
      
      const timer = setTimeout(onAnimationComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onAnimationComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-96 h-96">
        {/* Success Circle Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Ripple Effect */}
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping animation-delay-200 opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-green-500 animate-ping animation-delay-400 opacity-20"></div>
            
            {/* Center Circle */}
            <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
              <svg
                className="w-16 h-16 text-white animate-scale-check"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Gate Open Animation */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48">
          {/* Gate Left Side */}
          <div className="absolute top-0 left-0 w-1/2 h-64 bg-gradient-to-br from-slate-700 to-slate-900 rounded-l-lg shadow-2xl animate-gate-open-left transform-gpu origin-left">
            <div className="absolute inset-2 border-2 border-slate-600 rounded-l-lg"></div>
          </div>
          
          {/* Gate Right Side */}
          <div className="absolute top-0 right-0 w-1/2 h-64 bg-gradient-to-bl from-slate-700 to-slate-900 rounded-r-lg shadow-2xl animate-gate-open-right transform-gpu origin-right">
            <div className="absolute inset-2 border-2 border-slate-600 rounded-r-lg"></div>
          </div>
        </div>

        {/* Success Text */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold text-white mb-2">Gate Open!</h2>
          <p className="text-slate-200">Please proceed to enter</p>
        </div>
      </div>
    </div>
  );
}