type JsonType =
  | string
  | number
  | boolean
  | Uint8Array
  | JsonType[]
  | { [key: string]: JsonType };

export interface Payload {
  stream(): ReadableStream<Uint8Array>;
}

export class JsonPayload implements Payload {
  private readonly json: JsonType;

  constructor(json: JsonType) {
    this.json = json;
  }

  stream(): ReadableStream<Uint8Array> {
    const text = JSON.stringify(this.json);
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return new ReadableStream<Uint8Array>(
      {
        start(controller) {
          controller.enqueue(bytes);
          controller.close();
        }
      }
    );
  }
}
