// Most of the interaction with the renderer deals with files that can be
// scattered across the filesystem. To make this interaction easier, we create
// a cache of file information and each file is assigned an id (handle) on
// first request.
// This eases 2 issues:
// 1. requests that are made with urls via protocol handlers only need to parse
//    an id, instead of parsing a file path out of a multi-component url.
// 2. some of the interaction, such as segmentation of the videos for HSL
//    streaming require state to be maintained across requests (keyframe data)
//    that's expensive to calculate, so we want to calculate it once and cache
//    it.

import path from "path";
import { ChapterDetails, StreamDetails } from "../preload";

export type FileDetails = {
  handle: number;
  path: string;
  rawDetails: string;
  streams?: StreamDetails[];
  chapters?: ChapterDetails[];
};

// A handle for a file is an index into this array
// We want newly-assigned handles to start at 1, so we add a dummy entry at 0
let fileCache: FileDetails[] = [{handle: 0, path: "", rawDetails: ""}];

let handleMap: Map<string, number> = new Map<string, number>();

export function getPathHandle(path: string): number {
  let handle = handleMap.get(path);
  if (!handle) {
    handle = fileCache.length;
    fileCache.push({handle, path, rawDetails: ""});
  }

  return handle;
}

export function getFileHandle(directory: string, filename: string): number {
  return getPathHandle(path.join(directory, filename));
}

export function getFileDetails(handle: number): FileDetails {
  return fileCache[handle];
}
