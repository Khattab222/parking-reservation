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

const UseGateId = () => {
const queryClient = new QueryClient();
    const params = useParams();
    const gateId = params.id as string;
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



  return{ isLoading, zones, activeTab, setActiveTab, selectedZone, setSelectedZone, subscriptionInput, handleSubscriptionInputChange, isConnected, getGateName, gateId, isZoneSelectable, handleCheckin, showGateAnimation, handleGateAnimationComplete, showTicketModal, handleModalClose, currentTicket, subscription,debouncedSubscriptionId,currentZoneName, error, isSubscriptionLoading,checkinMutation}
}

export default UseGateId