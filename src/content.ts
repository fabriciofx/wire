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

export class FileContent implements Content<File> {
  private readonly request: Request;
  private readonly name: string;

  constructor(request: Request, name: string) {
    this.request = request;
    this.name = name;
  }

  async content(): Promise<File> {
    const response = await this.request.send();
    const bytes = await response.bytes();
    return new File([bytes], this.name);
  }
}
