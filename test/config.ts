import { load } from "std/dotenv";

// Load environment test variables
const env = await load({ envPath: "./test/.env.test"});

// Set environment test variables
export const THEDOGAPI_TOKEN = env.THEDOGAPI_TOKEN!;
