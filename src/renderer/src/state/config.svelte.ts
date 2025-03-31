const config = $state({ ffmpegPath: undefined });

config.ffmpegPath = await window.api.loadFfmpegConfig();

export function getFfmpegPath(): Promise<string | undefined> {
  return config.ffmpegPath;
}

export async function setFfmpegPath(ffmpegPath: string): Promise<boolean> {
  if (!(await window.api.saveFfmpegConfig(ffmpegPath))) {
    // todo: change IPC method to return more detailed error string
    alert("Failure updating path");
    return false;
  }

  config.ffmpegPath = ffmpegPath;
  return true;
}
