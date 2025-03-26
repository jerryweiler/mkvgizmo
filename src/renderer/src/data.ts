import type { Icon as IconType } from "@lucide/svelte";

export type NavItem = {
  name: string;
  icon: typeof IconType;
  details: FileDetail[];
};

export type FileDetail = {
  type: string;
  streamid: number;
  language: string | null;
  icon: typeof IconType;
};
