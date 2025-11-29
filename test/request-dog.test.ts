import { assertEquals } from '@std/assert';
import { AuthWithToken } from '../src/auth.ts';
import { FileContent, JsonContent } from '../src/content.ts';
import { FormPayload, JpegPayload, JsonPayload } from '../src/payload.ts';
import { Get, Post } from '../src/request.ts';
import { env } from './config.ts';

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

type UploadResponse = {
  id: string;
  url: string;
  width: number;
  height: number;
  original_filename: string;
  pending: number;
  approved: number;
};

Deno.test('Must do a simple get request', async () => {
  const response = await new JsonContent<DogResponse>(
    new Get('https://api.thedogapi.com/v1')
  ).content();
  assertEquals(response.message, 'The Dog API');
});

Deno.test('Must do an authenticated get request', async () => {
  const config = await env();
  const response = await new JsonContent<DogResponse>(
    new AuthWithToken(
      new Get('https://api.thedogapi.com/v1'),
      config.THEDOGAPI_TOKEN
    )
  ).content();
  assertEquals(response.message, 'The Dog API');
});

Deno.test('Must do an authenticated post request', async () => {
  const config = await env();
  const vote: Vote = {
    image_id: 'BJa4kxc4X',
    value: 1
  };
  const response = await new JsonContent<VoteResponse>(
    new AuthWithToken(
      new Post(
        'https://api.thedogapi.com/v1/votes',
        new JsonPayload<Vote>(vote)
      ),
      config.THEDOGAPI_TOKEN
    )
  ).content();
  assertEquals(response.message, 'SUCCESS');
});

Deno.test('Must download and save an image', async () => {
  const file = await new FileContent(
    new Get('https://cdn2.thedogapi.com/images/BJa4kxc4X.jpg'),
    'black-dog.jpg'
  ).content();
  const bytes = await file.bytes();
  const blackDog = await Deno.readFile('./test/resources/black-dog.jpg');
  assertEquals(bytes, blackDog);
});

Deno.test('Must upload an image', async () => {
  const config = await env();
  const blackDog = await Deno.readFile('./test/resources/black-dog.jpg');
  const response = await new JsonContent<UploadResponse>(
    new AuthWithToken(
      new Post(
        'https://api.thedogapi.com/v1/images/upload',
        new FormPayload([
          'file',
          new JpegPayload(blackDog, ['filename', 'black-dog.jpg'])
        ])
      ),
      config.THEDOGAPI_TOKEN
    )
  ).content();
  assertEquals(response.width, 1600);
  assertEquals(response.height, 1199);
  assertEquals(response.original_filename, 'black-dog.jpg');
  assertEquals(response.pending, 0);
  assertEquals(response.approved, 1);
});
