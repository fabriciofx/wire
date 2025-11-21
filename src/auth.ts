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

export class Authenticated<T> implements Request<T> {
  private readonly origin: Request<T>;
  private readonly tokens: AuthTokens;

  constructor(request: Request<T>, tokens: AuthTokens) {
    this.origin = request;
    this.tokens = tokens;
  }

  with(header: Header): void {
    this.origin.with(header);
  }

  send(): Promise<Response<T>> {
    this.with(new ContentType('application/json'));
    this.with(new BearerAuth(this.tokens.access));
    return this.origin.send();
  }
}

export class AuthWithToken<T> implements Request<T> {
  private readonly origin: Request<T>;
  private readonly token: string;

  constructor(request: Request<T>, token: string) {
    this.origin = request;
    this.token = token;
  }

  with(header: Header): void {
    this.origin.with(header);
  }

  send(): Promise<Response<T>> {
    this.with(new ContentType('application/json'));
    this.with(new XapiAuth(this.token));
    return this.origin.send();
  }
}
