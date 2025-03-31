import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

export type ScanDirectoryResult = {
  directories: string[];
  files: string[];
};

export interface API {
  chooseDirectory(): Promise<string | undefined>;
  scanDirectory(directory: string): Promise<ScanDirectoryResult>;
  joinPaths(basePath: string, relativePath: string): Promise<string>;
  loadFfmpegConfig(): Promise<string | undefined>;
  saveFfmpegConfig(directory: string): Promise<boolean>;
}

// Custom APIs for renderer
const api: API = {
  chooseDirectory: () => ipcRenderer.invoke("dialog:chooseDirectory"),
  scanDirectory: (directory) => ipcRenderer.invoke("scanDirectory", directory),
  joinPaths: (basePath, relativePath) =>
    ipcRenderer.invoke("joinPaths", basePath, relativePath),
  loadFfmpegConfig: () => ipcRenderer.invoke("config:loadFfmpegPath"),
  saveFfmpegConfig: (directory) =>
    ipcRenderer.invoke("config:saveFfmpegPath", directory),
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
