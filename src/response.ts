export interface Response {
  content(): Promise<string>;
  status(): number;
}

export class FetchResponse implements Response {
  private readonly response: globalThis.Response;

  constructor(response: globalThis.Response) {
    this.response = response;
  }

  async content(): Promise<string> {
    return await this.response.text();
  }

  status(): number {
    return this.response.status;
  }
}
