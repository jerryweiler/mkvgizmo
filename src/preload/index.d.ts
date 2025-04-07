import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  type ScanDirectoryResult = {
    directories: string[];
    files: string[];
  };

  type GizmoConfig = {
    ffmpegPath?: string;
    startingPath?: string;
  };
}

interface API {
  chooseDirectory(): Promise<string | undefined>;
  scanDirectory(directory: string): Promise<ScanDirectoryResult>;
  joinPaths(basePath: string, relativePath: string): Promise<string>;
  loadConfig(): Promise<GizmoConfig>;
  saveConfig(update: GizmoConfig): Promise<boolean>;
  getMkvDetails(directory: string, filename: string): Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
