import { Response, FetchResponse } from "./response.ts";

export interface Wire {
  send(url: string, hdrs: RequestInit): Promise<Response>;
}

export class FetchWire implements Wire {
  async send(url: string, hdrs: RequestInit): Promise<Response> {
    try {
      const response = await fetch(url, hdrs);
      if (!response.ok) {
        throw new Error(`(${response.status}) ${response.statusText}`);
      }
      return new FetchResponse(response);
    } catch(error) {
      throw new Error("Error sending a request: " + error);
    }
  }
}
