import { assertEquals } from '@std/assert';
import { AuthWithToken, Get, Post } from '../src/request.ts';
import * as config from './config.ts';

type DogResponse = {
  message: string;
  version: string;
};

type Vote = {
  image_id: string;
  value: number;
};

type VoteResponse = {
  message: string;
  id: string;
  image_id: string;
  value: number;
  country_code: string;
};

Deno.test('Must do a simple get request', async () => {
  const response = await new Get<DogResponse>(
    'https://api.thedogapi.com/v1'
  ).send();
  assertEquals(response.status(), 200);
  assertEquals(response.data().message, 'The Dog API');
});

Deno.test('Must do an authenticated get request', async () => {
  const response = await new AuthWithToken(
    new Get<DogResponse>('https://api.thedogapi.com/v1'),
    config.THEDOGAPI_TOKEN
  ).send();
  assertEquals(response.status(), 200);
  assertEquals(response.data().message, 'The Dog API');
});

Deno.test('Must do an authenticated post request', async () => {
  const vote: Vote = {
    image_id: 'BJa4kxc4X',
    value: 1
  };
  const response = await new AuthWithToken(
    new Post<Vote, VoteResponse>('https://api.thedogapi.com/v1/votes', vote),
    config.THEDOGAPI_TOKEN
  ).send();
  assertEquals(response.status(), 201);
  assertEquals(response.data().message, 'SUCCESS');
});
