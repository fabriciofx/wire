import { assertFalse } from '@std/assert';
import { FormPayload, TextPayload } from '../src/payload.ts';

Deno.test('Must contains name and age data from form', async () => {
  const regex = new RegExp(
    '------\\d+\\s+Content-Disposition: form-data; name="name"' +
      '\\s+Content-Type: text/plain; charset=utf-8' +
      '\\s+[\\s\\S]*?\\s+------\\d+' +
      '\\s+Content-Disposition: form-data; name="age"' +
      '\\s+Content-Type: text/plain; charset=utf-8' +
      '\\s+[\\s\\S]*?\\s+------\\d+--',
    'gm'
  );
  const decoder = new TextDecoder();
  const payload = new FormPayload(
    ['name', new TextPayload('John Wick')],
    ['age', new TextPayload('42')]
  );
  assertFalse(!regex.test(decoder.decode(await payload.content())));
});
