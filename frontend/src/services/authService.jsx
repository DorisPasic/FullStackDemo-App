import axios from 'axios';

const API_URL = 'http://localhost:3000/user';

// Configure axios to include credentials (cookies)
axios.defaults.withCredentials = true;

// Register user
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/new`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await axios.get(`${API_URL}/logout`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_URL}/verify`,  { withCredentials: true });
    console.log(response);
    
    return response.data;
  } catch (error) {
    console.log(error.message);
    
    throw error;
  }
};
