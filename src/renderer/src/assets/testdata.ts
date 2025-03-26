import * as Icons from "./icons";
import type { NavItem } from "../data";

export const TestData: NavItem[] = [
  {
    name: "..",
    icon: Icons.Folder,
    details: [],
  },
  {
    name: "Specials",
    icon: Icons.Folder,
    details: [],
  },
  {
    name: "Season1",
    icon: Icons.Folder,
    details: [],
  },
  {
    name: "Episode1.mkv",
    icon: Icons.FileVideo,
    details: [
      {
        type: "video",
        streamid: 1,
        language: null,
        icon: Icons.FileVideo,
      },
      {
        type: "audio",
        streamid: 2,
        language: "english",
        icon: Icons.FileAudio,
      },
      {
        type: "audio",
        streamid: 3,
        language: "japanese",
        icon: Icons.FileAudio,
      },
      {
        type: "subtitles",
        streamid: 4,
        language: "english",
        icon: Icons.FileText,
      },
      {
        type: "subtitles",
        streamid: 5,
        language: "english",
        icon: Icons.FileText,
      },
    ],
  },
  {
    name: "Episode2.mkv",
    icon: Icons.FileVideo,
    details: [
      {
        type: "video",
        streamid: 1,
        language: null,
        icon: Icons.FileVideo,
      },
      {
        type: "audio",
        streamid: 2,
        language: "english",
        icon: Icons.FileAudio,
      },
      {
        type: "audio",
        streamid: 3,
        language: "japanese",
        icon: Icons.FileAudio,
      },
      {
        type: "subtitles",
        streamid: 4,
        language: "english",
        icon: Icons.FileText,
      },
      {
        type: "subtitles",
        streamid: 5,
        language: "english",
        icon: Icons.FileText,
      },
    ],
  },
];

export const ActiveFile: NavItem = TestData[3];
