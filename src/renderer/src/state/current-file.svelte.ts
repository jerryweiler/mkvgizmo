import { logger } from "./logger.svelte";
import type { StreamDetails } from "./navigation-items.svelte";
import { FileHeadphone, FileQuestionMark, FileText, FileVideoCamera } from "@lucide/svelte";

export class FileDetails {
  #handle: number = $state(0);
  #name: string = $state("");
  #details: string = $state("");
  #streams: StreamDetails[] = $state([]);

  get handle(): number { return this.#handle; }
  get name(): string { return this.#name; }
  get details(): string { return this.#details; }
  get streams(): StreamDetails[] { return this.#streams; }

  clear(): void {
    this.#handle = 0;
    this.#name = "";
    this.#details = "";
    this.#streams = [];
  }

  async set(filename: string, handle: number): Promise<void> {
    this.#name = filename;
    this.#handle = handle;

    const details = await window.api.getStreamList(handle);

    if (details.errorMessage) {
      logger.add(`Error loading details for file ${filename}:`);
      for (const line of details.errorMessage.split("\r\n")) {
        if (line) {
          logger.add(line);
        }
      }
    }

    if (details.rawDetails) {
      const streams = JSON.parse(details.rawDetails);
      this.#streams = streams.streams.map(extractStreamDetails);

      // getStreamList returns JSON in a minimized, hard to read format.
      // re-generate a more readable version for the RAW display
      this.#details = JSON.stringify(streams, null, 2);
    } else {
      this.#streams = [];
      this.#details = "";
    }

    for (const stream of this.streams) {
      if (stream.type !== "video") continue;

      const keyFrameDetails = await window.api.getKeyFrameList(
        handle,
        stream.id
      );

      if (keyFrameDetails.errorMessage) {
        logger.add(`Error loading keyframe details for file ${filename} stream ${stream.id}:`);
        for (const line of keyFrameDetails.errorMessage.split("\r\n")) {
          if (line) {
            logger.add(line);
          }
        }
      }

      stream.rawKeyFrames = keyFrameDetails.rawDetails;
      stream.keyFrames = keyFrameDetails.timestamps;
    }
  }
}

export let selectedFile: FileDetails = new FileDetails();

function extractStreamDetails(raw): StreamDetails {
  let icon = FileQuestionMark;
  let language = "";
  switch (raw.codec_type) {
    case "audio":
      icon = FileHeadphone;
      language = raw?.tags?.language;
      break;
    case "video":
      icon = FileVideoCamera;
      break;
    case "subtitle":
      icon = FileText;
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
    type: raw?.codec_type,
    codec: raw?.codec_name,
    language,
    size,
    dimensions,
    channels,
    forced: raw.disposition.forced !== 0,
    icon,
  };
}
