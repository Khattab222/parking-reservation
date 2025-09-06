'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ZoneCard from '@/components/ZoneCard';
import GateHeader from '@/components/GateHeader';
import TicketModal from '@/components/TicketModal';
import GateAnimation from '@/components/GateAnimation';
import { wsService } from '@/services/ws';
import { getZonesByGateId, verifySubscription, createCheckin } from '@/services/api';
import { Zone, Ticket } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGates } from '@/store/slices/gatesSlice';

// Add debounce hook
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const queryClient = new QueryClient();

export default function PageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <GatePage />
    </QueryClientProvider>
  );
}

function GatePage() {
  const params = useParams();
  const gateId = params.id as string;

  // State
  const [activeTab, setActiveTab] = useState<'visitor' | 'subscriber'>('visitor');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [subscriptionInput, setSubscriptionInput] = useState(''); // Raw input value
  const [isConnected, setIsConnected] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showGateAnimation, setShowGateAnimation] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Debounce the subscription input for API calls
  const debouncedSubscriptionId = useDebounce(subscriptionInput, 500);

  const dispatch = useAppDispatch();
  const { gates } = useAppSelector(state => state.gates);

  useEffect(() => {
    dispatch(fetchGates());
  }, [dispatch]);

  // Memoize gate name lookup
  const getGateName = useCallback((id: string) => {
    const gate = gates.find(g => g.id === id);
    return gate ? gate.name : 'Gate Check-in';
  }, [gates]);

  // Queries
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['zones', gateId],
    queryFn: () => getZonesByGateId(gateId),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes

  });

  const { 
    data: subscription, 
    isLoading: isSubscriptionLoading,
    error: subscriptionError 
  } = useQuery({
    queryKey: ['subscription', debouncedSubscriptionId],
    queryFn: () => verifySubscription(debouncedSubscriptionId),
    enabled: Boolean(debouncedSubscriptionId && debouncedSubscriptionId.length > 3), // Only query when ID is long enough
    retry: false,
    staleTime: 30 * 1000, // Consider subscription data stale after 30 seconds
  });

  // Mutations
  const checkinMutation = useMutation({
    mutationFn: createCheckin,
    onSuccess: (data) => {
      console.log({ data });
      setCurrentTicket(data.ticket);
      setShowGateAnimation(true);
      queryClient.setQueryData(['zones', gateId], (oldZones: Zone[] | undefined) => 
        oldZones?.map(z => z.id === data.zoneState.id ? data.zoneState : z)
      );
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Handle gate animation complete
  const handleGateAnimationComplete = useCallback(() => {
    setShowGateAnimation(false);
    setShowTicketModal(true);
  }, []);

  // WebSocket setup
  useEffect(() => {
    wsService.connect();
    wsService.onConnected(() => setIsConnected(true));
    wsService.onDisconnected(() => setIsConnected(false));
    wsService.subscribeToGate(gateId);
    
    wsService.onZoneUpdate((updatedZone) => {
      queryClient.setQueryData(['zones', gateId], (oldZones: Zone[] | undefined) =>
        oldZones?.map(z => z.id === updatedZone.id ? updatedZone : z)
      );
    });

    return () => {
      wsService.unsubscribeFromGate(gateId);
      wsService.disconnect();
    };
  }, [gateId]);

  // Update error state based on subscription status
  useEffect(() => {
    if (subscriptionError) {
      setError('Invalid subscription ID');
    } else if (subscription) {
      setError(null);
    } else if (debouncedSubscriptionId && !isSubscriptionLoading && !subscription) {
      setError('Please enter a valid subscription ID');
    }
  }, [subscription, debouncedSubscriptionId, isSubscriptionLoading, subscriptionError]);


  const isZoneSelectable = useCallback((zone: Zone): boolean => {
    if (!zone.open) return false;
    if (activeTab === 'visitor') {
      return zone.availableForVisitors > 0;
    } else {
      if (!subscription) {
        return false;
      } else {
        return Boolean(
          subscription?.active &&
          subscription?.categories?.includes(zone.categoryId) &&
          zone.availableForSubscribers > 0
        );
      }
    }
  }, [activeTab, subscription]);

  // Optimize input change handler
  const handleSubscriptionInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSubscriptionInput(value);
    setError(null); 
  }, []);

  // Optimize checkin handler
  const handleCheckin = useCallback(() => {
    if (!selectedZone) return;
    
    const zone = zones.find(z => z.id === selectedZone);
    if (!zone) return;

    const data = {
      gateId,
      zoneId: selectedZone,
      type: activeTab as 'visitor' | 'subscriber',
      ...(activeTab === 'subscriber' && subscription && { subscriptionId: subscription.id || debouncedSubscriptionId })
    };

    checkinMutation.mutate(data);
  }, [selectedZone, zones, gateId, activeTab, subscription, debouncedSubscriptionId, checkinMutation]);

  // Optimize modal close handler
  const handleModalClose = useCallback(() => {
    setShowTicketModal(false);
    setCurrentTicket(null);
    setSelectedZone(null);
    if (activeTab === 'subscriber') {
      setSubscriptionInput('');
  
    }
  }, [activeTab, debouncedSubscriptionId]);

  // Memoize current zone name
  const currentZoneName = useMemo(() => {
    return zones.find(z => z.id === currentTicket?.zoneId)?.name || '';
  }, [zones, currentTicket]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading gate information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <GateHeader 
        gateName={getGateName(gateId)}
        gateId={gateId}
        isConnected={isConnected}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('visitor')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'visitor'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserGroupIcon className="w-4 h-4 inline mr-2" />
            Visitor
          </button>
          <button
            onClick={() => setActiveTab('subscriber')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'subscriber'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UsersIcon className="w-4 h-4 inline mr-2" />
            Subscriber
          </button>
        </div>

        {/* Subscriber Input */}
        {activeTab === 'subscriber' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
            <h3 className="text-lg font-semibold mb-4">Subscription Verification</h3>
            <div className="flex space-x-4">
              <input
                type="text"
                value={subscriptionInput}
                onChange={handleSubscriptionInputChange}
                placeholder="Enter Subscription ID"
                className="text-gray-600 flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoComplete="off"
              />
            </div>
            
            {/* Show loading only when actually checking (after debounce) */}
            {isSubscriptionLoading && debouncedSubscriptionId && (
              <p className="mt-2 text-sm text-slate-600">Verifying subscription...</p>
            )}
            
            {/* Show error */}
            {error && !isSubscriptionLoading && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            
            {/* Show success */}
            {subscription && !isSubscriptionLoading && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-700">
                  Subscription verified for {subscription.userName}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {zones.map((zone) => (
            <ZoneCard 
              key={zone.id} 
              zone={zone}
              isSelected={selectedZone === zone.id}
              onSelect={setSelectedZone}
              isSelectable={isZoneSelectable}
            />
          ))}
        </div>

        {/* Action Button */}
        {selectedZone && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={handleCheckin}
              disabled={checkinMutation.isPending || (activeTab === 'subscriber' && !subscription)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {checkinMutation.isPending ? 'Processing...' : 'Confirm Check-in'}
            </button>
          </div>
        )}
      </div>

      {/* Gate Animation */}
      <GateAnimation 
        isOpen={showGateAnimation} 
        onAnimationComplete={handleGateAnimationComplete}
      />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={handleModalClose}
        ticket={currentTicket}
        zoneName={currentZoneName}
        gateName={getGateName(gateId)}
      />
    </div>
  );
}