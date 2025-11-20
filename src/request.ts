import { Headers } from './headers.ts';
import type { Response } from './response.ts';
import { FetchWire, type Wire } from './wire.ts';

export interface Request<T> {
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
    headers: Headers,
    payload: X,
    wire: Wire<X, Y> = new FetchWire<X, Y>()
  ) {
    this.url = url;
    this.headers = headers;
    this.payload = payload;
    this.wire = wire;
  }

  send(): Promise<Response<Y>> {
    return this.wire.send(this.url, {
      method: 'POST',
      headers: this.headers,
      payload: this.payload
    });
  }
}
