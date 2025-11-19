export interface Response<T> {
  data(): T;
  status(): number;
}

export class FetchResponse<T> implements Response<T> {
  private readonly _data: T;
  private readonly _status: number;

  constructor(data: T, status: number) {
    this._data = data;
    this._status = status;
  }

  data(): T {
    return this._data;
  }

  status(): number {
    return this._status;
  }
}
