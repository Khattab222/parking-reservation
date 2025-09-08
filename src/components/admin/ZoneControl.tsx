import { API_BASE_URL } from "@/config/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  LockOpenIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { wsService } from "@/services/ws";
import { useEffect } from "react";



export default function ZoneControl({ zones }: { zones: any[] }) {
  const queryClient = useQueryClient();
  useEffect(() => {
    wsService.onAdminUpdate((update) => {
      console.log('Admin update received in ZoneControl:', update);
      
      // If the update is about zones, invalidate our queries
      if (update.targetType === 'zone') {
        queryClient.invalidateQueries(['zones'] as any);
        queryClient.invalidateQueries(['parking-state'] as any);
      }
    });
  }, [queryClient]);
  
 const toggleZoneMutation = useMutation({
    mutationFn: async ({ zoneId, open }: { zoneId: string; open: boolean }) => {
      const response = await axios.put(`${API_BASE_URL}/admin/zones/${zoneId}/open`, { open });
      console.log('Zone toggle response:', response.data);

      
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['zones'] as any);
      queryClient.invalidateQueries(['parking-state'] as any);
      
      // Optionally show a success notification
      console.log(`Zone ${variables.zoneId} ${variables.open ? 'opened' : 'closed'} successfully`);
    },
    onError: (error: any, variables) => {
      // Handle errors
      console.error('Failed to toggle zone:', error);
      alert(`Failed to ${variables.open ? 'open' : 'close'} zone: ${error.response?.data?.message || error.message}`);
    }
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Zone Control</h2>
      <div className="space-y-3">
        {zones.map((zone) => (
          <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{zone.name}</p>
              <p className="text-sm text-gray-500">{zone.categoryId}</p>
            </div>
            <button
              onClick={() => toggleZoneMutation.mutate({ zoneId: zone.id, open: !zone.open })}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                zone.open
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {zone.open ? (
                <>
                  <LockClosedIcon className="h-4 w-4 mr-2" />
                  Close Zone
                </>
              ) : (
                <>
                  <LockOpenIcon className="h-4 w-4 mr-2" />
                  Open Zone
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}