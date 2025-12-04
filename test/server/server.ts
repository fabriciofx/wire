import { getRandomPort } from 'get-port-please';
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
  start(): Promise<number>;
  stop(): Promise<void>;
  port(): Promise<number>;
}

export class FakeHttpServer implements Server {
  private readonly server: Func<number, Deno.HttpServer<Deno.NetAddr>>;
  private readonly tokenTime: number;
  private readonly routes: Route[];
  private readonly prt: Func<boolean, Promise<number>>;
  private readonly dump: boolean;

  constructor(tokenTime: number = 15, dump: boolean = false) {
    this.prt = new StickyFunc((_: boolean) => getRandomPort());
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

  async start(): Promise<number> {
    const prt = await this.port();
    this.server.apply(prt);
    return prt;
  }

  async stop(): Promise<void> {
    const prt = await this.port();
    this.server.apply(prt).shutdown();
  }

  async port(): Promise<number> {
    return await this.prt.apply(true);
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
