export class Logger {
  #nextid = 1;

  add(message: string): void {
    this.messages.push({ id: this.#nextid++, line: message });
  }

  clear(): void {
    this.messages = [];
  }

  messages: { id: number, line: string }[] = $state([]);
}

export const logger = new Logger();
