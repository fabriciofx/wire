export const MAX_FUNC_CACHE = 2 ** 31 - 1;

export interface Func<X, Y> {
  apply(input: X): Y;
}

export class StickyFunc<X, Y> implements Func<X, Y> {
  private readonly cache: Map<X, Y>;
  private readonly func: (input: X) => Y;
  private readonly max: number;

  constructor(func: (input: X) => Y, max: number = MAX_FUNC_CACHE) {
    this.cache = new Map<X, Y>();
    this.func = func;
    this.max = max;
  }

  apply(input: X): Y {
    while (this.cache.size > this.max) {
      const [[key]] = this.cache;
      this.cache.delete(key);
    }
    let value = this.cache.get(input);
    if (value === undefined) {
      value = this.func(input);
      this.cache.set(input, value);
    }
    return value;
  }
}
