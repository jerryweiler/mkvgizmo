import path from "path";
import { spawn } from "child_process";
import { config } from "./configApis";
import { GetMkvDetailsResult } from "../preload";

export async function getMkvDetails(
  directory: string,
  filename: string,
): Promise<GetMkvDetailsResult> {
  if (!config.ffmpegPath) {
    return { rawDetails: "", errorMessage: "No path configured for ffprobe" };
  }

  // Generate the pathnames for the executable and target file.
  // Escape secial characters.
  const filepath = path.join(directory, filename);
  const ffprobepath = path.join(config.ffmpegPath, "ffprobe.exe");

  const process = spawn(ffprobepath, [
    "-loglevel",
    "warning",
    "-show_streams",
    "-output_format",
    "json",
    filepath,
  ]);

  let error = "";
  for await (const chunk of process.stderr) {
    error += chunk;
  }

  let output = "";
  for await (const chunk of process.stdout) {
    output += chunk;
  }

  return { rawDetails: output, errorMessage: error };
}
