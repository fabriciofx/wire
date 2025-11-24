import { env } from '../config.ts';
import { FakeHttpServer } from '../server/server.ts';

const server = new FakeHttpServer(8080);
server.start();

const config = await env();
const response = await fetch('http://localhost:8080/upload', {
  method: 'POST',
  headers: {
    'x-api-key': config.THEDOGAPI_TOKEN
  },
  body: ''
});

const result = await response.json();
console.log(result);
server.stop();
