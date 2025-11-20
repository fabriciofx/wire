import { ContentType, type Header, XapiAuth } from './header.ts';
import type { Request } from './request.ts';
import type { Response } from './response.ts';

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
