import { Wire } from "./wire.ts";
import { Response } from "./response.ts";
import { Headers } from "./headers.ts";
import { Payload } from "./payload.ts";

export interface Request {
  send(): Promise<Response>;
}

export class Get implements Request {
  private readonly wire: Wire;
  private readonly url: string;
  private readonly headers: Headers;

  constructor(wire: Wire, url: string, headers: Headers) {
    this.wire = wire;
    this.url = url;
    this.headers = headers;
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
  private readonly wire: Wire;
  private readonly url: string;
  private readonly payload: Payload;
  private readonly headers: Headers;

  constructor(wire: Wire, url: string, payload: Payload, headers: Headers) {
    this.wire = wire;
    this.url = url;
    this.headers = headers;
    this.payload = payload;
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
