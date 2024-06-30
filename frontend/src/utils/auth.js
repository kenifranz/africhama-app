import axios from 'axios';

// Set the AUTH_TOKEN_KEY to a unique string for your application
const AUTH_TOKEN_KEY = 'africhama_auth_token';

// Set the base URL for your API
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Function to set the authentication token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Function to get the authentication token
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

// Function to check if the user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// Function to login
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
    const { token, user } = response.data;
    setAuthToken(token);
    return user;
  } catch (error) {
    throw error.response.data;
  }
};

// Function to register
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    const { token, user } = response.data;
    setAuthToken(token);
    return user;
  } catch (error) {
    throw error.response.data;
  }
};

// Function to logout
export const logout = () => {
  setAuthToken(null);
};

// Function to get the current user's data
export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Function to update the user's profile
export const updateProfile = async (userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/auth/profile`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Function to check if the token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  return decodedToken.exp * 1000 < Date.now();
};

// Function to refresh the token
export const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`);
    const { token } = response.data;
    setAuthToken(token);
    return token;
  } catch (error) {
    throw error.response.data;
  }
};

// Axios interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return axios(originalRequest);
      } catch (refreshError) {
        logout();
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);