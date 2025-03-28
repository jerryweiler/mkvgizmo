import { FileVideo, Folder, type Icon as IconType } from "@lucide/svelte";

export type NavItem = {
  name: string;
  isDirectory: boolean;
  icon: typeof IconType;
  details: FileDetail[];
};

export type FileDetail = {
  type: string;
  streamid: number;
  language: string | null;
  icon: typeof IconType;
};

const directory = $state({ selected: undefined });

export function getCurrentDirectory(): string {
  return directory.selected;
}

export async function setCurrentDirectory(cwd: string): Promise<void> {
  if (!cwd) return;

  const scanResults = await window.api.scanDirectory(cwd);

  directory.selected = cwd;
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

export const navItems: { items: NavItem[] } = $state({ items: [] });
