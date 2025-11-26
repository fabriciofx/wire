import type { Request } from './request.ts';

export interface Content<T> {
  content(): Promise<T>;
}

export class JsonContent<T> implements Content<T> {
  private readonly request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  async content(): Promise<T> {
    const { bytes } = await this.request.send();
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text) as T;
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
    const { bytes } = await this.request.send();
    return new File([bytes], this.name);
  }
}
