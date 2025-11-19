import type { Headers } from './headers.ts';
import { FetchResponse, type Response } from './response.ts';

export interface Params<T> {
  method: string;
  headers: Headers;
  payload?: T;
}

export interface Wire<T> {
  send(url: string, params: Params<T>): Promise<Response<T>>;
}

export class FetchWire<T> implements Wire<T> {
  async send(url: string, params: Params<T>): Promise<Response<T>> {
    try {
      const response = await fetch(url, {
        method: params.method,
        headers: params.headers.records()
      });
      if (!response.ok) {
        throw new Error(`(${response.status}) ${response.statusText}`);
      }
      const data = (await response.json()) as T;
      return new FetchResponse<T>(data, response.status);
    } catch (error) {
      throw new Error(`Error sending a request: ${error}`);
    }
  }
}
