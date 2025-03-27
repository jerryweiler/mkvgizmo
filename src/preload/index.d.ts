import { ElectronAPI } from "@electron-toolkit/preload";

interface API {
  chooseDirectory(): Promise<string | undefined>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
