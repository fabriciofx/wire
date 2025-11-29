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
  private readonly server: Deno.HttpServer<Deno.NetAddr>;
  private readonly tokenTime: number;
  private readonly routes: Route[];

  constructor(port: number, tokenTime: number = 15) {
    this.tokenTime = tokenTime;
    this.server = Deno.serve({ onListen() {}, port: port }, (req) =>
      this.actions(req)
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
        action: (req) => uploadAction(req)
      }
    ];
  }

  start(): void {}

  stop(): void {
    this.server.shutdown();
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
