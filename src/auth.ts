import type { Content } from './content.ts';
import { BearerAuth, ContentType, type Header, XapiAuth } from './header.ts';
import type { Request } from './request.ts';
import type { Response } from './response.ts';

export type Credentials = {
  username: string;
  password: string;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export class Authenticated implements Request {
  private readonly origin: Request;
  private readonly tokens: Content<AuthTokens>;

  constructor(request: Request, tokens: Content<AuthTokens>) {
    this.origin = request;
    this.tokens = tokens;
  }

  with(header: Header): void {
    this.origin.with(header);
  }

  async send(): Promise<Response> {
    this.with(new ContentType('application/json'));
    this.with(new BearerAuth((await this.tokens.content()).access));
    return await this.origin.send();
  }
}

export class AuthWithToken implements Request {
  private readonly origin: Request;
  private readonly token: string;

  constructor(request: Request, token: string) {
    this.origin = request;
    this.token = token;
  }

  with(header: Header): void {
    this.origin.with(header);
  }

  async send(): Promise<Response> {
    this.with(new ContentType('application/json'));
    this.with(new XapiAuth(this.token));
    return await this.origin.send();
  }
}
