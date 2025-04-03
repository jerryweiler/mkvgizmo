import { getCurrentDirectory } from "./current-directory.svelte";

const currentFile = $state({
  name: undefined,
  details: undefined,
  streams: [],
});

export function getCurrentFile(): string | undefined {
  return currentFile.name;
}

export function getFileDetails(): string | undefined {
  return currentFile.details;
}

export async function setCurrentFile(filename: string): Promise<void> {
  currentFile.name = filename;
  currentFile.details = await window.api.getMkvDetails(
    getCurrentDirectory(),
    getCurrentFile(),
  );
}

export function clearCurrentFile(): void {
  currentFile.name = undefined;
  currentFile.details = undefined;
  currentFile.streams = [];
}
