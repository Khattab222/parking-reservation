import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Ticket {
  id: string;
  type: 'visitor' | 'subscriber';
  zoneId: string;
  gateId: string;
  checkinAt: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  zoneName: string;
  gateName: string;
}

export default function TicketModal({ isOpen, onClose, ticket, zoneName, gateName }: TicketModalProps) {
  if (!ticket) return null;

  const checkinDate = new Date(ticket.checkinAt);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="text-center">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Parking Ticket
                    </Dialog.Title>
                  </div>

                  <div className="mt-4 border-t border-b border-gray-200 py-4 text-gray-600">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ticket ID:</span>
                        <span className="font-medium">{ticket.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{ticket.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gate:</span>
                        <span className="font-medium">{gateName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Zone:</span>
                        <span className="font-medium">{zoneName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in Time:</span>
                        <span className="font-medium">{checkinDate.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                      onClick={() => window.print()}
                    >
                      <PrinterIcon className="w-5 h-5 mr-2" />
                      Print Ticket
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
