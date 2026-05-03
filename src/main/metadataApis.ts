import path from "path";
import { config } from "./configApis";
import {
  GetFileMetadataResult,
  GetKeyFrameListResult,
  StreamDetails,
  ChapterDetails,
} from "../preload";
import { getFileDetails } from "./fileCache";
import { runProcess } from "./processUtils";
import { Priority } from "./taskQueue";

type packet = {
  pts_time: string;
  flags: string;
};

type ffprobeFrameResult = {
  packets: packet[];
};

function parseDuration(value: string): number {
  let parts = value.split(":");
  let result = 0;
  for (let part of parts) {
    result = result * 60 + parseFloat(part);
  }
  return result;
}

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
  // duration is similar with DURATION-*
  let size: number = 0;
  let duration: number = 0;
  for (const prop in raw?.tags) {
    if (prop.startsWith("NUMBER_OF_BYTES")) {
      size = raw.tags[prop];
    }
    if (prop.startsWith("DURATION")) {
      duration = parseDuration(raw.tags[prop]);
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
    default: raw.disposition.default !== 0,
    duration,
    forced: raw.disposition.forced !== 0,
    keyFramesComplete: false,
    segmentBoundariesComplete: false,
  };
}

function extractChapterDetails(raw): ChapterDetails {
  return {
    startTime: raw.start_time,
    endTime: raw.end_time,
    title: raw.tags.title,
  };
}

export async function getFileMetadata(
  handle: number,
): Promise<GetFileMetadataResult> {
  if (!config.ffmpegPath) {
    return {
      rawDetails: "",
      errorMessage: "No path configured for ffprobe",
      streams: [],
      chapters: [],
    };
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
      "-show_chapters",
      "-output_format",
      "json",
      filepath,
    ], Priority.High);

    details.rawDetails = result.output.toString();

    if (details.rawDetails) {
      const probeResult = JSON.parse(details.rawDetails);
      details.streams = probeResult.streams.map(
        extractStreamDetails.bind(null, handle),
      );

      details.chapters = probeResult.chapters.map(extractChapterDetails);

      // getStreamList returns JSON in a minimized, hard to read format.
      // re-generate a more readable version for the RAW display
      details.rawDetails = JSON.stringify(probeResult, null, 2);
    }

    errorMessage = result.errorMessage;
  }

  return {
    rawDetails: details.rawDetails,
    errorMessage,
    streams: details.streams ?? [],
    chapters: details.chapters ?? [],
  };
}

export async function getKeyFrameList(
  handle: number,
  streamId: number,
): Promise<GetKeyFrameListResult> {
  if (!config.ffmpegPath) {
    return {
      timestamps: [],
      errorMessage: "No path configured for ffprobe",
      isComplete: true,
    };
  }

  // Generate the pathnames for the executable and target file.
  // Escape special characters.
  const fileDetails = getFileDetails(handle);
  const streamDetails = fileDetails.streams?.find(
    (stream) => stream.id === streamId,
  );

  if (!streamDetails) {
    return {
      timestamps: [],
      errorMessage: `stream id ${streamId} not found`,
      isComplete: true,
    };
  }

  let errorMessage: string | undefined = undefined;

  if (!streamDetails.keyFramesComplete) {
    const ffprobepath = path.join(config.ffmpegPath, "ffprobe.exe");

    // read frame packets from a region of the file using read_interval.
    // streamDetails has information about what's already been processed.
    // read_interval's start point seeking isn't completely accurate,
    // so set up the start time to repeat a small overlap of what's already
    // been read. we'll remove duplicates afterward.
    const secondsLoaded: number = streamDetails.keyFrameSecondsLoaded ?? 0;
    const secondsToLoad: number = 60;
    const result = await runProcess(ffprobepath, [
      "-loglevel",
      "warning",
      "-analyzeduration",
      "10000000",
      "-probesize",
      "10000000",
      "-read_intervals",
      `${Math.max(0, secondsLoaded - 1)}%${secondsLoaded + secondsToLoad}`,
      "-select_streams",
      `v:${streamId}`,
      "-show_entries",
      "packet=pts_time,flags",
      "-fflags",
      "+genpts",
      "-output_format",
      "json",
      fileDetails.path,
    ], Priority.Medium);

    let timestamps: number[] = streamDetails.keyFrames ?? [];
    const staringKeyframeCount: number = timestamps.length;

    // filter duplicates, then sort them.
    if (result.output) {
      const output = result.output.toString();
      const packetDetails = JSON.parse(output) as ffprobeFrameResult;
      // filter keyframes out of the frames processed and
      // add them to the existing list
      timestamps = [
        ...timestamps,
        ...packetDetails.packets
          .filter((p) => p.flags.includes("K"))
          .map((p) => Number(p.pts_time)),
      ];

      // now filter duplicates, since we duplicated a small buffer between
      // scans, then sort the result
      timestamps = [...new Set(timestamps)].sort((a, b) => a - b);
      streamDetails.keyFramesComplete =
        timestamps.length === staringKeyframeCount;
    }

    streamDetails.keyFrames = timestamps;
    streamDetails.keyFrameSecondsLoaded = secondsLoaded + secondsToLoad;
    errorMessage = result.errorMessage;
  }

  return {
    timestamps: streamDetails.keyFrames ?? [],
    errorMessage,
    isComplete: streamDetails.keyFramesComplete,
  };
}
