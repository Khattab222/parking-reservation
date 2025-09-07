'use client';
import { useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { wsService } from '@/services/ws';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ParkingStateZone {
  id: string;
  name: string;
  category: string;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  subscriberCount: number;
  open: boolean;
}

async function fetchParkingState() {
  const response = await axios.get(`${API_BASE_URL}/admin/reports/parking-state`,{headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}});
  console.log(response.data);
  return response.data;
}

export default function ParkingStatePage() {
  const { data: zones = [], isLoading, refetch } = useQuery({
    queryKey: ['parking-state'],
    queryFn: fetchParkingState,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

useEffect(() => {
  // Connect to WebSocket
  wsService.connect();
  
  // Listen for admin updates to refresh data
  wsService.onAdminUpdate((update) => {
    // Refresh data when zones are updated
    if (update.targetType === 'zone' || update.action === 'category-rates-changed') {
      refetch();
    }
  });
  
  return () => {
    // Cleanup if needed
  };
}, [refetch]);

  const getStatusColor = (zone: ParkingStateZone) => {
    const occupancyRate = zone.occupied / (zone.occupied + zone.free);
    if (occupancyRate > 0.9) return 'text-red-600 bg-red-50';
    if (occupancyRate > 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <AdminLayout>
      <div>
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Parking State Report</h1>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading parking state...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map((zone: ParkingStateZone,i:number) => (
              <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{zone.name}</h3>
                      <p className="text-sm text-gray-500">{zone.category}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      zone.open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {zone.open ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 ">
                    <div className={`rounded-lg p-3 ${getStatusColor(zone)}`}>
                      <p className="text-2xl font-bold">{zone.occupied}</p>
                      <p className="text-xs">Occupied</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-gray-900">{zone.free}</p>
                      <p className="text-xs text-gray-500">Free</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reserved:</span>
                      <span className="font-medium text-gray-500">{zone.reserved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Available for Visitors:</span>
                      <span className="font-medium text-gray-500">{zone.availableForVisitors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Available for Subscribers:</span>
                      <span className="font-medium text-gray-500">{zone.availableForSubscribers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active Subscribers:</span>
                      <span className="font-medium text-gray-500">{zone.subscriberCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}