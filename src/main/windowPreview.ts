import { BrowserWindow, shell } from "electron";
import icon from "../../resources/icon.png?asset";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { mainWindow } from "./windowMain";

// This file manages the preview window, which is created by the main window
// to preview the media file that the user has selected. Since it's a new
// BrowserWindow, the preview window is in a separate process and needs a way
// to know what file the user wants to preview. There are a few ways to do this,
// such as having the main process give each of the renderers a channel that
// they can use to communicate to each other, proxy requests between the
// renderers through main, etc. This implementation settles on a simple
// mechanism:
// 1 the preview window is made modal, so the selection in the main renderer
//   can't change while the preview is up, and only one preview can show at a
//   time
// 2 When creating the preview window, the ipc call to perform the creation
//   passes the handle of the selected file. This is saved as a global value
//   so the preview window can call back to the main process to retrieve the
//   value when it's ready.
let previewHandle: number = 0;

export function openPreview(handle: number): void {
  previewHandle = handle;

  // Create the browser window.
  const previewWindow = new BrowserWindow({
    width: 640,
    height: 480,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
    parent: mainWindow,
    modal: true,
  });

  previewWindow.setMinimumSize(400, 200);

  previewWindow.on("ready-to-show", () => {
    previewWindow.show();
  });

  previewWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    previewWindow.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/preview.html`);
  } else {
    previewWindow.loadFile(join(__dirname, "../renderer/preview.html"));
  }
}

export function getPreviewHandle(): number {
  return previewHandle;
}
