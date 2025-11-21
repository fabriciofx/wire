import type { Header } from './header.ts';
import { Headers } from './headers.ts';
import type { Response } from './response.ts';
import { FetchWire, type Wire } from './wire.ts';

export interface Request {
  with(header: Header): void;
  send(): Promise<Response>;
}

export class Get implements Request {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly wire: Wire<void>;

  constructor(
    url: string,
    headers: Headers = new Headers(),
    wire: Wire<void> = new FetchWire<void>()
  ) {
    this.url = url;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): void {
    this.headers.add(header);
  }

  send(): Promise<Response> {
    return this.wire.send(this.url, {
      method: 'GET',
      headers: this.headers
    });
  }
}

export class Post<T> implements Request {
  private readonly url: string;
  private readonly payload: T;
  private readonly headers: Headers;
  private readonly wire: Wire<T>;

  constructor(
    url: string,
    payload: T,
    headers: Headers = new Headers(),
    wire: Wire<T> = new FetchWire<T>()
  ) {
    this.url = url;
    this.payload = payload;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): void {
    this.headers.add(header);
  }

  send(): Promise<Response> {
    return this.wire.send(this.url, {
      method: 'POST',
      headers: this.headers,
      payload: this.payload
    });
  }
}

export class Delete implements Request {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly wire: Wire<void>;

  constructor(
    url: string,
    headers: Headers = new Headers(),
    wire: Wire<void> = new FetchWire<void>()
  ) {
    this.url = url;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): void {
    this.headers.add(header);
  }

  send(): Promise<Response> {
    return this.wire.send(this.url, {
      method: 'DELETE',
      headers: this.headers
    });
  }
}
