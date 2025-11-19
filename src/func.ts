export interface Func<X, Y> {
  apply(input: X): Promise<Y>;
}

export class StickyFunc<X, Y> implements Func<X, Y> {
  private readonly cache: Y[];
  private readonly func: (input: X) => Promise<Y>;

  constructor(func: (input: X) => Promise<Y>) {
    this.cache = [];
    this.func = func;
  }

  async apply(input: X): Promise<Y> {
    if (this.cache.length === 0) {
      const result = await this.func(input);
      this.cache.push(result);
    }
    return this.cache[0];
  }
}
