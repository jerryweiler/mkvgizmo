import { BrowserWindow, shell } from "electron";
import icon from "../../resources/icon.png?asset";
import { join } from "path";
import { is } from "@electron-toolkit/utils";

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
  if (is.dev && process.env["ELECTRON_PREVIEW_URL"]) {
    previewWindow.loadURL(process.env["ELECTRON_PREVIEW_URL"]);
  } else {
    previewWindow.loadFile(join(__dirname, "../renderer/preview.html"));
  }
}
