import type { Headers } from './headers.ts';
import { FetchResponse, type Response } from './response.ts';

export interface Params<T> {
  method: string;
  headers: Headers;
  payload?: T;
}

export interface Wire<X, Y> {
  send(url: string, params: Params<X>): Promise<Response<Y>>;
}

export class FetchWire<X, Y> implements Wire<X, Y> {
  async send(url: string, params: Params<X>): Promise<Response<Y>> {
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
      const data = (await response.json()) as Y;
      return new FetchResponse<Y>(data, response.status);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error sending a request: ${message}`);
    }
  }
}
