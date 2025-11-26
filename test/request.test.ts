import { assertEquals } from '@std/assert';
import {
  Authenticated,
  type AuthTokens,
  AuthWithToken,
  type Credentials
} from '../src/auth.ts';
import { FileContent, JsonContent } from '../src/content.ts';
import { FormPayload, JpegPayload, JsonPayload } from '../src/payload.ts';
import { Delete, Get, Post, Put } from '../src/request.ts';
import { env } from './config.ts';
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
  const response = await new JsonContent<DogResponse>(
    new Get('https://api.thedogapi.com/v1')
  ).adapt();
  assertEquals(response.message, 'The Dog API');
});

Deno.test('Must do an authenticated get request', async () => {
  const config = await env();
  const response = await new JsonContent<DogResponse>(
    new AuthWithToken(
      new Get('https://api.thedogapi.com/v1'),
      config.THEDOGAPI_TOKEN
    )
  ).adapt();
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
  ).adapt();
  assertEquals(response.message, 'SUCCESS');
});

Deno.test('Must authenticated with credentials', async () => {
  const server = new FakeHttpServer(8000);
  server.start();
  const credentials: Credentials = {
    username: 'admin',
    password: '12345678'
  };
  const tokens = await new JsonContent<AuthTokens>(
    new Post(
      'http://localhost:8000/login',
      new JsonPayload<Credentials>(credentials)
    )
  ).adapt();
  const users = await new JsonContent<User[]>(
    new Authenticated(new Get('http://localhost:8000/users'), tokens)
  ).adapt();
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
  const tokens = await new JsonContent<AuthTokens>(
    new Post(
      'http://localhost:8000/login',
      new JsonPayload<Credentials>(credentials)
    )
  ).adapt();
  const response = await new JsonContent<string>(
    new Authenticated(new Delete('http://localhost:8000/users/1'), tokens)
  ).adapt();
  assertEquals(response, 'User Ana deleted with success.');
  server.stop();
});

Deno.test('Must download and save an image', async () => {
  const file = await new FileContent(
    new Get('https://cdn2.thedogapi.com/images/BJa4kxc4X.jpg'),
    'black-dog.jpg'
  ).adapt();
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
  ).adapt();
  assertEquals(response.width, 1600);
  assertEquals(response.height, 1199);
  assertEquals(response.original_filename, 'black-dog.jpg');
  assertEquals(response.pending, 0);
  assertEquals(response.approved, 1);
});

Deno.test('Must change a user name', async () => {
  const server = new FakeHttpServer(8000);
  server.start();
  const credentials: Credentials = {
    username: 'admin',
    password: '12345678'
  };
  const tokens = await new JsonContent<AuthTokens>(
    new Post(
      'http://localhost:8000/login',
      new JsonPayload<Credentials>(credentials)
    )
  ).adapt();
  const response = await new JsonContent<string>(
    new Authenticated(
      new Put(
        'http://localhost:8000/users/1',
        new JsonPayload<User>({ id: 1, name: 'Amanda' })
      ),
      tokens
    )
  ).adapt();
  assertEquals(
    response,
    'User  id: 1, name: Amanda id: 2, name: Bruno changed with success.'
  );
  server.stop();
});
