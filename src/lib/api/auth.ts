/**
 * Authentication API functions
 */

import { apiClient } from '../api-client';

export interface User {
  _id: string;
  email: string;
  full_name?: string;
  company?: string;
  role: 'user' | 'admin';
  email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  companyName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up with email and password
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/signup', data);
  
  // Store token in API client
  apiClient.setAuthToken(response.token);
  
  return response;
}

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/signin', data);
  
  // Store token in API client
  apiClient.setAuthToken(response.token);
  
  return response;
}

/**
 * Sign out (clear token)
 */
export async function signOut(): Promise<void> {
  try {
    await apiClient.post('/auth/signout');
  } finally {
    // Always clear token even if API call fails
    apiClient.setAuthToken(null);
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<{ user: User }>('/auth/me');
  return response.user;
}

/**
 * Check if user is authenticated (has valid token)
 */
export async function checkAuth(): Promise<User | null> {
  const token = apiClient.getAuthToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    // Token is invalid or expired
    apiClient.setAuthToken(null);
    return null;
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ message: string; user: User }> {
  const response = await apiClient.get<{ message: string; user: User }>(`/auth/verify-email/${token}`);
  return response;
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
}
