
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { CheckoutResponse, Zone } from '@/types';
import { wsService } from '@/services/ws';
import { useCallback, useState } from 'react';

const UseCheckPoint = () => {

  const queryClient = new QueryClient();


async function checkoutTicket(data: { ticketId: string; forceConvertToVisitor?: boolean }) {
  const response = await axios.post(`${API_BASE_URL}/tickets/checkout`, data);
  return response.data;
}

async function fetchSubscription(subscriptionId: string) {
  const response = await axios.get(`${API_BASE_URL}/subscriptions/${subscriptionId}`);
  return response.data;
}

  const [ticketId, setTicketId] = useState('');
  const [scannedTicketId, setScannedTicketId] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse| null>(null);

  // Queries

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


  return {
    ticketId,
    scannedTicketId,
    showConfirmation,
    checkoutData,
    subscriptionQuery,
    checkoutMutation,
    handleScanTicket,
    handleConvertToVisitor,
    handleComplete,
    formatDateTime,
    formatDuration,
    setTicketId,
    setScannedTicketId,
    setCheckoutData
  };
}

export default UseCheckPoint