import type { Request } from './request.ts';

export interface Adapter<T> {
  adapt(): Promise<T>;
}

export class JsonContent<T> implements Adapter<T> {
  private readonly request: Request;

  constructor(request: Request) {
    this.request = request;
  }

  async adapt(): Promise<T> {
    const { bytes } = await this.request.send();
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text) as T;
  }
}

export class FileContent implements Adapter<File> {
  private readonly request: Request;
  private readonly name: string;

  constructor(request: Request, name: string) {
    this.request = request;
    this.name = name;
  }

  async adapt(): Promise<File> {
    const { bytes } = await this.request.send();
    return new File([bytes], this.name);
  }
}
