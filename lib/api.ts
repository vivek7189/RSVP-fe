import { RSVP, CreateRSVPResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3013/api';

export const createRSVP = async (name: string, email: string): Promise<CreateRSVPResponse> => {
  const response = await fetch(`${API_URL}/rsvps`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create RSVP');
  }

  return response.json();
};

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const getRSVPs = async (page: number = 1, limit: number = 20): Promise<PaginatedResponse<RSVP>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_URL}/rsvps?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch RSVPs');
  }

  return response.json();
};

export const deleteRSVP = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/rsvps/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete RSVP');
  }
};

export const verifyRSVPToken = async (token: string): Promise<RSVP> => {
  const response = await fetch(`${API_URL}/rsvps/verify-token`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to verify token');
  }

  return response.json();
};

export const cancelRSVPByToken = async (token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/rsvps/cancel-by-token`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to cancel RSVP');
  }
};
