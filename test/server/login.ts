import * as jwt from '@zaubrik/djwt';
import { create, verify } from '@zaubrik/djwt';
import type { AuthTokens, Credentials } from '../../src/auth.ts';

const SECRET_KEY = await crypto.subtle.generateKey(
  { name: 'HMAC', hash: 'SHA-512' },
  true,
  ['sign', 'verify']
);

async function token(
  key: CryptoKey,
  role: string,
  typ: string,
  minutes: number
) {
  const payload: jwt.Payload = {
    iss: 'fake-server',
    sub: String(Date.now()),
    exp: jwt.getNumericDate(60 * minutes),
    iat: jwt.getNumericDate(0),
    role: role,
    type: typ
  };
  return await create({ alg: 'HS512', typ: 'JWT' }, payload, key);
}

async function refreshAccessToken(
  key: CryptoKey,
  minutes: number,
  refresh: string
) {
  const payload = await verify(refresh, key);
  const newPayload: jwt.Payload = {
    iss: payload.iss,
    sub: payload.sub,
    exp: jwt.getNumericDate(60 * minutes),
    iat: jwt.getNumericDate(0),
    role: payload.role,
    type: 'access'
  };
  return await create({ alg: 'HS512', typ: 'JWT' }, newPayload, key);
}

async function login(
  credentials: Credentials,
  tokenTime: number
): Promise<AuthTokens> {
  if (credentials.username === 'admin' && credentials.password === '12345678') {
    const tokens: AuthTokens = {
      access: await token(SECRET_KEY, 'user', 'access', tokenTime),
      refresh: await token(SECRET_KEY, 'user', 'refresh', 60 * 24)
    };
    return tokens;
  }
  throw new Error('Invalid credentials.');
}

export async function authorized(req: Request): Promise<boolean> {
  if (req.headers.has('Authorization')) {
    const token = req.headers.get('Authorization')?.split(' ')[1] ?? '';
    try {
      await verify(token, SECRET_KEY);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function loginAction(
  req: Request,
  tokenTime: number
): Promise<Response> {
  try {
    const credentials = (await req.json()) as Credentials;
    const tokens = await login(credentials, tokenTime);
    return Response.json(tokens, { status: 200 });
  } catch (error) {
    return Response.json(error, { status: 400 });
  }
}

export async function refreshAction(req: Request): Promise<Response> {
  const token = await new Response(req.body).json();
  try {
    const access = await refreshAccessToken(SECRET_KEY, 15, token.refresh);
    return Response.json({ access: access }, { status: 200 });
  } catch {
    return Response.json('Unauthorized', { status: 401 });
  }
}
