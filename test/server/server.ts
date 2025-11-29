import { type Func, StickyFunc } from '../../src/func.ts';
import { loginAction, refreshAction } from './login.ts';
import { uploadAction } from './upload.ts';
import {
  usersChangeAction,
  usersDeleteAction,
  usersGetAction
} from './users.ts';

type RouteAction = (req: Request, match: URLPatternResult) => Promise<Response>;

interface Route {
  method: string;
  pattern: URLPattern;
  action: RouteAction;
}

export interface Server {
  start(): void;
  stop(): void;
}

export class FakeHttpServer implements Server {
  private readonly server: Func<number, Deno.HttpServer<Deno.NetAddr>>;
  private readonly tokenTime: number;
  private readonly routes: Route[];
  private readonly port: number;
  private readonly dump: boolean;

  constructor(port: number, tokenTime: number = 15, dump: boolean = false) {
    this.port = port;
    this.tokenTime = tokenTime;
    this.dump = dump;
    this.server = new StickyFunc((port: number) =>
      Deno.serve({ onListen() {}, port: port }, (req) => this.actions(req))
    );
    this.routes = [
      {
        method: 'POST',
        pattern: new URLPattern({ pathname: '/login' }),
        action: (req) => loginAction(req, this.tokenTime)
      },
      {
        method: 'POST',
        pattern: new URLPattern({ pathname: '/refresh' }),
        action: (req) => refreshAction(req)
      },
      {
        method: 'GET',
        pattern: new URLPattern({ pathname: '/users' }),
        action: (req) => usersGetAction(req)
      },
      {
        method: 'DELETE',
        pattern: new URLPattern({ pathname: '/users/:id' }),
        action: (req, match) => {
          return usersDeleteAction(req, match);
        }
      },
      {
        method: 'PUT',
        pattern: new URLPattern({ pathname: '/users/:id' }),
        action: (req, match) => usersChangeAction(req, match)
      },
      {
        method: 'POST',
        pattern: new URLPattern({ pathname: '/upload' }),
        action: (req) => uploadAction(req, this.dump)
      }
    ];
  }

  start(): void {
    this.server.apply(this.port);
  }

  stop(): void {
    this.server.apply(this.port).shutdown();
  }

  private async actions(req: Request): Promise<Response> {
    for (const route of this.routes) {
      if (req.method === route.method) {
        const match = route.pattern.exec(req.url);
        if (match) {
          return await route.action(req, match);
        }
      }
    }
    return Response.json('Endpoint not found.', { status: 404 });
  }
}
