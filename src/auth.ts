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
  private readonly authtenticate: Content<AuthTokens>;

  constructor(request: Request, authenticate: Content<AuthTokens>) {
    this.origin = request;
    this.authtenticate = authenticate;
  }

  with(header: Header): Request {
    return this.origin.with(header);
  }

  async send(): Promise<Response> {
    return await this.with(new ContentType('application/json'))
      .with(new BearerAuth((await this.authtenticate.content()).access))
      .send();
  }
}

export class AuthWithToken implements Request {
  private readonly origin: Request;
  private readonly token: string;

  constructor(request: Request, token: string) {
    this.origin = request;
    this.token = token;
  }

  with(header: Header): Request {
    return this.origin.with(header);
  }

  async send(): Promise<Response> {
    return await this.with(new ContentType('application/json'))
      .with(new XapiAuth(this.token))
      .send();
  }
}
