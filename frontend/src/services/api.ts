// API client for Cashplan.io backend

import axios from 'axios';
import type { Plan, Event, ChartDataPoint, User } from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Plans
export const getPlans = async (): Promise<Plan[]> => {
  const response = await apiClient.get<Plan[]>('/plans');
  return response.data;
};

export const createPlan = async (name: string): Promise<Plan> => {
  const response = await apiClient.post<Plan>('/plans', { name });
  return response.data;
};

// Events
export const getEvents = async (planId: number): Promise<Event[]> => {
  const response = await apiClient.get<Event[]>(`/plans/${planId}/events`);
  return response.data;
};

export const createEvent = async (planId: number, event: Partial<Event>): Promise<Event> => {
  const response = await apiClient.post<Event>(`/plans/${planId}/events`, event);
  return response.data;
};

export const updateEvent = async (planId: number, eventId: number, event: Partial<Event>): Promise<Event> => {
  const response = await apiClient.put<Event>(`/plans/${planId}/events/${eventId}`, event);
  return response.data;
};

export const deleteEvent = async (planId: number, eventId: number): Promise<void> => {
  await apiClient.delete(`/plans/${planId}/events/${eventId}`);
};

// Chart data
export const getChartData = async (planId: number, rangeYears: number = 10): Promise<ChartDataPoint[]> => {
  const response = await apiClient.get<ChartDataPoint[]>(`/plans/${planId}/chart-data`, {
    params: { rangeYears },
  });
  return response.data;
};

// User
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<User>('/user');
    return response.data;
  } catch (error) {
    return null;
  }
};

// Auth
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

