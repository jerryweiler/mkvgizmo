import { setCurrentDirectory } from "./current-directory.svelte";

const config = $state({ current: undefined });

config.current = await window.api.loadConfig();
setCurrentDirectory(config.current.startingPath);

export function getFfmpegPath(): string | undefined {
  return config.current.ffmpegPath;
}

export function getStartingPath(): string | undefined {
  return config.current.startingPath;
}

export async function saveConfig(update: GizmoConfig): Promise<boolean> {
  if (!(await window.api.saveConfig(update))) {
    // todo: change IPC method to return more detailed error string
    alert("Failure updating path");
    return false;
  }

  config.current = update;
  return true;
}
