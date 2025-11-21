import * as jwt from 'std/djwt';
import { create as createJwt } from 'std/djwt';
import type { AuthTokens, Credentials } from '../../src/auth.ts';

const SECRET_KEY = await crypto.subtle.generateKey(
  { name: 'HMAC', hash: 'SHA-512' },
  true,
  ['sign', 'verify']
);
const AUTH_TOKENS: AuthTokens[] = [];

async function token(key: CryptoKey, username: string, hours: number) {
  const payload = {
    iss: 'deno-server',
    exp: jwt.getNumericDate(new Date(Date.now() + 60 * 60 * 1000 * hours)),
    userId: Date.now(),
    username: username
  };
  return await createJwt({ alg: 'HS512', typ: 'JWT' }, payload, key);
}

async function login(credentials: Credentials): Promise<AuthTokens> {
  if (credentials.username === 'admin' && credentials.password === '12345678') {
    const tokens: AuthTokens = {
      access: await token(SECRET_KEY, credentials.username, 1),
      refresh: await token(SECRET_KEY, credentials.username, 24)
    };
    AUTH_TOKENS.push(tokens);
    return tokens;
  }
  throw new Error('Invalid credentials.');
}

export async function loginAction(req: Request): Promise<Response> {
  try {
    const credentials = (await req.json()) as Credentials;
    const tokens = await login(credentials);
    return Response.json(tokens, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 400 });
  }
}

export function authorized(req: Request): boolean {
  if (req.headers.has('Authorization')) {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (AUTH_TOKENS.some((tokens) => tokens.access === token)) {
      return true;
    }
  }
  return false;
}
