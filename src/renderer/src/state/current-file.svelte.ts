import { getCurrentDirectory } from "./current-directory.svelte";
import type { StreamDetails } from "./navigation-items.svelte";
import { FileAudio, FileQuestion, FileText, FileVideo } from "@lucide/svelte";

const currentFile = $state({
  name: undefined,
  details: undefined,
  streams: [],
});

function extractStreamDetails(raw): StreamDetails {
  let icon = FileQuestion;
  let language = "";
  switch (raw.codec_type) {
    case "audio":
      icon = FileAudio;
      language = raw?.tags?.language;
      break;
    case "video":
      icon = FileVideo;
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

export function getCurrentFile(): string | undefined {
  return currentFile.name;
}

export function getFileDetails(): string | undefined {
  return currentFile.details;
}

export function getFileStreams(): StreamDetails[] {
  return currentFile.streams;
}

export async function setCurrentFile(filename: string): Promise<void> {
  currentFile.name = filename;

  const details = await window.api.getMkvDetails(
    getCurrentDirectory(),
    getCurrentFile(),
  );

  const streams = JSON.parse(details);
  currentFile.streams = streams.streams.map(extractStreamDetails);

  // getMkvDetails returns JSON in a minimized, hard to read format.
  // re-generate a more readable version for the RAW display
  currentFile.details = JSON.stringify(streams, null, 2);
}

export function clearCurrentFile(): void {
  currentFile.name = undefined;
  currentFile.details = undefined;
  currentFile.streams = [];
}
