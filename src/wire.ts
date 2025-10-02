import { Headers } from "./headers.ts";
import { Payload } from "./payload.ts";
import { Response, FetchResponse } from "./response.ts";

export interface Params {
  method: string;
  headers: Headers;
  payload?: Payload;
}

export interface Wire {
  send(url: string, params: Params): Promise<Response>;
}

export class FetchWire implements Wire {
  async send(url: string, params: Params): Promise<Response> {
    try {
      const response = await fetch(
        url,
        {
          method: params.method,
          headers: params.headers.records(),
          body: params.payload?.stream()
        }
      );
      if (!response.ok) {
        throw new Error(`(${response.status}) ${response.statusText}`);
      }
      return new FetchResponse(response);
    } catch(error) {
      throw new Error("Error sending a request: " + error);
    }
  }
}
