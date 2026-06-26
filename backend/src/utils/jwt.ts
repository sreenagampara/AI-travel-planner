import jwt, { JwtHeader } from 'jsonwebtoken';
import { AuthPayload, Auth0Payload, UserPayload } from '../types/auth';
import { env } from '../config/env';

const getPemFromJwks = async (kid: string): Promise<string> => {
  const jwksUri = `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`;
  const res = await fetch(jwksUri);
  if (!res.ok) {
    throw new Error(`Unable to fetch JWKS: ${res.statusText}`);
  }
  const jwks = await res.json();
  const key = jwks.keys?.find((k: any) => k.kid === kid);
  if (!key || !key.x5c || !key.x5c.length) {
    throw new Error('Unable to find matching JWKS key.');
  }
  const cert = key.x5c[0];
  const formatted = cert.match(/.{1,64}/g)?.join('\n');
  return `-----BEGIN CERTIFICATE-----\n${formatted}\n-----END CERTIFICATE-----\n`;
};

const verifyAuth0Token = async (token: string): Promise<Auth0Payload> => {
  const decoded = jwt.decode(token, { complete: true }) as { header?: JwtHeader } | null;
  const kid = decoded?.header?.kid;
  if (!kid) throw new Error('Invalid token header.');
  if (!env.AUTH0_DOMAIN || !env.AUTH0_AUDIENCE) {
    throw new Error('Auth0 configuration is missing.');
  }
  const pem = await getPemFromJwks(kid);
  const payload = jwt.verify(token, pem, {
    algorithms: ['RS256'],
    audience: env.AUTH0_AUDIENCE,
    issuer: `https://${env.AUTH0_DOMAIN}/`,
  }) as Auth0Payload;
  return payload;
};

export const generateToken = (payload: UserPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not defined');
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = async (token: string): Promise<AuthPayload> => {
  const decoded = jwt.decode(token, { complete: true }) as { header?: JwtHeader } | null;
  const alg = decoded?.header?.alg;

  if (alg === 'RS256') {
    return verifyAuth0Token(token);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not defined');
  return jwt.verify(token, secret) as UserPayload;
};
