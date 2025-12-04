import { Buffer } from 'node:buffer';
import type { Content } from './content.ts';
import { type Func, StickyFunc } from './func.ts';
import {
  ContentDiposition,
  ContentLength,
  ContentType,
  type Header
} from './header.ts';
import { Headers } from './headers.ts';

export interface Payload extends Content<Uint8Array<ArrayBuffer>> {
  headers(hdrs: Headers): Headers;
  type(): Header;
  metadata(): [string, string][];
}

export class TextPayload implements Payload {
  private readonly text: string;
  private readonly meta: [string, string][];

  constructor(text: string, ...metadata: [string, string][]) {
    this.text = text;
    this.meta = metadata;
  }

  content(): Promise<Uint8Array<ArrayBuffer>> {
    const encoder = new TextEncoder();
    return Promise.resolve(encoder.encode(this.text));
  }

  headers(hdrs: Headers): Headers {
    return new Headers(...hdrs.items(), this.type());
  }

  type(): Header {
    return new ContentType('text/plain; charset=utf-8');
  }

  metadata(): [string, string][] {
    return this.meta;
  }
}

export class JsonPayload<T> implements Payload {
  private readonly obj: T;
  private readonly meta: [string, string][];

  constructor(obj: T, ...metadata: [string, string][]) {
    this.obj = obj;
    this.meta = metadata;
  }

  content(): Promise<Uint8Array<ArrayBuffer>> {
    const json = JSON.stringify(this.obj);
    const encoder = new TextEncoder();
    return Promise.resolve(encoder.encode(json));
  }

  headers(hdrs: Headers): Headers {
    return new Headers(...hdrs.items(), this.type());
  }

  type(): Header {
    return new ContentType('application/json');
  }

  metadata(): [string, string][] {
    return this.meta;
  }
}

export class JpegPayload implements Payload {
  private readonly bytes: Uint8Array<ArrayBuffer>;
  private readonly meta: [string, string][];

  constructor(bytes: Uint8Array<ArrayBuffer>, ...metadata: [string, string][]) {
    this.bytes = bytes;
    this.meta = metadata;
  }

  content(): Promise<Uint8Array<ArrayBuffer>> {
    return Promise.resolve(this.bytes);
  }

  headers(hdrs: Headers): Headers {
    return new Headers(
      ...hdrs.items(),
      this.type(),
      new ContentLength(this.content.length)
    );
  }

  type(): Header {
    return new ContentType('image/jpeg');
  }

  metadata(): [string, string][] {
    return this.meta;
  }
}

class Boundary {
  private readonly func: Func<boolean, string>;

  constructor(size: number) {
    this.func = new StickyFunc((_value: boolean) => {
      const numbers = Array.from({ length: size }, () =>
        String(Math.floor(Math.random() * 9000) + 1000)
      );
      return `----${numbers.join('')}`;
    });
  }

  value(): string {
    return this.func.apply(true);
  }

  begin(): string {
    return `--${this.value()}`;
  }

  end(): string {
    return `--${this.value()}--`;
  }
}

export class FormPayload implements Payload {
  private readonly entries: [string, Payload][];
  private readonly boundary: Boundary;

  constructor(...entries: [string, Payload][]) {
    this.entries = entries;
    this.boundary = new Boundary(7);
  }

  async content(): Promise<Uint8Array<ArrayBuffer>> {
    const encoder = new TextEncoder();
    const contents = this.entries.map(async ([name, payload]) => {
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      const disposition = new ContentDiposition([
        ['name', name],
        ...payload.metadata()
      ]);
      chunks.push(encoder.encode(this.boundary.begin()));
      // biome-ignore format: the line below needs double quotes.
      chunks.push(encoder.encode("\r\n"));
      chunks.push(encoder.encode(disposition.asString()));
      // biome-ignore format: the line below needs double quotes.
      chunks.push(encoder.encode("\r\n"));
      chunks.push(encoder.encode(payload.type().asString()));
      // biome-ignore format: the line below needs double quotes.
      chunks.push(encoder.encode("\r\n\r\n"));
      chunks.push(await payload.content());
      // biome-ignore format: the line below needs double quotes.
      chunks.push(encoder.encode("\r\n"));
      return Buffer.concat(chunks);
    });
    return Buffer.concat([
      ...(await Promise.all(contents)),
      Buffer.from(this.boundary.end())
    ]);
  }

  headers(hdrs: Headers): Headers {
    return new Headers(...hdrs.items(), this.type());
  }

  type(): Header {
    return new ContentType(
      `multipart/form-data; boundary=${this.boundary.value()}`
    );
  }

  metadata(): [string, string][] {
    return this.entries.reduce<[string, string][]>((acc, [_, payload]) => {
      return acc.concat(payload.metadata());
    }, []);
  }
}
