import { assertEquals, assertNotEquals } from '@std/assert';
import {
  Authenticated,
  type AuthTokens,
  type Credentials
} from '../src/auth.ts';
import { JsonContent } from '../src/content.ts';
import { FormPayload, JpegPayload, JsonPayload } from '../src/payload.ts';
import { Delete, Get, Post, Put } from '../src/request.ts';
import { FakeHttpServer } from './server/server.ts';

type User = {
  id: number;
  name: string;
};

Deno.test('Must authenticated with credentials', async () => {
  const server = new FakeHttpServer(8000);
  server.start();
  const credentials: Credentials = {
    username: 'admin',
    password: '12345678'
  };
  const users = await new JsonContent<User[]>(
    new Authenticated(
      new Get('http://localhost:8000/users'),
      new JsonContent<AuthTokens>(
        new Post(
          'http://localhost:8000/login',
          new JsonPayload<Credentials>(credentials)
        )
      )
    )
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
  const message = await new JsonContent<string>(
    new Authenticated(
      new Delete('http://localhost:8000/users/1'),
      new JsonContent<AuthTokens>(
        new Post(
          'http://localhost:8000/login',
          new JsonPayload<Credentials>(credentials)
        )
      )
    )
  ).content();
  assertEquals(message, 'User Ana deleted with success.');
  server.stop();
});

Deno.test('Must change a user name', async () => {
  const server = new FakeHttpServer(8000);
  server.start();
  const credentials: Credentials = {
    username: 'admin',
    password: '12345678'
  };
  const message = await new JsonContent<string>(
    new Authenticated(
      new Put(
        'http://localhost:8000/users/1',
        new JsonPayload<User>({ id: 1, name: 'Amanda' })
      ),
      new JsonContent<AuthTokens>(
        new Post(
          'http://localhost:8000/login',
          new JsonPayload<Credentials>(credentials)
        )
      )
    )
  ).content();
  assertEquals(
    message,
    'User  id: 1, name: Amanda id: 2, name: Bruno changed with success.'
  );
  server.stop();
});

Deno.test('Must upload an image', async () => {
  const server = new FakeHttpServer(8000);
  server.start();
  const blackDog = await Deno.readFile('./test/resources/black-dog.jpg');
  const message = await new JsonContent<string>(
    new Post(
      'http://localhost:8000/upload',
      new FormPayload([
        'file',
        new JpegPayload(blackDog, ['filename', 'black-dog.jpg'])
      ])
    )
  ).content();
  assertEquals(message, 'Received.');
  server.stop();
});

Deno.test('Must refresh an authentication token', async () => {
  const server = new FakeHttpServer(8000, 0);
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
  ).content();
  const token = await new JsonContent<{ access: string }>(
    new Post(
      'http://localhost:8000/refresh',
      new JsonPayload<{ refresh: string }>({ refresh: tokens.refresh })
    )
  ).content();
  assertNotEquals(tokens.access, token.access);
  server.stop();
});
