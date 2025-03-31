import { FileAudio, FileText, FileVideo } from "@lucide/svelte";
import type { NavItem } from "../state/navigation-items.svelte";

export const ActiveFile: NavItem = {
  name: "Episode1.mkv",
  icon: FileVideo,
  details: [
    {
      type: "video",
      streamid: 1,
      language: null,
      icon: FileVideo,
    },
    {
      type: "audio",
      streamid: 2,
      language: "english",
      icon: FileAudio,
    },
    {
      type: "audio",
      streamid: 3,
      language: "japanese",
      icon: FileAudio,
    },
    {
      type: "subtitles",
      streamid: 4,
      language: "english",
      icon: FileText,
    },
    {
      type: "subtitles",
      streamid: 5,
      language: "english",
      icon: FileText,
    },
  ],
};
