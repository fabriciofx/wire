import { AuthWithToken } from '../../src/auth.ts';
import { Json } from '../../src/content.ts';
import { FormPayload, JpegPayload } from '../../src/payload.ts';
import { Post } from '../../src/request.ts';
import { env } from '../config.ts';
import { FakeHttpServer } from '../server/server.ts';

const filePath = '../resources/mini-black-dog.jpg';
const bytes = await Deno.readFile(filePath);

const server = new FakeHttpServer(8080);
server.start();

const config = await env();
const response = await new Json<string>(
  new AuthWithToken(
    new Post(
      'http://localhost:8080/upload',
      new FormPayload(new JpegPayload(bytes))
    ),
    config.THEDOGAPI_TOKEN
  )
).content();

console.log(response);
server.stop();
