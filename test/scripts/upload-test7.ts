import { env } from '../config.ts';
import { FakeHttpServer } from '../server/server.ts';

const bytesDog = await Deno.readFile('../resources/mini-black-dog.jpg');
const dog = new File([bytesDog], 'mini-black-dog.jpg', { type: 'image/jpeg' });
const bytesLogo = await Deno.readFile('../resources/mini-logo.png');
const logo = new File([bytesLogo], 'mini-logo.png', { type: 'image/png' });
const text = 'Conteúdo de texto com acentos: á, ô, ü.';
const blob = new Blob([text], { type: 'text/plain; charset=utf-8' });

const form = new FormData();
form.append('file', dog);
form.append('age', '46');
form.append('address', 'Rua do camaçarí, 123');
form.append('logo', logo);
form.append('arquivo_texto', blob, 'dados.txt');

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
