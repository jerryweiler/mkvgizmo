type QueueItem<T> = {
  promise: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export class TaskQueue<T> {
  queue: QueueItem<T>[] = [];
  running: number = 0;
  concurrency: number = 1;

  constructor(concurrency: number = 1) {
    this.concurrency = concurrency;
  }

  enqueue(promise: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({promise, resolve, reject});
      this.dequeue();
    });
  }

  dequeue(): void {
    if (this.running >= this.concurrency) {
      return;
    }

    const item = this.queue.shift();
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
