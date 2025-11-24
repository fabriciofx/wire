import { load } from '@std/dotenv';
import { dirname, fromFileUrl, join } from '@std/path';

export async function env() {
  const dir = dirname(fromFileUrl(import.meta.url));
  const envFile = join(dir, '.env.test');
  const env = await load({ envPath: envFile });
  return {
    THEDOGAPI_TOKEN: env.THEDOGAPI_TOKEN || ''
  };
}
