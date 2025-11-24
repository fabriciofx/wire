import type { Headers } from './headers.ts';
import type { Payload } from './payload.ts';
import type { Response } from './response.ts';

export type Params = {
  method: string;
  headers: Headers;
  payload?: Payload;
};

export interface Wire {
  send(url: string, params: Params): Promise<Response>;
}

export class FetchWire implements Wire {
  async send(url: string, params: Params): Promise<Response> {
    try {
      const init: RequestInit = {
        method: params.method,
        headers: params.headers.records()
      };
      if (params.payload) {
        init.body = params.payload.bytes();
      }
      const response = await fetch(url, init);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`(${response.status}) ${response.statusText}: ${text}`);
      }
      const bytes = await response.bytes();
      return { bytes: bytes, status: response.status };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message);
    }
  }
}
