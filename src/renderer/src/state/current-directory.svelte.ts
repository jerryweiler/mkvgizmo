import { FileVideoCamera, Folder } from "@lucide/svelte";
import { navItems, type NavItem } from "./navigation-items.svelte";
import { clearCurrentFile } from "./current-file.svelte";
import { config } from "./config.svelte";
import { logger } from "./logger.svelte";

export class WorkingDir {
  #current: string = $state("");

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

    this.#current = cwd;
    clearCurrentFile();
    const newNavItems: NavItem[] = [
      ...scanResults.directories.map((dir) => ({
        name: dir,
        isDirectory: true,
        icon: Folder,
        details: [],
      })),
      ...scanResults.files.map((file) => ({
        name: file.name,
        handle: file.handle,
        isDirectory: false,
        icon: FileVideoCamera,
        details: [],
      })),
    ];

    navItems.items = newNavItems;
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
}

export const workingDir = new WorkingDir();
await workingDir.set(config.startingPath);
