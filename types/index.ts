export interface RSVP {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface CreateRSVPResponse {
  rsvp: RSVP;
  token: string;
}

export interface APIError {
  error: string;
  errors?: Array<{ msg: string; path: string }>;
}
