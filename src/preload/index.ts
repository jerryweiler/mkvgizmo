import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

export type ScanDirectoryResult = {
  errorMessage?: string;
  directories: string[];
  files: string[];
};

export type GizmoConfig = {
  ffmpegPath?: string;
  startingPath?: string;
};

export type SaveConfigResult = {
  success: boolean;
  errorMessage?: string;
};

export type GetMkvDetailsResult = {
  errorMessage?: string;
  rawDetails: string;
};

export interface API {
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

// Custom APIs for renderer
const api: API = {
  chooseDirectory: () => ipcRenderer.invoke("dialog:chooseDirectory"),
  scanDirectory: (directory) => ipcRenderer.invoke("scanDirectory", directory),
  joinPaths: (basePath, relativePath) =>
    ipcRenderer.invoke("joinPaths", basePath, relativePath),
  loadConfig: () => ipcRenderer.invoke("config:load"),
  saveConfig: (update) => ipcRenderer.invoke("config:save", update),
  getMkvDetails: (directory, filename) =>
    ipcRenderer.invoke("getMkvDetails", directory, filename),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
