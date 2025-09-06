export interface Zone {
  id: string;
  name: string;
  categoryId: string;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
  specialActive?: boolean;
}

export interface Ticket {
  id: string;
  type: 'visitor' | 'subscriber';
  zoneId: string;
  gateId: string;
  checkinAt: string;
}

export interface TicketResponse {
  ticket: Ticket;
  zoneState: Zone;
}

export interface Subscription {
  id: string;
  userName: string;
  active: boolean;
  categories: string[];
  cars: {
    plate: string;
    brand: string;
    model: string;
    color: string;
  }[];
  startsAt: string;
  expiresAt: string;
  currentCheckins: {
    ticketId: string;
    zoneId: string;
    checkinAt: string;
  }[];
}

export interface TicketBreakdown {
  from: string;
  to: string;
  hours: number;
  rateMode: 'normal' | 'special';
  rate: number;
  amount: number;
}

export interface CheckoutResponse {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: TicketBreakdown[];
  amount: number;
  zoneState: {
    availableForSubscribers: number;
availableForVisitors
: number;
categoryId:string
free:number
gateIds
: string[]
id
: string
name
: 
string
occupied
: 
number
open
: 
boolean
rateNormal
: 
number
rateSpecial
: 
number
reserved
: 
number
totalSlots
: 
number
  };
  subscriptionId?: string;
}