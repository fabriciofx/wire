export interface Header {
  name(): string;
  value(): string;
}

export class ContentType implements Header {
  private readonly type: string;

  constructor(type: string) {
    this.type = type;
  }

  name(): string {
    return 'Content-Type';
  }

  value(): string {
    return this.type;
  }
}

export class XapiAuth implements Header {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  name(): string {
    return 'x-api-key';
  }

  value(): string {
    return this.token;
  }
}

export class BearerAuth implements Header {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  name(): string {
    return 'Authorization';
  }

  value(): string {
    return `Bearer ${this.token}`;
  }
}

export class ContentLength implements Header {
  private readonly length: number;

  constructor(length: number) {
    this.length = length;
  }

  name(): string {
    return 'Content-Length';
  }

  value(): string {
    return String(this.length);
  }
}

export class AcceptEncoding implements Header {
  private readonly encoding: string;

  constructor(encoding: string) {
    this.encoding = encoding;
  }

  name(): string {
    return 'Accept-Encoding';
  }

  value(): string {
    return this.encoding;
  }
}

export class AcceptLanguage implements Header {
  private readonly language: string;

  constructor(language: string) {
    this.language = language;
  }

  name(): string {
    return 'Accept-Language';
  }

  value(): string {
    return this.language;
  }
}

export class ContentDiposition implements Header {
  private readonly entries: Map<string, string>;

  constructor(entries: Map<string, string>) {
    this.entries = entries;
  }

  name(): string {
    return 'Content-Disposition';
  }

  value(): string {
    const data = Array.from(this.entries)
      .map(([key, value]) => `${key}="${value}"`)
      .join('; ');
    return `form-data; ${data}`;
  }
}
