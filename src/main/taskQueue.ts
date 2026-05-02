type QueueItem<T> = {
  promise: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export enum Priority {
  High = 0,
  Medium = 1,
  Low = 2,
}

export class TaskQueue<T> {
  queue: QueueItem<T>[][] = [[], [], []];
  running: number = 0;
  concurrency: number = 1;

  constructor(concurrency: number = 1) {
    this.concurrency = concurrency;
  }

  enqueue(promise: () => Promise<T>, priority: Priority): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue[priority].push({promise, resolve, reject});
      this.dequeue();
    });
  }

  dequeue(): void {
    if (this.running >= this.concurrency) {
      return;
    }

    let item: QueueItem<T> | undefined;
    for (let priority of [Priority.High, Priority.Medium, Priority.Low])
    {
      item = this.queue[priority].shift();
      if (item) break;
    }

    if (!item) {
      return;
    }

    try {
      this.running++;
      item.promise()
        .then((value) => {
          this.running--;
          item.resolve(value);
          this.dequeue();
        })
        .catch((err) => {
          this.running--;
          item.reject(err);
          this.dequeue();
        });
    } catch(err) {
      this.running--;
      item.reject(err);
      this.dequeue();
    }
  }
}
