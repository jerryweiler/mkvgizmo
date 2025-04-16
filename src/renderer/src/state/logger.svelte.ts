export class Logger {
  add(message: string): void {
    this.messages.push(message);
  }

  clear(): void {
    this.messages = [];
  }

  messages: string[] = $state([]);
}

export const logger = new Logger();
