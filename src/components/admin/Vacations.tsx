import { API_BASE_URL } from "@/config/api";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";


function Vacations() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [vacationData, setVacationData] = useState({
    name: '',
    from: '',
    to: '',
  
  });

  const addVacationMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${API_BASE_URL}/admin/vacations`, vacationData);
      console.log({vac:response.data})
      return response.data;
    },
    onSuccess: () => {
      setShowAddModal(false);
      setVacationData({
        name: '',
        from: '',
        to: '',
      });
    },
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Vacations
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Vacation
        </button>
      </div>

      {/* Add Vacation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Vacation Period</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              addVacationMutation.mutate();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={vacationData.name}
                    onChange={(e) => setVacationData({ ...vacationData, name: e.target.value })}
                    className="mt-1 text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={vacationData.from}
                      onChange={(e) => setVacationData({ ...vacationData, from: e.target.value })}
                      className="mt-1 text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={vacationData.to}
                      onChange={(e) => setVacationData({ ...vacationData, to: e.target.value })}
                      className="mt-1 text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
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
                  {
                    addVacationMutation.isPending ? 'Adding...' :'  Add Vacation'
                  }
                
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Vacations;