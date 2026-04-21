import { BrowserWindow, shell } from "electron";
import icon from "../../resources/icon.png?asset";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { mainWindow } from "./windowMain";

export function openPreview() {
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

  previewWindow.setMinimumSize(320, 200);

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
