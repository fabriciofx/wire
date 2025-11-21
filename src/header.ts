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
