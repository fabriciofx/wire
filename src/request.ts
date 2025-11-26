import type { Header } from './header.ts';
import { Headers } from './headers.ts';
import type { Payload } from './payload.ts';
import type { Response } from './response.ts';
import { FetchWire, type Wire } from './wire.ts';

export interface Request {
  with(header: Header): Request;
  send(): Promise<Response>;
}

export class Get implements Request {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly wire: Wire;

  constructor(
    url: string,
    headers: Headers = new Headers(),
    wire: Wire = new FetchWire()
  ) {
    this.url = url;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): Request {
    return new Get(
      this.url,
      new Headers(...this.headers.items(), header),
      this.wire
    );
  }

  send(): Promise<Response> {
    return this.wire.send(this.url, {
      method: 'GET',
      headers: this.headers
    });
  }
}

export class Post implements Request {
  private readonly url: string;
  private readonly payload: Payload;
  private readonly headers: Headers;
  private readonly wire: Wire;

  constructor(
    url: string,
    payload: Payload,
    headers: Headers = new Headers(),
    wire: Wire = new FetchWire()
  ) {
    this.url = url;
    this.payload = payload;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): Request {
    return new Post(
      this.url,
      this.payload,
      new Headers(...this.headers.items(), header),
      this.wire
    );
  }

  send(): Promise<Response> {
    return this.wire.send(this.url, {
      method: 'POST',
      headers: this.payload.headers(this.headers),
      payload: this.payload
    });
  }
}

export class Delete implements Request {
  private readonly url: string;
  private readonly headers: Headers;
  private readonly wire: Wire;

  constructor(
    url: string,
    headers: Headers = new Headers(),
    wire: Wire = new FetchWire()
  ) {
    this.url = url;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): Request {
    return new Delete(
      this.url,
      new Headers(...this.headers.items(), header),
      this.wire
    );
  }

  send(): Promise<Response> {
    return this.wire.send(this.url, {
      method: 'DELETE',
      headers: this.headers
    });
  }
}

export class Put implements Request {
  private readonly url: string;
  private readonly payload: Payload;
  private readonly headers: Headers;
  private readonly wire: Wire;

  constructor(
    url: string,
    payload: Payload,
    headers: Headers = new Headers(),
    wire: Wire = new FetchWire()
  ) {
    this.url = url;
    this.payload = payload;
    this.headers = headers;
    this.wire = wire;
  }

  with(header: Header): Request {
    return new Put(
      this.url,
      this.payload,
      new Headers(...this.headers.items(), header),
      this.wire
    );
  }

  send(): Promise<Response> {
    return this.wire.send(this.url, {
      method: 'PUT',
      headers: this.payload.headers(this.headers),
      payload: this.payload
    });
  }
}
