import { AuthWithToken } from '../../src/auth.ts';
import { JsonContent } from '../../src/content.ts';
import { FormPayload, JpegPayload } from '../../src/payload.ts';
import { Post } from '../../src/request.ts';
import { env } from '../config.ts';
import { FakeHttpServer } from '../server/server.ts';

const filePath = '../resources/mini-black-dog.jpg';
const bytes = await Deno.readFile(filePath);

const server = new FakeHttpServer(8080);
server.start();

const config = await env();
const response = await new JsonContent<string>(
  new AuthWithToken(
    new Post(
      'http://localhost:8080/upload',
      new FormPayload([
        'file',
        new JpegPayload(bytes, ['filename', 'mini-black-dog.jpg'])
      ])
    ),
    config.THEDOGAPI_TOKEN
  )
).content();

console.log(response);
server.stop();
