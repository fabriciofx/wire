import { AuthWithToken } from '../../src/auth.ts';
import { JsonPayload } from '../../src/payload.ts';
import { Post } from '../../src/request.ts';
import { env } from '../config.ts';
import { FakeHttpServer } from '../server/server.ts';

const server = new FakeHttpServer(8080);
server.start();

const config = await env();
const response = await new AuthWithToken(
  new Post('http://localhost:8080/upload', new JsonPayload<string>('')),
  config.THEDOGAPI_TOKEN
).send();

console.log(response);
server.stop();
