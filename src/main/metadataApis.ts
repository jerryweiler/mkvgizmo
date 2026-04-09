import path from "path";
import { config } from "./configApis";
import { GetStreamListResult, GetKeyFrameListResult, StreamDetails } from "../preload";
import { getFileDetails } from "./fileCache";
import { runProcess } from "./processUtils";

type packet = {
  pts_time: string;
  flags: string;
};

type ffprobeFrameResult = {
  packets: packet[];
};

function extractStreamDetails(handle: number, raw): StreamDetails {
  let language = "";
  switch (raw.codec_type) {
    case "audio":
      language = raw?.tags?.language;
      break;
    case "subtitle":
      language = raw?.tags?.language;
      break;
  }

  // The name of the property holding the stream size varies.
  // Sometimes it's 'NUMBER_OF_BYTES-eng', sometimes it's 'NUMBER_OF_BYTES',
  // and it could possibly have other language suffixes or even be absent.
  let size = 0;
  for (const prop in raw?.tags) {
    if (prop.startsWith("NUMBER_OF_BYTES")) {
      size = raw.tags[prop];
      break;
    }
  }

  let dimensions = "";
  if (raw?.codec_type === "video" && raw?.width && raw?.height) {
    dimensions = `${raw.width}x${raw.height}`;
  }

  let channels = 0;
  if (raw?.channels) {
    channels = raw.channels;
  }

  return {
    id: raw?.index,
    key: `${handle}-${raw?.index}`,
    type: raw?.codec_type,
    codec: raw?.codec_name,
    language,
    size,
    dimensions,
    channels,
    forced: raw.disposition.forced !== 0,
  };
}

export async function getStreamList(handle: number): Promise<GetStreamListResult> {
  if (!config.ffmpegPath) {
    return { rawDetails: "", errorMessage: "No path configured for ffprobe", streams: [] };
  }

  const details = getFileDetails(handle);
  let errorMessage: string | undefined = undefined;

  if (!details.streams) {
    // Generate the pathnames for the executable and target file.
    // Escape special characters.
    const filepath = getFileDetails(handle).path;
    const ffprobepath = path.join(config.ffmpegPath, "ffprobe.exe");

    const result = await runProcess(ffprobepath, [
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

    details.rawDetails = result.output.toString();

    if (details.rawDetails) {
      const streams = JSON.parse(details.rawDetails);
      details.streams = streams.streams.map(extractStreamDetails.bind(null, handle));

      // getStreamList returns JSON in a minimized, hard to read format.
      // re-generate a more readable version for the RAW display
      details.rawDetails = JSON.stringify(details.streams, null, 2);
    }

    errorMessage = result.errorMessage;
  }

  return { rawDetails: details.rawDetails, errorMessage, streams: details.streams ?? [] };
}

export async function getKeyFrameList(
  handle: number,
  streamId: number,
): Promise<GetKeyFrameListResult> {
  if (!config.ffmpegPath) {
    return { rawDetails: "", timestamps: [], errorMessage: "No path configured for ffprobe" };
  }

  // Generate the pathnames for the executable and target file.
  // Escape special characters.
  const filepath = getFileDetails(handle).path;
  const ffprobepath = path.join(config.ffmpegPath, "ffprobe.exe");

  const result = await runProcess(ffprobepath, [
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
    const details = JSON.parse(result.output.toString()) as ffprobeFrameResult;
    timestamps = details.packets
      .filter(p => p.flags.includes("K"))
      .map(p => Number(p.pts_time))
      .sort((a, b) => a - b);
  }

  return { rawDetails: result.output.toString(), timestamps, errorMessage: result.errorMessage };
}
