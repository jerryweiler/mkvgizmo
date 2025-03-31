import { app } from "electron";
import { readFile, stat, writeFile } from "fs/promises";
import path from "path";

// cache of ffmpeg path for runtime use
export let ffmpegPath: string | undefined = undefined;

// load the ffmpeg path at startup if it's been previously saved.
loadFfmpegConfig();

function getUserDataFileName(): string {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, "user-data.json");
}

/**
 * Update the config with the path to the ffmpeg binaries.
 * This will verify that the directory exists and contains the required binaries.
 * @param {string} directory - the directory containing ffmpeg binaries
 * @returns {Promise<boolean>} - true if save was successful, flase if there was a failure
 */
export async function saveFfmpegConfig(directory: string): Promise<boolean> {
  // verify the proposed directory
  // check for ffmpeg.exe and ffprobe.exe
  async function checkFile(filename: string): Promise<boolean> {
    try {
      const filestats = await stat(path.join(directory, filename));
      return filestats.isFile();
    } catch {
      return false;
    }
  }

  if (!(await checkFile("ffmpeg.exe")) || !(await checkFile("ffprobe.exe"))) {
    return false;
  }

  // write file
  try {
    const userData = JSON.stringify({ ffmpegPath: directory });
    await writeFile(getUserDataFileName(), userData, { encoding: "utf8" });
    ffmpegPath = directory;
    return true;
  } catch {
    return false;
  }
}

/**
 * Load and return the config for the path to the ffmpeg binaries.
 * @returns - either the previously-saved path or undefined
 */
export async function loadFfmpegConfig(): Promise<string | undefined> {
  try {
    const content = await readFile(getUserDataFileName(), { encoding: "utf8" });
    const config = JSON.parse(content);
    return config.ffmpegPath;
  } catch {
    return;
  }
}
