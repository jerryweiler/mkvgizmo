import { ElectronAPI } from "@electron-toolkit/preload";
import { type Icon as IconType } from "@lucide/svelte";

declare global {
  type ScanDirectoryResult = {
    errorMessage?: string;
    directories: string[];
    files: { handle: number; name: string; size: number }[];
  };

  type GizmoConfig = {
    ffmpegPath?: string;
    startingPath?: string;
  };

  type SaveConfigResult = {
    success: boolean;
    errorMessage?: string;
  };

  type StreamDetails = {
    id: number;
    key: string;
    type: string;
    codec: string;
    size: number;
    duration: number;
    language: string | null;
    forced?: boolean;
    dimensions?: string;
    channels?: number;
    keyFrames?: number[];
    keyFrameSecondsLoaded?: number;
    keyFramesComplete: boolean;
    segmentBoundaries?: number[];
    segmentBoundariesComplete: boolean;
    icon?: typeof IconType;
  };

  type ChapterDetails = {
    startTime: number;
    endTime: number;
    title: string;
  };

  type GetFileMetadataResult = {
    errorMessage?: string;
    rawDetails: string;
    streams: StreamDetails[];
    chapters: ChapterDetails[];
  };

  type GetKeyFrameListResult = {
    errorMessage?: string;
    timestamps: number[];
    isComplete: boolean;
  };
}

interface API {
  chooseDirectory(): Promise<string | undefined>;
  scanDirectory(directory: string): Promise<ScanDirectoryResult>;
  joinPaths(basePath: string, relativePath: string): Promise<string>;
  loadConfig(): Promise<GizmoConfig>;
  saveConfig(update: GizmoConfig): Promise<SaveConfigResult>;
  getFileMetadata(handle: number): Promise<GetFileMetadataResult>;
  getKeyFrameList(
    handle: number,
    streamId: number,
  ): Promise<GetKeyFrameListResult>;
  openPreview(handle: number): void;
  getPreviewHandle(): Promise<number>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: API;
  }
}
