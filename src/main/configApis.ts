import { app } from "electron";
import { readFile, stat, writeFile } from "fs/promises";
import path from "path";
import { GizmoConfig } from "../preload";

// cache of config data for runtime use
export let config: GizmoConfig = {};

// load the config at startup if it's been previously saved.
loadConfig();

function getUserDataFileName(): string {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "user-data.json");
}

/**
 * Update stored config with new values.
 * This will verify that the ffmpeg directory exists and contains the required binaries.
 * NOTE: this will currently NOT preserve values that might be saved on disk that are
 * not present in the update parameter. This can cause loss of values if an old version
 * updates over a newer version, or a client sends a config with only some values filled in.
 * @param {GizmoConfig} update - config object containing the directory with ffmpeg binaries, starting directory, etc.
 * @returns {Promise<boolean>} - true if save was successful, false if there was a failure
 */
export async function saveConfig(update: GizmoConfig): Promise<boolean> {
  // verify the proposed directory
  // check for ffmpeg.exe and ffprobe.exe
  async function checkFile(filename: string): Promise<boolean> {
    try {
      if (!update?.ffmpegPath) {
        return false;
      }
      const filestats = await stat(path.join(update.ffmpegPath, filename));
      return filestats.isFile();
    } catch {
      return false;
    }
  }

  if (!update.ffmpegPath) {
    return false;
  }

  // If the caller passed an ffmpeg path with the executable name included,
  // truncate it
  if (path.basename(update.ffmpegPath).toLowerCase() === "ffmpeg.exe") {
    update.ffmpegPath = path.dirname(update.ffmpegPath);
  }

  if (!(await checkFile("ffmpeg.exe")) || !(await checkFile("ffprobe.exe"))) {
    return false;
  }

  // write file
  try {
    const userData = JSON.stringify(update);
    await writeFile(getUserDataFileName(), userData, { encoding: "utf8" });
    config = update;
    return true;
  } catch {
    return false;
  }
}

/**
 * Load and return the config from disk.
 * @returns - either the previously-saved path or undefined
 */
export async function loadConfig(): Promise<GizmoConfig> {
  try {
    const content = await readFile(getUserDataFileName(), { encoding: "utf8" });
    config = JSON.parse(content);
  } catch {
    /* empty */
  }

  return config;
}
