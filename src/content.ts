// deno-lint-ignore-file no-explicit-any
import { Request } from "../src/request.ts";

export interface Content<T> {
  content(): Promise<T>;
}

export class JsonContent implements Content<any> {
  private readonly request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  async content(): Promise<any> {
    const response = await this.request.send();
    const bytes = await response.bytes();
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
  }
}
