import { assertEquals } from "@std/assert";
import { ContentType, XapiAuth } from "../src/header.ts";
import { Get, Post } from "../src/request.ts";
import { Headers } from "../src/headers.ts";
import * as config from "./config.ts";
import { JsonPayload } from "../src/payload.ts";
import { JsonContent, FileContent } from "../src/content.ts";

Deno.test(
  "Must do a simle get request",
  async () => {
    const content = await new JsonContent(
      new Get("https://api.thedogapi.com/v1")
    ).content();
    assertEquals(content.message, "The Dog API");
  }
);

Deno.test(
  "Must do an authenticated get request",
  async () => {
    const content = await new JsonContent(
      new Get(
        "https://api.thedogapi.com/v1",
        new Headers(new XapiAuth(config.THEDOGAPI_TOKEN))
      )
    ).content();
    assertEquals(content.message, "The Dog API");
  }
);

Deno.test(
  "Must download and save an image",
  async () => {
    const file = await new FileContent(
      new Get("https://cdn2.thedogapi.com/images/BJa4kxc4X.jpg"),
      "black-dog.jpg"
    ).content();
    const bytes = await file.bytes();
    const blackDog = await Deno.readFile("./test/resources/black-dog.jpg");
    assertEquals(bytes, blackDog);
  }
);

Deno.test(
  "Must do an authenticated post request",
  async () => {
    const content = await new JsonContent(
      new Post(
        "https://api.thedogapi.com/v1/votes",
        new Headers(
          new ContentType("application/json"),
          new XapiAuth(config.THEDOGAPI_TOKEN)
        ),
        new JsonPayload(
          {
            "image_id": "asf2",
            "sub_id": "user123",
            "value": 1
          }
        )
      )
    ).content();
    assertEquals(content.message, "SUCCESS");
  }
);
