import path from "path";
import { ffmpegPath } from "./configApis";
import { spawn } from "child_process";

export async function getMkvDetails(
  directory: string,
  filename: string,
): Promise<string> {
  if (!ffmpegPath) {
    return "";
  }

  // Generate the pathnames for the executable and target file.
  // Escape secial characters.
  const filepath = path.join(directory, filename);
  const ffprobepath = path.join(ffmpegPath, "ffprobe.exe");

  const process = spawn(ffprobepath, [
    "-show_streams",
    "-output_format",
    "json",
    filepath,
  ]);

  let output = "";
  for await (const chunk of process.stdout) {
    output += chunk;
  }

  return output;
}
