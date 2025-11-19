import { assertEquals } from '@std/assert';
import { Get } from '../src/request.ts';

type DogResponse = {
  message: string;
  version: string;
};

Deno.test('Must do a simple get request', async () => {
  const response = await new Get<DogResponse>(
    'https://api.thedogapi.com/v1'
  ).send();
  assertEquals(response.data().message, 'The Dog API');
});
