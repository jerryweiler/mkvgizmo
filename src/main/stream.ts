import path from "path";
import { StreamDetails } from "../preload";
import { config } from "./configApis";
import { FileDetails, getFileDetails } from "./fileCache";
import { runProcess } from "./processUtils";

// chop the file up on keyframes into segments that are no longer than the
// target diration
const targetSegmentDuration: number = 8;

type Selector = {
  handle?: number;
  video?: number;
  audio?: number;
  subtitle?: number;
  segment?: number;
};

function parseSelector(selector: string): Selector {
  const result: Selector = {};
  const parts = selector.split("/");
  for (const part of parts) {
    const value = parseInt(part.slice(1));
    switch (part.at(0)) {
      case "h":
        result.handle = value;
        break;
      case "v":
        result.video = value;
        break;
      case "a":
        result.audio = value;
        break;
      case "s":
        result.subtitle = value;
        break;
      case "i":
        result.segment = value;
        break;
      default:
        return {};
    }
  }

  return result;
}

function generateSegment(s: Selector, i: number) {
  let result: string = `segment://h${s.handle}/v${s.video}`;
  if (s.audio !== undefined) result += `/a${s.audio}`;
  if (s.subtitle !== undefined) result += `/s${s.subtitle}`;
  result += `/i${i}`;
  return result;
}

function generateSegmentBoundaries(stream: StreamDetails): void {
  if (stream.segmentBoundariesComplete) {
    // we've already generated segment boundaries for this stream
    return;
  }

  if (stream.segmentBoundaries && !stream.keyFramesComplete) {
    // we've generated a partial segment list from an incomplete keyframe list.
    // there's no reason to re-generate the segment list until we have a complete
    // keyframe list
    return;
  }

  if (!stream.keyFrames) {
    // if we don't have any keyframes yet, we can't generate anything!
    return;
  }

  const segmentList: number[] = [];
  let nextKeyframeIdx: number = 0;
  let segmentStart: number = 0;
  while (nextKeyframeIdx < stream.keyFrames.length) {
    // the segment needs at least one keyframe
    let segmentEnd: number = stream.keyFrames[nextKeyframeIdx++];

    // if the remainder of the stream is less than the target duration,
    // set the next segment to be the remainder of the stream
    if (stream.duration - segmentStart <= targetSegmentDuration) {
      nextKeyframeIdx = stream.keyFrames.length;
      segmentEnd = stream.duration;
    }

    // keep adding keyframes while we don't exceeed the target duration
    while (
      nextKeyframeIdx < stream.keyFrames.length &&
      stream.keyFrames[nextKeyframeIdx] - segmentStart <= targetSegmentDuration
    ) {
      segmentEnd = stream.keyFrames[nextKeyframeIdx++];
    }

    segmentList.push(segmentEnd);

    // set up for the next iteration
    segmentStart = segmentEnd;
  }

  // we should add one last segment from the last keyframe to the end of
  // the video.
  if (stream.keyFramesComplete && segmentStart < stream.duration) {
    segmentList.push(stream.duration);
  }

  stream.segmentBoundaries = segmentList;
  stream.segmentBoundariesComplete = stream.keyFramesComplete;
}

export async function loadPlaylist(request: Request): Promise<Response> {
  // this expects a request url of the form
  // playlist://handle/videoStreamId/audioStreamId
  const protocol = "playlist://";
  if (!request.url.startsWith(protocol)) {
    return new Response("bad request", {
      status: 400,
    });
  }

  const url = request.url.slice(protocol.length);
  const selector = parseSelector(url);

  if (!selector.handle) {
    return new Response("unknown handle", {
      status: 400,
    });
  }

  const fileDetails: FileDetails = getFileDetails(selector.handle);

  // the segment list is based on the video stream
  const stream: StreamDetails | undefined = fileDetails.streams?.find(
    (s) => s.id === selector.video,
  );

  if (!stream) {
    return new Response("unknown stream", {
      status: 400,
    });
  }

  generateSegmentBoundaries(stream);

  if (!stream.segmentBoundaries) {
    return new Response("segments could not be generated", {
      status: 400,
    });
  }

  const lines: string[] = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    "#EXT-X-TARGETDURATION:8",
    "#EXT-X-MEDIA-SEQUENCE:0",
  ];

  // For each segment, add a duration and url
  let segmentStart: number = 0;
  for (let i = 0; i < stream.segmentBoundaries.length; i++) {
    lines.push(
      `#EXTINF:${(stream.segmentBoundaries[i] - segmentStart).toFixed(4)}`,
    );
    lines.push(generateSegment(selector, i));

    segmentStart = stream.segmentBoundaries[i];
  }

  lines.push("#EXT-X-ENDLIST");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "application/x-mpegURL",
      "Cache-Control": "no-cache",
    },
  });
}

export async function loadSegment(request: Request): Promise<Response> {
  if (!config.ffmpegPath) {
    return new Response("No path configured for ffmpeg", {
      status: 400,
    });
  }

  // this expects a request url of the form
  // segment://handle/videoStreamId/audioStreamId/segmentId
  const protocol = "segment://";
  if (!request.url.startsWith(protocol)) {
    return new Response("bad request", {
      status: 400,
    });
  }

  const url = request.url.slice(protocol.length);
  const selector = parseSelector(url);

  if (!selector.handle || selector.segment === undefined) {
    return new Response("unknown handle", {
      status: 400,
    });
  }

  const fileDetails: FileDetails = getFileDetails(selector.handle);

  // the segment list is based on the video stream
  const stream: StreamDetails | undefined = fileDetails.streams?.find(
    (s) => s.id === selector.video,
  );

  if (!stream) {
    return new Response("unknown stream", {
      status: 400,
    });
  }

  if (
    !stream.segmentBoundaries ||
    selector.segment >= stream.segmentBoundaries.length ||
    selector.segment < 0
  ) {
    return new Response("segment not found", {
      status: 400,
    });
  }

  const segmentStart: number =
    selector.segment === 0 ? 0 : stream.segmentBoundaries[selector.segment - 1];
  const segmentEnd: number = stream.segmentBoundaries[selector.segment];

  const filepath = getFileDetails(selector.handle).path;
  const ffmpegpath = path.join(config.ffmpegPath, "ffmpeg.exe");

  const result = await runProcess(ffmpegpath, [
    "-nostats",
    "-hide_banner",
    "-loglevel",
    "warning",
    "-ss",
    segmentStart.toFixed(4),
    "-to",
    segmentEnd.toFixed(4),
    "-i",
    filepath,
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-ac",
    "2",
    "-map",
    `0:${selector.video}`,
    "-map",
    `0:${selector.audio}`,
    "-fflags",
    "+genpts",
    "-start_at_zero",
    "-copyts",
    "-muxdelay",
    "0",
    "-f",
    "mpegts",
    "pipe:1",
  ]);

  return new Response(new Uint8Array(result.output), {
    headers: {
      "content-type": "video/MP2T",
      "Cache-Control": "no-cache",
    },
  });
}
