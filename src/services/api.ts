import { Subscription, Ticket, TicketResponse, Zone } from '@/types';

const BASE_URL = 'http://localhost:3000/api/v1';

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
}

export async function getZonesByGateId(gateId: string): Promise<Zone[]> {
  return fetchJson<Zone[]>(`/master/zones?gateId=${gateId}`);
}

export async function verifySubscription(id: string): Promise<Subscription> {
  
  return fetchJson<Subscription>(`/subscriptions/${id}`);

}

export async function createCheckin(data: {
  gateId: string;
  zoneId: string;
  type: 'visitor' | 'subscriber';
  subscriptionId?: string;
}): Promise<TicketResponse> {
  return fetchJson<TicketResponse>('/tickets/checkin', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
