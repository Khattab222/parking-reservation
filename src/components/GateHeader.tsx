import { WifiIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface GateHeaderProps {
  gateName: string;
  gateId: string;
  isConnected: boolean;
}

export default function GateHeader({ gateName, gateId, isConnected }: GateHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {gateName || 'Gate Check-in'}
                </h1>
                <p className="text-slate-600">Gate ID: {gateId}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <WifiIcon className={`w-5 h-5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600 font-mono">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}