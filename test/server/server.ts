import { loginAction, refreshAction } from './login.ts';
import { uploadAction } from './upload.ts';
import {
  usersChangeAction,
  usersDeleteAction,
  usersGetAction
} from './users.ts';

export interface Server {
  start(): void;
  stop(): void;
}

export class FakeHttpServer implements Server {
  private readonly server: Deno.HttpServer<Deno.NetAddr>;
  private readonly tokenTime: number;

  constructor(port: number, tokenTime: number = 15) {
    this.tokenTime = tokenTime;
    this.server = Deno.serve({ onListen() {}, port: port }, (req) =>
      this.actions(req)
    );
  }

  start(): void {}

  stop(): void {
    this.server.shutdown();
  }

  private async actions(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (req.method === 'POST' && url.pathname === '/login') {
      return await loginAction(req, this.tokenTime);
    } else if (req.method === 'POST' && url.pathname === '/refresh') {
      return await refreshAction(req);
    } else if (req.method === 'GET' && url.pathname === '/users') {
      return await usersGetAction(req);
    } else if (req.method === 'DELETE' && /^\/users\/\d+$/.test(url.pathname)) {
      return await usersDeleteAction(req);
    } else if (req.method === 'PUT' && /^\/users\/\d+$/.test(url.pathname)) {
      return await usersChangeAction(req);
    } else if (req.method === 'POST' && '/upload') {
      return await uploadAction(req);
    }
    if (url.pathname !== '/') {
      return Response.json('Endpoint not found.', { status: 404 });
    }
    return Response.json(
      `Request to ${url.pathname} using ${req.method} method not found.`,
      { status: 200 }
    );
  }
}
