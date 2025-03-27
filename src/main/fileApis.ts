import { dialog } from "electron";

export async function chooseDirectory(): Promise<string | undefined> {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (!result.canceled && result.filePaths.length === 1) {
    return result.filePaths[0];
  }

  return;
}
