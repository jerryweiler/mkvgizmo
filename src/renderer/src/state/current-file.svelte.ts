import { FileHeadphone, FileQuestionMark, FileText, FileVideoCamera } from "@lucide/svelte";
import { logger } from "./logger.svelte";

function updateIcon(stream: StreamDetails) {
  stream.icon = FileQuestionMark;
  switch (stream.type) {
    case "audio":
      stream.icon = FileHeadphone;
      break;
    case "video":
      stream.icon = FileVideoCamera;
      break;
    case "subtitle":
      stream.icon = FileText;
      break;
  }
}

export class FileDetails {
  #handle: number = $state(0);
  #name: string = $state("");
  #details: string = $state("");
  #streams: StreamDetails[] = $state([]);

  get handle(): number {
    return this.#handle;
  }

  get name(): string {
    return this.#name;
  }

  get details(): string {
    return this.#details;
  }

  get streams(): StreamDetails[] {
    return this.#streams;
  }

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

    this.#details = details.rawDetails;
    this.#streams = details.streams;

    for (const stream of this.streams) {
      updateIcon(stream);
    }

    // retrieving the keyframe list can take a while for a large file. do it last
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
