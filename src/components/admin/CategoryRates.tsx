import { API_BASE_URL } from "@/config/api";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";



function CategoryRates({ categories }: { categories: any[] }) {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [rates, setRates] = useState({ normal: 0, special: 0 });
  const queryClient = useQueryClient();

  const updateRatesMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.put(`${API_BASE_URL}/admin/categories/${selectedCategory.id}`, {
        rateNormal: rates.normal,
        rateSpecial: rates.special,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'] as any);
      setSelectedCategory(null);
    },
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
        Category Rates
      </h2>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{category.name}</p>
              <p className="text-sm text-gray-500">
                Normal: ${category.rateNormal}/hr | Special: ${category.rateSpecial}/hr
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(category);
                setRates({ normal: category.rateNormal, special: category.rateSpecial });
              }}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Edit Rates
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Update Rates for {selectedCategory.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Normal Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rates.normal}
                  onChange={(e) => setRates({ ...rates, normal: parseFloat(e.target.value) })}
                  className="mt-1 text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Special Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.01"
                  value={rates.special}
                  onChange={(e) => setRates({ ...rates, special: parseFloat(e.target.value) })}
                  className="mt-1 text-gray-600 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateRatesMutation.mutate()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Update Rates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CategoryRates;