import { ContentType, type Header, XapiAuth } from './header.ts';
import { Headers } from './headers.ts';
import type { Response } from './response.ts';
import { FetchWire, type Wire } from './wire.ts';

export interface Request<T> {
  with(header: Header): void;
  send(): Promise<Response<T>>;
}

export class Get<T> implements Request<T> {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly wire: Wire<T, T>;

  constructor(
    url: string,
    headers: Headers = new Headers(),
    wire: Wire<T, T> = new FetchWire<T, T>()
  ) {
    this.url = url;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): void {
    this.headers.add(header);
  }

  send(): Promise<Response<T>> {
    return this.wire.send(this.url, {
      method: 'GET',
      headers: this.headers
    });
  }
}

export class Post<X, Y> implements Request<Y> {
  private readonly url: string;
  private readonly payload: X;
  private readonly headers: Headers;
  private readonly wire: Wire<X, Y>;

  constructor(
    url: string,
    payload: X,
    headers: Headers = new Headers(),
    wire: Wire<X, Y> = new FetchWire<X, Y>()
  ) {
    this.url = url;
    this.payload = payload;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): void {
    this.headers.add(header);
  }

  send(): Promise<Response<Y>> {
    return this.wire.send(this.url, {
      method: 'POST',
      headers: this.headers,
      payload: this.payload
    });
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
