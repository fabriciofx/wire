import { assertEquals } from "@std/assert";
import { ContentType, XapiAuth } from "../src/header.ts";
import { Get, Post } from "../src/request.ts";
import { Headers } from "../src/headers.ts";
import * as config from "./config.ts";
import { JsonPayload } from "../src/payload.ts";
import { JsonContent } from "../src/content.ts";

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
  "Must do an authenticated post request",
  async () => {
    const content = await new JsonContent(
      new Post(
        "https://api.thedogapi.com/v1/votes",
        new JsonPayload(
          {
            "image_id": "asf2",
            "sub_id": "user123",
            "value": 1
          }
        ),
        new Headers(
          new ContentType("application/json"),
          new XapiAuth(config.THEDOGAPI_TOKEN)
        )
      )
    ).content();
    assertEquals(content.message, "SUCCESS");
  }
);
