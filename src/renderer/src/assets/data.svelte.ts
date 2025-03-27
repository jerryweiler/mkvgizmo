const directory = $state({ selected: undefined });

export function getCurrentDirectory(): string {
  return directory.selected;
}

export function setCurrentDirectory(cwd: string): void {
  if (!cwd) return;

  directory.selected = cwd;
}
