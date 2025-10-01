import { assertEquals } from "@std/assert";
import { ContentType, XapiAuth } from "../src/header.ts";
import { Get, Post } from "../src/request.ts";
import { Headers } from "../src/headers.ts";
import * as config from "./config.ts";
import { Json } from "../src/payload.ts";

Deno.test(
  "Must do a get request",
  async () => {
    const response = await new Get("https://api.thedogapi.com/v1").send();
    const content = JSON.parse(await response.content());
    assertEquals(content.message, "The Dog API");
  }
);

Deno.test(
  "Must do a authenticated get request",
  async () => {
    const response = await new Get(
      "https://api.thedogapi.com/v1",
      new Headers(new XapiAuth(config.THEDOGAPI_TOKEN))
    ).send();
    const content = JSON.parse(await response.content());
    assertEquals(content.message, "The Dog API");
  }
);

Deno.test(
  "Must do a authenticated post request",
  async () => {
    const response = await new Post(
      "https://api.thedogapi.com/v1/votes",
      new Json(
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
    ).send();
    const content = JSON.parse(await response.content());
    assertEquals(content.message, "SUCCESS");
  }
);
