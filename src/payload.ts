import { ContentDiposition, ContentLength, ContentType } from './header.ts';
import type { Headers } from './headers.ts';

export interface Payload {
  bytes(): Uint8Array<ArrayBuffer>;
  headers(hdrs: Headers): Headers;
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
    hdrs.add(new ContentType('application/json'));
    return hdrs;
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
    hdrs.add(new ContentType('image/jpeg'));
    hdrs.add(new ContentLength(this.content.length));
    return hdrs;
  }
}

export class FormPayload implements Payload {
  private readonly payload: Payload;
  private readonly boundary: string;

  constructor(payload: Payload) {
    this.payload = payload;
    const numeros: string[] = [];
    for (let idx = 0; idx < 7; idx++) {
      numeros.push(String(Math.floor(Math.random() * 9000) + 1000));
    }
    this.boundary = `----${numeros.join('')}`;
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
    const content = new ContentType('image/jpeg');
    chunks.push(encoder.encode(`--${this.boundary}`));
    // biome-ignore format: the line below needs double quotes.
    chunks.push(encoder.encode("\r\n"));
    chunks.push(encoder.encode(disposition.asString()));
    // biome-ignore format: the line below needs double quotes.
    chunks.push(encoder.encode("\r\n"));
    chunks.push(encoder.encode(content.asString()));
    // biome-ignore format: the line below needs double quotes.
    chunks.push(encoder.encode("\r\n\r\n"));
    chunks.push(this.payload.bytes());
    // biome-ignore format: the line below needs double quotes.
    chunks.push(encoder.encode("\r\n"));
    chunks.push(encoder.encode(`--${this.boundary}--`));
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
    hdrs.add(new ContentType(`multipart/form-data; boundary=${this.boundary}`));
    return hdrs;
  }
}
