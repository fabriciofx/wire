import { authorized } from './login.ts';

const USERS = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Bruno' }
];

export function usersAction(req: Request): Promise<Response> {
  if (authorized(req)) {
    return new Promise<Response>((resolve) =>
      resolve(new Response(JSON.stringify(USERS), { status: 201 }))
    );
  } else {
    return new Promise<Response>((resolve) =>
      resolve(new Response('Unauthorized', { status: 401 }))
    );
  }
}
