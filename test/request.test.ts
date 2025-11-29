import { assertEquals, assertNotEquals } from '@std/assert';
import {
  Authenticated,
  type AuthTokens,
  type Credentials
} from '../src/auth.ts';
import { JsonContent } from '../src/content.ts';
import { JsonPayload } from '../src/payload.ts';
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
