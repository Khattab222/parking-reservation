'use client';
import { useState, useCallback } from 'react';
import {
  CreditCardIcon,
  ClockIcon,
  CalculatorIcon,
  UserIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CheckoutResponse, Zone } from '@/types';
import { wsService } from '@/services/ws';


const queryClient = new QueryClient();



async function fetchTicket(ticketId: string) {
  const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`);
  return response.data;
}

async function checkoutTicket(data: { ticketId: string; forceConvertToVisitor?: boolean }) {
  const response = await axios.post(`${API_BASE_URL}/tickets/checkout`, data);
  return response.data;
}

async function fetchSubscription(subscriptionId: string) {
  const response = await axios.get(`${API_BASE_URL}/subscriptions/${subscriptionId}`);
  return response.data;
}

function CheckpointScreen() {
  const [ticketId, setTicketId] = useState('');
  const [scannedTicketId, setScannedTicketId] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse| null>(null);

  // Queries
  const ticketQuery = useQuery({
    queryKey: ['ticket', scannedTicketId],
    queryFn: () => fetchTicket(scannedTicketId),
    enabled: Boolean(scannedTicketId),
    retry: false,
  });

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', checkoutData?.subscriptionId],
    queryFn: () => fetchSubscription(checkoutData!.subscriptionId!),
    enabled: Boolean(checkoutData?.subscriptionId),
  });

  // Mutations
  const checkoutMutation = useMutation({
    mutationFn: checkoutTicket,
    onSuccess: (data) => {
      console.log({data})
      setCheckoutData(data);
      // WS zone updates reflect occupancy change.
      
              wsService.onZoneUpdate((updatedZone) => {
                  queryClient.setQueryData(['zones', data.gateIds], (oldZones: Zone[] | undefined) =>
                    oldZones?.map(z => z.id === updatedZone.id ? updatedZone : z)
                  );
                });
    },
  });

  const handleScanTicket = useCallback(() => {
    if (ticketId.trim()) {
      setScannedTicketId(ticketId.trim());
      checkoutMutation.mutate({ ticketId: ticketId.trim() });
    }
  }, [ticketId, checkoutMutation]);

  const handleConvertToVisitor = useCallback(() => {
    if (scannedTicketId) {
      checkoutMutation.mutate({ 
        ticketId: scannedTicketId, 
        forceConvertToVisitor: true 
      });
    }
  }, [scannedTicketId, checkoutMutation]);

  const handleComplete = useCallback(() => {
    setShowConfirmation(true);
    setTimeout(() => {
      // Reset state for next ticket
      setTicketId('');
      setScannedTicketId('');
      setCheckoutData(null);
      setShowConfirmation(false);
    }, 3000);
  }, []);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-slate-900">Checkpoint - Check Out</h1>
            <p className="text-slate-600">Process vehicle check-outs</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Scanner */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Scan or Enter Ticket ID</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="Paste or type ticket ID"
              className="flex-1 px-4 py-3 border text-gray-600 placeholder:text-gray-400 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-0 text-lg font-mono"
            />
            <button
              onClick={handleScanTicket}
              disabled={!ticketId.trim() || checkoutMutation.isPending}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Process Checkout'}
            </button>
          </div>
        </div>

        {/* Error State */}
        {checkoutMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700">
                {(checkoutMutation.error as any)?.response?.data?.message || 'Failed to process checkout'}
              </p>
            </div>
          </div>
        )}

        {/* Checkout Details */}
        {checkoutData && (
          <>
            {/* Ticket Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 text-gray-600">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Ticket Summary
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600">Check-in Time</p>
                  <p className="font-medium">{formatDateTime(checkoutData.checkinAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Check-out Time</p>
                  <p className="font-medium">{formatDateTime(checkoutData.checkoutAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Duration</p>
                  <p className="font-medium">{formatDuration(checkoutData.durationHours)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ticket ID</p>
                  <p className="font-medium font-mono">{checkoutData.ticketId}</p>
                </div>
              </div>

              {/* Rate Breakdown */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Rate Breakdown
                </h3>
                <div className="space-y-2">
                  {checkoutData.breakdown.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm">
                          {new Date(segment.from).toLocaleTimeString()} - {new Date(segment.to).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-slate-600">
                          {formatDuration(segment.hours)} @ ${segment.rate}/hr 
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            segment.rateMode === 'special' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {segment.rateMode}
                          </span>
                        </p>
                      </div>
                      <p className="font-semibold">${segment.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-indigo-900">Total Amount</p>
                  <p className="text-2xl font-bold text-indigo-900">${checkoutData.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            {checkoutData.subscriptionId && subscriptionQuery.data && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Subscription Details
                </h2>
                
                <div className="mb-4">
                  <p className="text-sm text-slate-600">Subscriber Name</p>
                  <p className="font-medium">{subscriptionQuery.data.userName}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-3">Registered Vehicles</p>
                  <div className="space-y-3">
                    {subscriptionQuery.data.cars.map((car: any, index: number) => (
                      <div key={index} className="flex items-center p-3 bg-slate-50 rounded-lg">
                        <TruckIcon className="w-5 h-5 text-slate-400 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium">{car.plate}</p>
                          <p className="text-sm text-slate-600">{car.model} - {car.color}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Convert to Visitor Option */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-3">
                    If the vehicle plate doesn't match the registered vehicles, you can convert this to a visitor ticket.
                  </p>
                  <button
                    onClick={handleConvertToVisitor}
                    disabled={checkoutMutation.isPending}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Convert to Visitor Ticket
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setTicketId('');
                  setScannedTicketId('');
                  setCheckoutData(null);
                }}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Complete Checkout
              </button>
            </div>
          </>
        )}

        {/* Success Confirmation */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Checkout Complete!</h3>
                <p className="text-slate-600">The gate has been opened</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckpointPage() {
  return (
    <ProtectedRoute>
      <CheckpointScreen />
    </ProtectedRoute>
  );
}