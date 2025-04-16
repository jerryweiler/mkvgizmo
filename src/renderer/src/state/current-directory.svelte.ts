import { FileVideo, Folder } from "@lucide/svelte";
import { navItems, type NavItem } from "./navigation-items.svelte";
import { clearCurrentFile } from "./current-file.svelte";
import { getFfmpegPath } from "./config.svelte";
import { logger } from "./logger.svelte";

const directory = $state({ selected: undefined });

export function getCurrentDirectory(): string {
  return directory.selected;
}

export async function setCurrentDirectory(cwd: string): Promise<void> {
  logger.messages = [];
  if (!getFfmpegPath()) {
    logger.messages.push("No ffmpeg/ffprobe path configured.");
  }
  if (!cwd) {
    logger.messages.push("No directory configured.");
  }

  if (!cwd) return;

  const scanResults = await window.api.scanDirectory(cwd);

  directory.selected = cwd;
  clearCurrentFile();
  const newNavItems: NavItem[] = [
    ...scanResults.directories.map((dir) => ({
      name: dir,
      isDirectory: true,
      icon: Folder,
      details: [],
    })),
    ...scanResults.files.map((dir) => ({
      name: dir,
      isDirectory: false,
      icon: FileVideo,
      details: [],
    })),
  ];

  navItems.items = newNavItems;
}

export async function changeCurrentDirectory(
  relativeDirectory: string,
): Promise<void> {
  const newPath = await window.api.joinPaths(
    directory.selected,
    relativeDirectory,
  );
  await setCurrentDirectory(newPath);
}
