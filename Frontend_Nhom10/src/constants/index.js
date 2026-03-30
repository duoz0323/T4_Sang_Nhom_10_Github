// Constants - application-wide constants

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  JOBS: '/jobs',
  ADMIN: '/admin',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CANDIDATE: 'CANDIDATE',
  COMPANY: 'COMPANY',
};

// Token expiration time (seconds)
export const TOKEN_EXPIRATION = 300; // 5 minutes
