// API client for Cashplan.io backend

import axios from 'axios';
import type { Plan, Event, ChartDataPoint, User } from '../types';

const apiClient = axios.create({
  baseURL: '/',
  withCredentials: true,
});

// Plans
export const getPlans = async (): Promise<Plan[]> => {
  const response = await apiClient.get<{ plans: Plan[] }>('/api/plans');
  return response.data.plans;
};

export const createPlan = async (name: string, startDate: string): Promise<Plan> => {
  const response = await apiClient.post<{ plan: Plan }>('/api/plans', { name, startDate });
  return response.data.plan;
};

// Events
export const getEvents = async (planId: number): Promise<Event[]> => {
  const response = await apiClient.get<{ events: Event[] }>(`/api/plans/${planId}/events`);
  return response.data.events;
};

export const createEvent = async (planId: number, event: Partial<Event>): Promise<Event> => {
  const response = await apiClient.post<{ event: Event }>(`/api/plans/${planId}/events`, event);
  return response.data.event;
};

export const updateEvent = async (planId: number, eventId: number, event: Partial<Event>): Promise<Event> => {
  const response = await apiClient.put<{ event: Event }>(`/api/plans/${planId}/events/${eventId}`, event);
  return response.data.event;
};

export const deleteEvent = async (planId: number, eventId: number): Promise<void> => {
  await apiClient.delete(`/api/plans/${planId}/events/${eventId}`);
};

// Chart data
export const getChartData = async (planId: number, rangeYears: number = 10): Promise<ChartDataPoint[]> => {
  const response = await apiClient.get<{ chartData: ChartDataPoint[] }>(`/api/plans/${planId}/chart-data`, {
    params: { rangeYears },
  });
  return response.data.chartData;
};

// User
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<{ user: User }>('/auth/user');
    return response.data.user;
  } catch (error) {
    return null;
  }
};

// Auth
export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

