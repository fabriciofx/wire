import type { Headers } from './headers.ts';
import type { Response } from './response.ts';

export type Params<T> = {
  method: string;
  headers: Headers;
  payload?: T;
};

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
      return { data: data, status: response.status };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message);
    }
  }
}
