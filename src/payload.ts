import type { Adapter } from './content.ts';
import {
  ContentDiposition,
  ContentLength,
  ContentType,
  type Header
} from './header.ts';
import type { Headers } from './headers.ts';

export interface Payload extends Adapter<Uint8Array<ArrayBuffer>> {
  headers(hdrs: Headers): Headers;
  type(): Header;
  metadata(): [string, string][];
}

export class TextPayload implements Payload {
  private readonly text: string;

  constructor(text: string) {
    this.text = text;
  }

  adapt(): Promise<Uint8Array<ArrayBuffer>> {
    const encoder = new TextEncoder();
    return Promise.resolve(encoder.encode(this.text));
  }

  headers(hdrs: Headers): Headers {
    hdrs.add(this.type());
    return hdrs;
  }

  type(): Header {
    return new ContentType('text/plain; charset=utf-8');
  }

  metadata(): [string, string][] {
    return [];
  }
}

export class JsonPayload<T> implements Payload {
  private readonly obj: T;

  constructor(obj: T) {
    this.obj = obj;
  }

  adapt(): Promise<Uint8Array<ArrayBuffer>> {
    const json = JSON.stringify(this.obj);
    const encoder = new TextEncoder();
    return Promise.resolve(encoder.encode(json));
  }

  headers(hdrs: Headers): Headers {
    hdrs.add(this.type());
    return hdrs;
  }

  type(): Header {
    return new ContentType('application/json');
  }

  metadata(): [string, string][] {
    return [];
  }
}

export class JpegPayload implements Payload {
  private readonly content: Uint8Array<ArrayBuffer>;
  private readonly meta: [string, string][];

  constructor(
    content: Uint8Array<ArrayBuffer>,
    ...metadata: [string, string][]
  ) {
    this.content = content;
    this.meta = metadata;
  }

  adapt(): Promise<Uint8Array<ArrayBuffer>> {
    return Promise.resolve(this.content);
  }

  headers(hdrs: Headers): Headers {
    hdrs.add(this.type());
    hdrs.add(new ContentLength(this.content.length));
    return hdrs;
  }

  type(): Header {
    return new ContentType('image/jpeg');
  }

  metadata(): [string, string][] {
    return this.meta;
  }
}

class Boundary {
  private readonly hash: string;

  constructor(size: number) {
    const numbers: string[] = [];
    for (let idx = 0; idx < size; idx++) {
      numbers.push(String(Math.floor(Math.random() * 9000) + 1000));
    }
    this.hash = `----${numbers.join('')}`;
  }

  value(): string {
    return this.hash;
  }

  begin(): string {
    return `--${this.hash}`;
  }

  end(): string {
    return `--${this.hash}--`;
  }
}

export class FormPayload implements Payload {
  private readonly entries: [string, Payload][];
  private readonly boundary: Boundary;

  constructor(...entries: [string, Payload][]) {
    this.entries = entries;
    this.boundary = new Boundary(7);
  }

  async adapt(): Promise<Uint8Array<ArrayBuffer>> {
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
      chunks.push(await payload.adapt());
      // biome-ignore format: the line below needs double quotes.
      chunks.push(encoder.encode("\r\n"));
      const length = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const content = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        content.set(chunk, offset);
        offset += chunk.length;
      }
      return content;
    });
    let total = 0;
    for await (const content of contents) {
      total += content.length;
    }
    total += this.boundary.end().length;
    const result = new Uint8Array(total);
    let offset = 0;
    for await (const content of contents) {
      result.set(content, offset);
      offset += content.length;
    }
    result.set(encoder.encode(this.boundary.end()), offset);
    return Promise.resolve(result);
  }

  headers(hdrs: Headers): Headers {
    hdrs.add(this.type());
    return hdrs;
  }

  type(): Header {
    return new ContentType(
      `multipart/form-data; boundary=${this.boundary.value()}`
    );
  }

  metadata(): [string, string][] {
    return [];
  }
}
