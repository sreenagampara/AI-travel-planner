export interface UserPayload {
  id: string;
  email: string;
}

export interface Auth0Payload {
  sub: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  azp?: string;
  aud?: string | string[];
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export type AuthPayload = UserPayload | Auth0Payload;
