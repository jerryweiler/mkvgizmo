/*
TODO: for some reason this doesn't work. figure out why

export class Logger {
  add(message: string): void {
    this.messages.push(message);
  }

  clear(): void {
    this.messages = [];
  }

  messages: string[] = [];
}

export const logger: Logger = $state(new Logger());
*/

export const logger: { messages: string[] } = $state({ messages: [] });
