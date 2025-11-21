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

export function usersDeleteAction(req: Request): Response {
  const match = /\/users\/(\d+)$/.exec(req.url);
  if (!match) {
    return Response.json('Bad request: URL invalid.', { status: 400 });
  }
  const id = Number(match[1]);
  const found = USERS.find((user) => user.id === id);
  if (!found) {
    return Response.json(`User with id ${id} not found.`, { status: 404 });
  }
  return Response.json(`User ${found.name} deleted with success.`, {
    status: 200
  });
}
