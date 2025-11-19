import { Headers } from './headers.ts';
import type { Response } from './response.ts';
import { FetchWire, type Wire } from './wire.ts';

export interface Request<T> {
  send(): Promise<Response<T>>;
}

export class Get<T> implements Request<T> {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly wire: Wire<T>;

  constructor(
    url: string,
    headers: Headers = new Headers(),
    wire: Wire<T> = new FetchWire<T>()
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

export class Post<T> implements Request<T> {
  private readonly url: string;
  private readonly payload: T;
  private readonly headers: Headers;
  private readonly wire: Wire<T>;

  constructor(
    url: string,
    headers: Headers,
    payload: T,
    wire: Wire<T> = new FetchWire<T>()
  ) {
    this.url = url;
    this.headers = headers;
    this.payload = payload;
    this.wire = wire;
  }

  send(): Promise<Response<T>> {
    return this.wire.send(this.url, {
      method: 'POST',
      headers: this.headers,
      payload: this.payload
    });
  }
}
