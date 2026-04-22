import {
  FileHeadphone,
  FileQuestionMark,
  FileText,
  FileVideoCamera,
} from "@lucide/svelte";
import { logger } from "./logger.svelte";

// When a file is selected, we start loading metadata asynchronously. For a
// large file, like a 4k movie which can be 10s of GB, some of this metadata
// can take minutes to completely load. Each time we change the selected file,
// we increment the sequence number. When an async call to load metadata
// returns, we check the sequence number and abort if the value indicates that
// the user has navigated awayt.
let updateSequenceNumber: number = 0;

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
  #updateSequenceNumber: number = 0;

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
    this.#updateSequenceNumber = ++updateSequenceNumber;
    this.#handle = 0;
    this.#name = "";
    this.#details = "";
    this.#streams = [];
  }

  async set(
    filename: string,
    handle: number,
    loadKeyFrames: boolean = true,
  ): Promise<void> {
    this.#updateSequenceNumber = ++updateSequenceNumber;
    this.#name = filename;
    this.#handle = handle;

    const currentSequenceNumber = this.#updateSequenceNumber;

    const details = await window.api.getStreamList(handle);

    // if the user navigated away while the async call was processing, we're done
    if (this.#updateSequenceNumber !== currentSequenceNumber) {
      return;
    }

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

    if (loadKeyFrames) {
      // retrieving the keyframe list can take a while for a large file. do it last
      for (const stream of this.streams) {
        if (stream.type !== "video") continue;

        while (!stream.keyFramesComplete) {
          const keyFrameDetails = await window.api.getKeyFrameList(
            handle,
            stream.id,
          );

          // if the user navigated away while the async call was processing, we're done
          if (this.#updateSequenceNumber !== currentSequenceNumber) {
            return;
          }

          if (keyFrameDetails.errorMessage) {
            logger.add(
              `Error loading keyframe details for file ${filename} stream ${stream.id}:`,
            );
            for (const line of keyFrameDetails.errorMessage.split("\r\n")) {
              if (line) {
                logger.add(line);
              }
            }
          }

          stream.keyFrames = keyFrameDetails.timestamps;
          stream.keyFramesComplete = keyFrameDetails.isComplete;
        }
      }
    }
  }
}

export let selectedFile: FileDetails = new FileDetails();
