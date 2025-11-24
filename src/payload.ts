import {
  ContentDiposition,
  ContentLength,
  ContentType,
  type Header
} from './header.ts';
import type { Headers } from './headers.ts';

export interface Payload {
  bytes(): Uint8Array<ArrayBuffer>;
  headers(hdrs: Headers): Headers;
  type(): Header;
}

export class JsonPayload<T> implements Payload {
  private readonly obj: T;

  constructor(obj: T) {
    this.obj = obj;
  }

  bytes(): Uint8Array<ArrayBuffer> {
    const json = JSON.stringify(this.obj);
    const encoder = new TextEncoder();
    return encoder.encode(json);
  }

  headers(hdrs: Headers): Headers {
    hdrs.add(this.type());
    return hdrs;
  }

  type(): Header {
    return new ContentType('application/json');
  }
}

export class JpegPayload implements Payload {
  private readonly content: Uint8Array<ArrayBuffer>;

  constructor(content: Uint8Array<ArrayBuffer>) {
    this.content = content;
  }

  bytes(): Uint8Array<ArrayBuffer> {
    return this.content;
  }

  headers(hdrs: Headers): Headers {
    hdrs.add(this.type());
    hdrs.add(new ContentLength(this.content.length));
    return hdrs;
  }

  type(): Header {
    return new ContentType('image/jpeg');
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
  private readonly payload: Payload;
  private readonly boundary: Boundary;

  constructor(payload: Payload) {
    this.payload = payload;
    this.boundary = new Boundary(7);
  }

  bytes(): Uint8Array<ArrayBuffer> {
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    const encoder = new TextEncoder();
    const disposition = new ContentDiposition(
      new Map([
        ['name', 'file'],
        ['filename', 'black-dog.jpg']
      ])
    );
    chunks.push(encoder.encode(this.boundary.begin()));
    // biome-ignore format: the line below needs double quotes.
    chunks.push(encoder.encode("\r\n"));
    chunks.push(encoder.encode(disposition.asString()));
    // biome-ignore format: the line below needs double quotes.
    chunks.push(encoder.encode("\r\n"));
    chunks.push(encoder.encode(this.payload.type().asString()));
    // biome-ignore format: the line below needs double quotes.
    chunks.push(encoder.encode("\r\n\r\n"));
    chunks.push(this.payload.bytes());
    // biome-ignore format: the line below needs double quotes.
    chunks.push(encoder.encode("\r\n"));
    chunks.push(encoder.encode(this.boundary.end()));
    const length = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
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
}
