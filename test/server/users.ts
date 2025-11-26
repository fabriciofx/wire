import { authorized } from './login.ts';

type User = {
  id: number;
  name: string;
};

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
  if (!authorized(req)) {
    return Response.json('Unauthorized', { status: 401 });
  }
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

export async function usersChangeAction(req: Request): Promise<Response> {
  if (!authorized(req)) {
    return Response.json('Unauthorized', { status: 401 });
  }
  const match = /\/users\/(\d+)$/.exec(req.url);
  if (!match) {
    return Response.json('Bad request: URL invalid.', { status: 400 });
  }
  const id = Number(match[1]);
  const found = USERS.find((user) => user.id === id);
  if (!found) {
    return Response.json(`User with id ${id} not found.`, { status: 404 });
  }
  const editUser = (await req.json()) as User;
  found.name = editUser.name;
  const out = USERS.reduce(
    (str, user) => `${str} id: ${user.id}, name: ${user.name}`,
    ''
  );
  return Response.json(`User ${out} changed with success.`, {
    status: 200
  });
}
