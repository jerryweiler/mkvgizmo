import { dialog } from "electron";
import { readdir } from "fs/promises";
import path from "path";
import type { ScanDirectoryResult } from "../preload";

export async function chooseDirectory(): Promise<string | undefined> {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!result.canceled && result.filePaths.length === 1) {
    return result.filePaths[0];
  }

  return;
}

export async function scanDirectory(
  directory: string,
): Promise<ScanDirectoryResult> {
  const atRoot = path.join(directory, "..") === directory;
  const files = await readdir(directory, { withFileTypes: true });
  const result: ScanDirectoryResult = {
    directories: files.filter((f) => f.isDirectory()).map((f) => f.name),
    files: files
      .filter((f) => !f.isDirectory())
      .filter((f) => path.extname(f.name) === ".mkv")
      .map((f) => f.name),
  };

  if (!atRoot) {
    result.directories.unshift("..");
  }

  return result;
}

export function joinPaths(basePath: string, relativePath: string): string {
  return path.join(basePath, relativePath);
}
