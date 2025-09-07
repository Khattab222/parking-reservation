'use client';
import AdminLayout from '@/components/AdminLayout';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import ZoneControl from '@/components/admin/ZoneControl';
import CategoryRates from '@/components/admin/CategoryRates';
import RushHours from '@/components/admin/RushHours';
import Vacations from '@/components/admin/Vacations';



export default function ControlPanelPage() {
  
  const { data: zones = [] } = useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/master/zones`);

      return response.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/master/categories`);
            console.log({cat:response.data});
      return response.data;
    },
  });

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Control Panel</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZoneControl zones={zones} />
          <CategoryRates categories={categories} />
          <RushHours />
          <Vacations />
        </div>
      </div>
    </AdminLayout>
  );
}