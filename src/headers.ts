import type { Header } from './header.ts';

export class Headers {
  private readonly items: Header[];

  constructor(...items: Header[]) {
    this.items = items;
  }

  count(): number {
    return this.items.length;
  }

  records(): Record<string, string> {
    return this.items.reduce(
      (acc, header) => {
        acc[header.name()] = header.value();
        return acc;
      },
      {} as Record<string, string>
    );
  }
}
