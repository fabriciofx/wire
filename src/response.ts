// deno-lint-ignore-file no-explicit-any
export interface Response {
  text(): Promise<string>;
  json(): Promise<any>;
  status(): number;
}

export class FetchResponse implements Response {
  private readonly response: globalThis.Response;

  constructor(response: globalThis.Response) {
    this.response = response;
  }

  async text(): Promise<string> {
    return await this.response.text();
  }

  async json(): Promise<any> {
    return await this.response.json();
  }

  status(): number {
    return this.response.status;
  }
}
