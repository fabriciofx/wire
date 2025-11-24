import { assertEquals } from '@std/assert';
import {
  Authenticated,
  type AuthTokens,
  AuthWithToken,
  type Credentials
} from '../src/auth.ts';
import { File, Json } from '../src/content.ts';
import { FormPayload, JpegPayload, JsonPayload } from '../src/payload.ts';
import { Delete, Get, Post } from '../src/request.ts';
import * as config from './config.ts';
import { FakeHttpServer } from './server/server.ts';

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

type User = {
  id: number;
  name: string;
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
  const response = await new Json<DogResponse>(
    new Get('https://api.thedogapi.com/v1')
  ).content();
  assertEquals(response.message, 'The Dog API');
});

Deno.test('Must do an authenticated get request', async () => {
  const response = await new Json<DogResponse>(
    new AuthWithToken(
      new Get('https://api.thedogapi.com/v1'),
      config.THEDOGAPI_TOKEN
    )
  ).content();
  assertEquals(response.message, 'The Dog API');
});

Deno.test('Must do an authenticated post request', async () => {
  const vote: Vote = {
    image_id: 'BJa4kxc4X',
    value: 1
  };
  const response = await new Json<VoteResponse>(
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

Deno.test('Must authenticated with credentials', async () => {
  const server = new FakeHttpServer(8000);
  server.start();
  const credentials: Credentials = {
    username: 'admin',
    password: '12345678'
  };
  const tokens = await new Json<AuthTokens>(
    new Post(
      'http://localhost:8000/login',
      new JsonPayload<Credentials>(credentials)
    )
  ).content();
  const users = await new Json<User[]>(
    new Authenticated(new Get('http://localhost:8000/users'), tokens)
  ).content();
  assertEquals(users, [
    { id: 1, name: 'Ana' },
    { id: 2, name: 'Bruno' }
  ]);
  server.stop();
});

Deno.test('Must delete a user', async () => {
  const server = new FakeHttpServer(8000);
  server.start();
  const credentials: Credentials = {
    username: 'admin',
    password: '12345678'
  };
  const tokens = await new Json<AuthTokens>(
    new Post(
      'http://localhost:8000/login',
      new JsonPayload<Credentials>(credentials)
    )
  ).content();
  const response = await new Json<string>(
    new Authenticated(new Delete('http://localhost:8000/users/1'), tokens)
  ).content();
  assertEquals(response, 'User Ana deleted with success.');
  server.stop();
});

Deno.test('Must download and save an image', async () => {
  const file = await new File(
    new Get('https://cdn2.thedogapi.com/images/BJa4kxc4X.jpg'),
    'black-dog.jpg'
  ).content();
  const bytes = await file.bytes();
  const blackDog = await Deno.readFile('./test/resources/black-dog.jpg');
  assertEquals(bytes, blackDog);
});

Deno.test('Must upload an image', async () => {
  const blackDog = await Deno.readFile('./test/resources/black-dog.jpg');
  const response = await new Json<UploadResponse>(
    new AuthWithToken(
      new Post(
        'https://api.thedogapi.com/v1/images/upload',
        new FormPayload(new JpegPayload(blackDog))
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
