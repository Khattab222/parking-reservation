export const API_BASE_URL = 'http://localhost:3000/api/v1';


export const API_ENDPOINTS = {
    gates: `${API_BASE_URL}/master/gates`,
    zones: `${API_BASE_URL}/master/zones`,
    
} as const;
