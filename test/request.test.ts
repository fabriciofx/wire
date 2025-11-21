import { assertEquals } from '@std/assert';
import {
  Authenticated,
  type AuthTokens,
  AuthWithToken,
  type Credentials
} from '../src/auth.ts';
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

Deno.test('Must do a simple get request', async () => {
  const response = await new Get<DogResponse>(
    'https://api.thedogapi.com/v1'
  ).send();
  assertEquals(response.status, 200);
  assertEquals(response.data.message, 'The Dog API');
});

Deno.test('Must do an authenticated get request', async () => {
  const response = await new AuthWithToken(
    new Get<DogResponse>('https://api.thedogapi.com/v1'),
    config.THEDOGAPI_TOKEN
  ).send();
  assertEquals(response.status, 200);
  assertEquals(response.data.message, 'The Dog API');
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
  assertEquals(response.status, 201);
  assertEquals(response.data.message, 'SUCCESS');
});

Deno.test('Must authenticated with credentials', async () => {
  const server = new FakeHttpServer(8000);
  server.start();
  const credentials: Credentials = {
    username: 'admin',
    password: '12345678'
  };
  const tokens = await new Post<Credentials, AuthTokens>(
    'http://localhost:8000/login',
    credentials
  ).send();
  const users = await new Authenticated(
    new Get<User[]>('http://localhost:8000/users'),
    tokens.data
  ).send();
  assertEquals(users.data, [
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
  const tokens = await new Post<Credentials, AuthTokens>(
    'http://localhost:8000/login',
    credentials
  ).send();
  const response = await new Authenticated(
    new Delete<string>('http://localhost:8000/users/1'),
    tokens.data
  ).send();
  assertEquals(response.status, 200);
  assertEquals(response.data, 'User Ana deleted with success.');
  server.stop();
});
