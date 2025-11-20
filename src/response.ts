export interface Response<T> {
  data(): T;
  status(): number;
}

export class FetchResponse<T> implements Response<T> {
  private readonly datum: T;
  private readonly code: number;

  constructor(data: T, status: number) {
    this.datum = data;
    this.code = status;
  }

  data(): T {
    return this.datum;
  }

  status(): number {
    return this.code;
  }
}
