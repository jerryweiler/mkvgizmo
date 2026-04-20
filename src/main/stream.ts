import { StreamDetails } from "../preload";
import { FileDetails, getFileDetails } from "./fileCache";

// chop the file up on keyframes into segments that are no longer than the
// target diration
const targetSegmentDuration: number = 8;

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

  // TODO: we should add one last segment from the last keyframe to the end of
  // the video. need the total duration for that.

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
  const parts = url.split("/");

  if (parts.length !== 3) {
    return new Response("bad request", {
      status: 400,
    });
  }

  let [handle, videoStreamid, audioStreamid] = parts.map((p) => parseInt(p));

  const fileDetails: FileDetails = getFileDetails(handle);

  // the segment list is based on the video stream
  const stream: StreamDetails | undefined = fileDetails.streams?.find(
    (s) => s.id == videoStreamid,
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
    lines.push(`#EXTINF:${(stream.segmentBoundaries[i] - segmentStart).toFixed(4)}`);
    lines.push(`segment://${handle}/${videoStreamid}/${audioStreamid}/${i}`);

    segmentStart = stream.segmentBoundaries[i];
  }

  lines.push("#EXT-X-ENDLIST");

  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text",
    },
  });
}
