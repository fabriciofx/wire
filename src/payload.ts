type JsonType =
  | string
  | number
  | boolean
  | Uint8Array
  | JsonType[]
  | { [key: string]: JsonType };

export interface Payload {
  size(): number;
  stream(): ReadableStream<Uint8Array>;
}

export class Empty implements Payload {
  size(): number {
    return 0;
  }

  stream(): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>(
      {
        start(controller) {
          controller.enqueue(new Uint8Array(0));
          controller.close();
        }
      }
    );
  }
}

export class Json implements Payload {
  private readonly json: JsonType;

  constructor(json: JsonType) {
    this.json = json;
  }

  size(): number {
    return this.json.toString().length;
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
