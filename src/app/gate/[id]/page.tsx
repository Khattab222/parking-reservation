'use client';
import { UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ZoneCard from '@/components/ZoneCard';
import GateHeader from '@/components/GateHeader';
import TicketModal from '@/components/TicketModal';
import GateAnimation from '@/components/GateAnimation';

import UseGateId from './UseGateId';


const queryClient = new QueryClient();

export default function PageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <GatePage />
    </QueryClientProvider>
  );
}

function GatePage() {
const { isLoading, zones, activeTab, setActiveTab,subscription, debouncedSubscriptionId,selectedZone, setSelectedZone, subscriptionInput, handleSubscriptionInputChange, isConnected, getGateName, gateId, isZoneSelectable, handleCheckin, showGateAnimation, handleGateAnimationComplete, showTicketModal, handleModalClose, currentTicket, currentZoneName, error, isSubscriptionLoading,checkinMutation } = UseGateId();

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