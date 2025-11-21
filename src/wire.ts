import type { Headers } from './headers.ts';
import type { Response } from './response.ts';

export type Params<T> = {
  method: string;
  headers: Headers;
  payload?: T;
};

export interface Wire<T> {
  send(url: string, params: Params<T>): Promise<Response>;
}

export class FetchWire<T> implements Wire<T> {
  async send(url: string, params: Params<T>): Promise<Response> {
    try {
      const init: RequestInit = {
        method: params.method,
        headers: params.headers.records()
      };
      if (params.payload) {
        init.body = JSON.stringify(params.payload);
      }
      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error(`(${response.status}) ${response.statusText}`);
      }
      const bytes = await response.bytes();
      return { bytes: bytes, status: response.status };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message);
    }
  }
}
