import { FetchWire, Wire } from "./wire.ts";
import { Response } from "./response.ts";
import { Headers } from "./headers.ts";
import { Payload } from "./payload.ts";

export interface Request {
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

  send(): Promise<Response> {
    return this.wire.send(
      this.url,
      {
        method: "GET",
        headers: this.headers.records()
      }
    );
  }
}

export class Post<T> implements Request {
  private readonly url: string;
  private readonly payload: Payload;
  private readonly headers: Headers;
  private readonly wire: Wire;

  constructor(
    url: string,
    payload: Payload,
    headers: Headers,
    wire: Wire = new FetchWire()
  ) {
    this.url = url;
    this.payload = payload;
    this.headers = headers;
    this.wire = wire;
  }

  send(): Promise<Response> {
    return this.wire.send(
      this.url,
      {
        method: "POST",
        headers: this.headers.records(),
        body: this.payload.stream()
      }
    );
  }
}
