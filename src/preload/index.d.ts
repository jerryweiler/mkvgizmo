import { ElectronAPI } from "@electron-toolkit/preload";

type ScanDirectoryResult = {
  directories: string[];
  files: string[];
};

interface API {
  chooseDirectory(): Promise<string | undefined>;
  scanDirectory(directory: string): Promise<ScanDirectoryResult>;
  joinPaths(basePath: string, relativePath: string): Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
