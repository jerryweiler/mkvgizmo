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

// some ffmpeg functionality (ass/srt filters) require passing the stream
// id relative to the stream type, not the total number of streams.
function findSubtitleIndex(fileDetails: FileDetails, id: number): number {
  let result: number = 0;
  for (const stream of fileDetails.streams!) {
    if (stream.id === id) return result;
    if (stream.type === "subtitle") result++;
  }
  return -1;
}

function formatSegmentUrl(s: Selector, i: number) {
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

  // If the keyframes are not complete, remove the last segment, since it's
  // likely to change when we have more keyframes to coalesce. HLS requires
  // that segments not change once published.
  if (!stream.keyFramesComplete) {
    segmentList.pop();
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
    `#EXT-X-TARGETDURATION:${targetSegmentDuration}`,
    "#EXT-X-MEDIA-SEQUENCE:0",
  ];

  // If we haven't finished figuring out the segment list,
  // mark the playlist as an EVENT type, which is intended to mean that
  // the playlist represents a live event that new segments will be appended
  // to. The HLS player will then re-query the playlist periodically.
  if (!stream.segmentBoundariesComplete) {
    lines.push("#EXT-X-PLAYLIST-TYPE:EVENT");
    lines.push("#EXT-X-START:TIME-OFFSET=0");
  } else {
    lines.push("#EXT-X-PLAYLIST-TYPE:VOD");
  }

  // For each segment, add a duration and url
  let segmentStart: number = 0;
  for (let i = 0; i < stream.segmentBoundaries.length; i++) {
    lines.push(
      `#EXTINF:${(stream.segmentBoundaries[i] - segmentStart).toFixed(4)}`,
    );
    lines.push(formatSegmentUrl(selector, i));

    segmentStart = stream.segmentBoundaries[i];
  }

  if (stream.segmentBoundariesComplete) {
    lines.push("#EXT-X-ENDLIST");
  }

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

  // ffmpeg parameters need to be passed in order based on classification
  // (input, output, filters, etc). start with input parameters, then build
  // the stream selectors (which vary based on user selection), then add output
  // parameters
  let options: string[] = [
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
  ];

  // If we have subtitles, add them as an overlay over the video.
  // otherwise, just take the selected video
  if (selector.subtitle !== undefined) {
    // We want to overlay the subtitles on the video. How this is done depends
    // on the subtitle codec in use. To figure that out, we need the stream
    // metadata
    const subtitles: StreamDetails = fileDetails.streams?.find(
      (s) => s.id === selector.subtitle,
    )!;

    const escapedpath = filepath
      .replaceAll("\\", "\\\\")
      .replaceAll(":", "\\:");

    switch (subtitles.codec) {
      case "hdmv_pgs_subtitle":
      case "dvd_subtitle":
        // these are image-based subtitles
        options = [
          ...options,
          "-filter_complex",
          `[0:${selector.video}][0:${selector.subtitle}]overlay[o]`,
          "-map",
          "[o]",
        ];
        break;
      case "subrip":
        // text-based srt format
        options = [
          ...options,
          "-map",
          `0:${selector.video}`,
          "-ss",
          segmentStart.toFixed(4),
          "-vf",
          `subtitles='${escapedpath}':si=${findSubtitleIndex(fileDetails, selector.subtitle)}`,
        ];
        break;
      case "ass":
        // text-based Advanced Substation Alpha format
        options = [
          ...options,
          "-map",
          `0:${selector.video}`,
          "-ss",
          segmentStart.toFixed(4),
          "-vf",
          `ass='${escapedpath}':si=${findSubtitleIndex(fileDetails, selector.subtitle)}`,
        ];
        break;
    }
  } else {
    options = [...options, "-map", `0:${selector.video}`];
  }

  if (selector.audio !== undefined) {
    options = [...options, "-map", `0:${selector.audio}`];
  }

  options = [
    ...options,
    "-fflags",
    "+genpts",
    "-start_at_zero",
    "-copyts",
    "-muxdelay",
    "0",
    "-f",
    "mpegts",
    "pipe:1",
  ];

  const result = await runProcess(ffmpegpath, options);

  return new Response(new Uint8Array(result.output), {
    headers: {
      "content-type": "video/MP2T",
      "Cache-Control": "no-cache",
    },
  });
}
