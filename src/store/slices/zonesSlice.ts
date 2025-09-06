
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { Zone } from '@/types';





interface GateDetailsState {
  zones: Zone[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
 
}

const initialState: GateDetailsState = {
  zones: [],
  loading: 'idle',
  error: null,

};

// Fetch zones for a gate
export const fetchZones = createAsyncThunk(
  'gateDetails/fetchZones',
  async (gateId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/master/zones?gateId=${gateId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue('An error occurred while fetching zones');
    }
  }
);



// Check in (visitor or subscriber)
export const checkin = createAsyncThunk(
  'gateDetails/checkin',
  async (data: { gateId: string; zoneId: string; type: 'visitor' | 'subscriber'; subscriptionId?: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets/checkin`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || error.message);
      }
      return rejectWithValue('An error occurred during check-in');
    }
  }
);

const gateDetailsSlice = createSlice({
  name: 'gateDetails',
  initialState,
  reducers: {
  
  },
  extraReducers: (builder) => {
    builder
      // Fetch zones
      .addCase(fetchZones.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchZones.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.zones = action.payload;
      })
      .addCase(fetchZones.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      })
    
  },
});


export default gateDetailsSlice.reducer;