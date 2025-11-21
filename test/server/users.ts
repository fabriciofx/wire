import { authorized } from './login.ts';

const USERS = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Bruno' }
];

export function usersGetAction(req: Request): Response {
  if (authorized(req)) {
    return Response.json(USERS, { status: 201 });
  }
  return Response.json('Unauthorized', { status: 401 });
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
