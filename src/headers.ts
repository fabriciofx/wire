import type { Header } from './header.ts';

export class Headers {
  private readonly list: Header[];

  constructor(...items: Header[]) {
    this.list = items;
  }

  items(): Header[] {
    return this.list;
  }

  add(header: Header) {
    this.list.push(header);
  }

  records(): Record<string, string> {
    return this.list.reduce(
      (acc, header) => {
        acc[header.name()] = header.value();
        return acc;
      },
      {} as Record<string, string>
    );
  }
}
