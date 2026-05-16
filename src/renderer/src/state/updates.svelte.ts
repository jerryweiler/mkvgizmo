// Keep a list of updates for the current working directory, to be applied

import { selectedFile } from "./current-file.svelte";

// when the user saves, or discarded when the user navigates to a new directory
export class StreamUpdate {
  handle: number;
  stream: number;
  attr: string;
  value: boolean;
}

export class StreamUpdates {
  #updates: StreamUpdate[] = $state([]);

  add(value: StreamUpdate) {
    // we should only be adding updates for the currently selected file
    if (value.handle !== selectedFile.handle) {
      throw new Error("Only the selected file can be updated");
    }

    // update or add the value
    let index: number = this.#updates.findIndex(
      (u) =>
        u.handle === value.handle &&
        u.stream === value.stream &&
        u.attr === value.attr,
    );
    if (index === -1) {
      index = this.#updates.length;
      this.#updates.push(value);
    } else {
      this.#updates[index].value = value.value;
    }

    // if the value matches the current value in the file, remove the update
    let stream: StreamDetails = selectedFile.streams.find(
      (s) => s.id === value.stream,
    );

    switch (value.attr) {
      case "forced":
        if (stream.forced === value.value) {
          this.#updates.splice(index, 1);
        }
        break;
      case "default":
        if (stream.default === value.value) {
          this.#updates.splice(index, 1);
        }
        break;
    }
  }

  getAllUpdates(): StreamUpdate[] {
    return this.#updates;
  }

  fileHasUpdates(handle: number): boolean {
    return this.#updates.some((u) => u.handle === handle);
  }

  getUpdate(handle: number, stream: number, attr: string): boolean | undefined {
    let index: number = this.#updates.findIndex(
      (u) => u.handle === handle && u.stream === stream && u.attr === attr,
    );
    return index === -1 ? undefined : this.#updates[index].value;
  }

  clear() {
    this.#updates = [];
  }
}

export const streamUpdates = new StreamUpdates();

export function verifyAbandonChanges(): boolean {
  if (streamUpdates.getAllUpdates().length > 0) {
     return confirm(
      "There are unsaved changes in the current directory.\n" +
        "Do you wish to abandon them?",
    );
  }

  // there are no changes to abandon.
  return true;
}
