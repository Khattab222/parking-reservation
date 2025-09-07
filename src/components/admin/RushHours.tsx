import { API_BASE_URL } from "@/config/api";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";



function RushHours() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [rushHourData, setRushHourData] = useState({
    from: '',
    to: '',
    weekDay:0,
  });

  const addRushHourMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${API_BASE_URL}/admin/rush-hours`, rushHourData);
      console.log({rush:response.data})
      return response.data;
    },
    onSuccess: () => {
      setShowAddModal(false);
      setRushHourData({
        from: '',
        to: '',
        weekDay: 0,
      });
    },
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2" />
          Rush Hours
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Rush Hour
        </button>
      </div>

      {/* Add Rush Hour Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Rush Hour</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              addRushHourMutation.mutate();
            }}>
              <div className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      type="time"
                      value={rushHourData.from}
                      onChange={(e) => setRushHourData({ ...rushHourData, from: e.target.value })}
                      className="mt-1 w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      type="time"
                      value={rushHourData.to}
                      onChange={(e) => setRushHourData({ ...rushHourData, to: e.target.value })}
                      className="mt-1 w-full text-gray-600 px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                  <div className="space-y-2 text-gray-600">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          // checked={rushHourData.weekDay===index}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRushHourData({
                                ...rushHourData,
                              
                                weekDay: rushHourData.weekDay+1,
                              });
                            } else {
                              setRushHourData({
                                ...rushHourData,
                                weekDay: rushHourData.weekDay-1,
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {addRushHourMutation.isPending ? 'Adding...' :'  Add Rush Hour'}
                
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default RushHours;