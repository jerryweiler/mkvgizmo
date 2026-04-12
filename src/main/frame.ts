import path from "path";
import { config } from "./configApis";
import { getFileDetails } from "./fileCache";
import { runProcess } from "./processUtils";

export async function captureFrame(request: Request): Promise<Response> {
  if (!config.ffmpegPath) {
    return new Response("No path configured for ffmpeg", {
      status: 400
    });
  }

  // this expects a request url of the form frame://handle/streamid/timestamp
  // where timestamp is a number representing the seconds from the beginning of
  // the stream
  const protocol = "frame://";
  if (!request.url.startsWith(protocol)) {
    return new Response("bad request", {
      status: 400
    });
  }

  const url = request.url.slice(protocol.length);
  const parts = url.split("/");

  if (parts.length !== 3) {
    return new Response("bad request", {
      status: 400
    });
  }

  let [handle, streamid, timestamp] = parts.map(p => parseFloat(p));

  const filepath = getFileDetails(handle).path;
  const ffmpegpath = path.join(config.ffmpegPath, "ffmpeg.exe");

  const result = await runProcess(ffmpegpath, [
    "-ss",
    timestamp.toString(),
    "-i",
    filepath,
    "-map",
    `0:v:${streamid}`,
    "-vframes",
    "1",
    "-vcodec",
    "png",
    "-f",
    "image2pipe",
    "-"
  ]);

  return new Response(new Uint8Array(result.output), {
    headers: {
      'content-type': 'image/png'
    }
  });
}
