import { app, BrowserWindow, ipcMain, protocol } from "electron";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import electronReloader from "electron-reloader";
import { chooseDirectory, joinPaths, scanDirectory } from "./fileApis";
import {
  GetStreamListResult,
  GetKeyFrameListResult,
  GizmoConfig,
  SaveConfigResult,
  ScanDirectoryResult,
} from "../preload";
import { loadConfig, saveConfig } from "./configApis";
import { getStreamList, getKeyFrameList } from "./metadataApis";
import { captureFrame } from "./frame";
import { loadPlaylist, loadSegment } from "./stream";
import { createMainWindow } from "./windowMain";
import { getPreviewHandle, openPreview } from "./windowPreview";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "playlist",
    privileges: { supportFetchAPI: true },
  },
  {
    scheme: "segment",
    privileges: { supportFetchAPI: true },
  },
]);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  protocol.handle("frame", captureFrame);
  protocol.handle("playlist", loadPlaylist);
  protocol.handle("segment", loadSegment);

  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  // Set up IPC endpoints
  ipcMain.handle("dialog:chooseDirectory", chooseDirectory);
  ipcMain.handle(
    "scanDirectory",
    (_, directory: string): Promise<ScanDirectoryResult> =>
      scanDirectory(directory),
  );
  ipcMain.handle(
    "joinPaths",
    (_, basePath: string, relativePath: string): string =>
      joinPaths(basePath, relativePath),
  );
  ipcMain.handle(
    "getStreamList",
    (_, handle: number): Promise<GetStreamListResult> => getStreamList(handle),
  );
  ipcMain.handle(
    "getKeyFrameList",
    (_, handle: number, streamId: number): Promise<GetKeyFrameListResult> =>
      getKeyFrameList(handle, streamId),
  );
  ipcMain.handle("config:load", loadConfig);
  ipcMain.handle(
    "config:save",
    (_, update: GizmoConfig): Promise<SaveConfigResult> => saveConfig(update),
  );
  ipcMain.handle("openPreview", (_, handle: number): void =>
    openPreview(handle),
  );

  ipcMain.handle("preview:getHandle", (_) => getPreviewHandle());

  createMainWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

try {
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    electronReloader(module);
  }
} catch {
  /* empty */
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
