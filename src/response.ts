export interface Response {
  bytes(): Promise<Uint8Array<ArrayBuffer>>;
  status(): number;
}

export class FetchResponse implements Response {
  private readonly response: globalThis.Response;

  constructor(response: globalThis.Response) {
    this.response = response;
  }

  async bytes(): Promise<Uint8Array<ArrayBuffer>> {
    return await this.response.bytes();
  }

  status(): number {
    return this.response.status;
  }
}
