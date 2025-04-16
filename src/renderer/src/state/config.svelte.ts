import { setCurrentDirectory } from "./current-directory.svelte";

const config = $state({ current: undefined });

// load initial state
config.current = await window.api.loadConfig();
setCurrentDirectory(config.current.startingPath);

export function getFfmpegPath(): string | undefined {
  return config.current.ffmpegPath;
}

export function getStartingPath(): string | undefined {
  return config.current.startingPath;
}

export async function saveConfig(update: GizmoConfig): Promise<boolean> {
  const result = await window.api.saveConfig(update);
  if (!result.success) {
    alert(result.errorMessage);
    return false;
  }

  config.current = update;
  return true;
}
