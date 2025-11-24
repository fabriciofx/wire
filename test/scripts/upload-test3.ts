import { env } from '../config.ts';
import { FakeHttpServer } from '../server/server.ts';

const filePath = '../resources/mini-black-dog.jpg';
const bytes = await Deno.readFile(filePath);
const file = new File([bytes], 'mini-black-dog.jpg', { type: 'image/jpeg' });

const form = new FormData();
form.append('file', file);

const server = new FakeHttpServer(8080);
server.start();

const config = await env();
const response = await fetch('http://localhost:8080/upload', {
  method: 'POST',
  headers: {
    'x-api-key': config.THEDOGAPI_TOKEN
  },
  body: form
});

const result = await response.json();
console.log(result);
server.stop();
