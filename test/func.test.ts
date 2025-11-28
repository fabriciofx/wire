import { assertEquals } from '@std/assert/equals';
import { StickyFunc } from '../src/func.ts';

Deno.test('Must return the same value', () => {
  const func = new StickyFunc((num: number) => Math.random() + num);
  assertEquals(func.apply(1) + func.apply(1), func.apply(1) + func.apply(1));
});
