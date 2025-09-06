import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';


interface Gate {
  id: string;
  name: string;
  zoneIds: string[];
  location: string;
}

// Define the state interface
interface GatesState {
  gates: Gate[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

// Initial state
const initialState: GatesState = {
  gates: [],
  loading: 'idle',
  error: null,
};

// Create async thunk for fetching gates
export const fetchGates = createAsyncThunk(
  'gates/fetchGates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/master/gates`);
      console.log({data: response.data})
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('An error occurred while fetching gates');
    }
  }
);

// Create the gates slice
const gatesSlice = createSlice({
  name: 'gates',
  initialState,
  reducers: {
  
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGates.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchGates.fulfilled, (state, action: PayloadAction<Gate[]>) => {
        state.loading = 'succeeded';
        state.gates = action.payload;
      })
      .addCase(fetchGates.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});





// Export reducer
export default gatesSlice.reducer;
