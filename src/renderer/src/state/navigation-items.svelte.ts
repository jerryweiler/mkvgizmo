import { type Icon as IconType } from "@lucide/svelte";

export type NavItem = {
  name: string;
  isDirectory: boolean;
  icon: typeof IconType;
  details: StreamDetails[];
};

export type StreamDetails = {
  id: number;
  type: string;
  codec: string;
  size: number;
  language: string | null;
  icon: typeof IconType;
};

export const navItems: { items: NavItem[] } = $state({ items: [] });
