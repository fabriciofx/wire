import type { Request } from './request.ts';

export interface Content<T> {
  content(): Promise<T>;
}

export class Json<T> implements Content<T> {
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

export class File implements Content<globalThis.File> {
  private readonly request: Request;
  private readonly name: string;

  constructor(request: Request, name: string) {
    this.request = request;
    this.name = name;
  }

  async content(): Promise<globalThis.File> {
    const { bytes } = await this.request.send();
    return new globalThis.File([bytes], this.name);
  }
}
