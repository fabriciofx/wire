import { env } from '../config.ts';

const filePath = '../resources/black-dog.jpg';
const bytes = await Deno.readFile(filePath);
const file = new File([bytes], 'black-dog.jpg', { type: 'image/jpeg' });

const form = new FormData();
form.append('file', file);

const config = await env();
const response = await fetch('https://api.thedogapi.com/v1/images/upload', {
  method: 'POST',
  headers: {
    'x-api-key': config.THEDOGAPI_TOKEN
  },
  body: form
});

const result = await response.json();
console.log(result);
