import { tick } from "svelte";
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

  const details = await window.api.getMkvDetails(
    getCurrentDirectory(),
    getCurrentFile(),
  );

  const streams = JSON.parse(details);

  // getMkvDetails returns JSON in a minimized, hard to read format.
  // re-generate a more readable version for the RAW display
  currentFile.details = JSON.stringify(streams, null, 2);

  // hack to force the raw detail pane to size to the proper height.
  // svelte tick() causes the function to wait until all consumers of
  // the currentFile state store have finished processng their updates.
  // We then force the height of the detail textarea element to update its
  // height to fit the content. textarea doesn't provide a mechanism to
  // autosize otherwise.
  // TODO: change this to use $props and $effect in the details component?
  await tick();
  const element = document.getElementById("detail-text");
  element.style.height = element.scrollHeight + "px";
}

export function clearCurrentFile(): void {
  currentFile.name = undefined;
  currentFile.details = undefined;
  currentFile.streams = [];
}
