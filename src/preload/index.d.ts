import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  type ScanDirectoryResult = {
    errorMessage?: string;
    directories: string[];
    files: string[];
  };

  type GizmoConfig = {
    ffmpegPath?: string;
    startingPath?: string;
  };

  type SaveConfigResult = {
    success: boolean;
    errorMessage?: string;
  };

  type GetMkvDetailsResult = {
    errorMessage?: string;
    rawDetails: string;
  };
}

interface API {
  chooseDirectory(): Promise<string | undefined>;
  scanDirectory(directory: string): Promise<ScanDirectoryResult>;
  joinPaths(basePath: string, relativePath: string): Promise<string>;
  loadConfig(): Promise<GizmoConfig>;
  saveConfig(update: GizmoConfig): Promise<SaveConfigResult>;
  getMkvDetails(
    directory: string,
    filename: string,
  ): Promise<GetMkvDetailsResult>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
