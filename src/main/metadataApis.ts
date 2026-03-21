import path from "path";
import { config } from "./configApis";
import { GetStreamListResult, GetKeyFrameListResult } from "../preload";
import { runTextProcess } from "./processUtils";

type packet = {
  pts_time: string;
  flags: string;
};

type ffprobeFrameResult = {
  packets: packet[];
};

export async function getStreamList(
  directory: string,
  filename: string,
): Promise<GetStreamListResult> {
  if (!config.ffmpegPath) {
    return { rawDetails: "", errorMessage: "No path configured for ffprobe" };
  }

  // Generate the pathnames for the executable and target file.
  // Escape special characters.
  const filepath = path.join(directory, filename);
  const ffprobepath = path.join(config.ffmpegPath, "ffprobe.exe");

  const result = await runTextProcess(ffprobepath, [
    "-loglevel",
    "warning",
    "-analyzeduration",
    "10000000",
    "-probesize",
    "10000000",
    "-show_streams",
    "-output_format",
    "json",
    filepath,
  ]);

  return { rawDetails: result.output, errorMessage: result.errorMessage };
}

export async function getKeyFrameList(
  directory: string,
  filename: string,
  streamId: number,
): Promise<GetKeyFrameListResult> {
  if (!config.ffmpegPath) {
    return { rawDetails: "", timestamps: [], errorMessage: "No path configured for ffprobe" };
  }

  // Generate the pathnames for the executable and target file.
  // Escape special characters.
  const filepath = path.join(directory, filename);
  const ffprobepath = path.join(config.ffmpegPath, "ffprobe.exe");

  const result = await runTextProcess(ffprobepath, [
    "-loglevel",
    "warning",
    "-analyzeduration",
    "10000000",
    "-probesize",
    "10000000",
    "-select_streams",
    `v:${streamId}`,
    "-show_entries",
    "packet=pts_time,flags",
    "-fflags",
    "+genpts",
    "-output_format",
    "json",
    filepath,
  ]);

  let timestamps: number[] = [];
  if (result.output) {
    const details = JSON.parse(result.output) as ffprobeFrameResult;
    timestamps = details.packets
      .filter(p => p.flags.includes("K"))
      .map(p => Number(p.pts_time))
      .sort((a, b) => a - b);
  }

  return { rawDetails: result.output, timestamps, errorMessage: result.errorMessage };
}
