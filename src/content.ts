// deno-lint-ignore-file no-explicit-any
import { Request } from "../src/request.ts";

export class JsonContent {
  private readonly request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  async content(): Promise<any> {
    const response = await this.request.send();
    return response.json();
  }
}
