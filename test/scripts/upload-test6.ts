import { AuthWithToken } from '../../src/auth.ts';
import { FormPayload, JpegPayload } from '../../src/payload.ts';
import { Post } from '../../src/request.ts';
import { env } from '../config.ts';

const filePath = '../resources/black-dog.jpg';
const bytes = await Deno.readFile(filePath);

const config = await env();
const response = await new AuthWithToken(
  new Post(
    'https://api.thedogapi.com/v1/images/upload',
    new FormPayload(new JpegPayload(bytes))
  ),
  config.THEDOGAPI_TOKEN
).send();

console.log(response);
