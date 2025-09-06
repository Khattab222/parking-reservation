'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPinIcon, 
  BuildingStorefrontIcon,
  ChevronRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGates } from '@/store/slices/gatesSlice';

const locationColors = {
  North: 'bg-blue-100 text-blue-800 border-blue-200',
  South: 'bg-green-100 text-green-800 border-green-200',
  East: 'bg-orange-100 text-orange-800 border-orange-200',
  West: 'bg-purple-100 text-purple-800 border-purple-200'
};

// Skeleton Components (same as before)
const StatsCardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
    <div className="flex items-center">
      <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
      <div className="ml-4">
        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-slate-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const GateCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
          <div className="ml-3">
            <div className="h-5 bg-slate-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div className="w-4 h-4 bg-slate-200 rounded mr-2"></div>
        <div className="h-6 bg-slate-200 rounded w-16"></div>
      </div>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <div className="h-4 bg-slate-200 rounded w-28"></div>
          <div className="ml-2 w-6 h-6 bg-slate-200 rounded-full"></div>
        </div>
        <div className="flex flex-wrap gap-1">
          <div className="h-6 bg-slate-200 rounded w-16"></div>
          <div className="h-6 bg-slate-200 rounded w-16"></div>
          <div className="h-6 bg-slate-200 rounded w-16"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export default function GatesPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { gates, loading, error } = useAppSelector((state) => state.gates);

  useEffect(() => {
    dispatch(fetchGates())
  }, [dispatch])

  const handleGateClick = (gateId: string) => {
    router.push(`/gate/${gateId}`);
  };

  // Loading State Component
  const LoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <GateCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading === 'pending') {
    return <LoadingState />;
  }

  if (error) {
    return <div>Error loading gates</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <BuildingStorefrontIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Gates</p>
                <p className="text-2xl font-bold text-slate-900">{gates.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPinIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active Gates</p>
              Z
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FunnelIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Locations</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(gates.map(g => g.location)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ChevronRightIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Zones</p>
                <p className="text-2xl font-bold text-slate-900">
                  {gates.reduce((acc, gate) => acc + gate.zoneIds.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gates?.map((gate) => (
            <div 
              key={gate.id} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:border-indigo-200 group cursor-pointer"
              onClick={() => handleGateClick(gate.id)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300">
                      <BuildingStorefrontIcon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {gate.name}
                      </h3>
                      <p className="text-sm text-slate-500">ID: {gate.id}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center mb-4">
                  <MapPinIcon className="w-4 h-4 text-slate-400 mr-2" />
                  <span className={`px-2 py-1 rounded-md text-xs font-medium border ${locationColors[gate.location as keyof typeof locationColors]}`}>
                    {gate.location}
                  </span>
                </div>

                {/* Zones */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Connected Zones</span>
                    <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {gate.zoneIds.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {gate.zoneIds.slice(0, 3).map((zoneId) => (
                      <span key={zoneId} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        {zoneId.replace('zone_', 'Zone ')}
                      </span>
                    ))}
                    {gate.zoneIds.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        +{gate.zoneIds.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    className="flex-1 py-2 px-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGateClick(gate.id);
                    }}
                  >
                    Check In
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}