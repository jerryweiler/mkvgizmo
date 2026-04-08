import { FileVideoCamera, Folder } from "@lucide/svelte";
import { clearCurrentFile } from "./current-file.svelte";
import { config } from "./config.svelte";
import { logger } from "./logger.svelte";
import { type Icon as IconType } from "@lucide/svelte";

export type ChildItem = {
  name: string;
  handle?: number;
  isDirectory: boolean;
  icon: typeof IconType;
};

export class WorkingDir {
  #current: string = $state("");
  #children: ChildItem[] = $state([]);

  get(): string {
    return this.#current;
  }

  async set(cwd: string): Promise<void> {
    logger.clear();
    if (!config.ffmpegPath) {
      logger.add("No ffmpeg/ffprobe path configured.");
    }
    if (!cwd) {
      logger.add("No directory configured.");
    }

    if (!cwd) return;

    const scanResults = await window.api.scanDirectory(cwd);

    clearCurrentFile();

    this.#current = cwd;
    this.#children = [
      ...scanResults.directories.map((dir) => ({
        name: dir,
        isDirectory: true,
        icon: Folder
      })),
      ...scanResults.files.map((file) => ({
        name: file.name,
        handle: file.handle,
        isDirectory: false,
        icon: FileVideoCamera
      })),
    ];
  }

  async navigate(
    relativeDirectory: string,
  ): Promise<void> {
    const newPath = await window.api.joinPaths(
      this.#current,
      relativeDirectory,
    );
    await this.set(newPath);
  }

  get children(): ChildItem[] {
    return this.#children;
  }
}

export const workingDir = new WorkingDir();
await workingDir.set(config.startingPath);
