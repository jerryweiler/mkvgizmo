import { type Icon as IconType } from "@lucide/svelte";

export type StreamDetails = {
  id: number;
  type: string;
  codec: string;
  size: number;
  language: string | null;
  forced?: boolean;
  dimensions?: string;
  channels?: number;
  icon: typeof IconType;
  rawKeyFrames?: string;
  keyFrames?: number[];
};
