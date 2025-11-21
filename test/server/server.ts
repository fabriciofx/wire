import { loginAction } from './login.ts';
import { usersAction, usersDeleteAction } from './users.ts';

export interface Server {
  start(): void;
  stop(): void;
}

export class FakeHttpServer implements Server {
  private readonly server: Deno.HttpServer<Deno.NetAddr>;

  constructor(port: number) {
    this.server = Deno.serve({ onListen() {}, port: port }, actions);
  }

  start(): void {}

  stop(): void {
    this.server.shutdown();
  }
}

async function actions(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (req.method === 'POST' && url.pathname === '/login') {
    return await loginAction(req);
  } else if (req.method === 'GET' && url.pathname === '/users') {
    return await usersAction(req);
  } else if (req.method === 'DELETE' && /^\/users\/\d+$/.test(url.pathname)) {
    return usersDeleteAction(req);
  }
  if (url.pathname !== '/') {
    return new Response('Endpoint not found.', { status: 404 });
  }
  return new Response(
    `Request to ${url.pathname} using ${req.method} method not found.`,
    { status: 200 }
  );
}
