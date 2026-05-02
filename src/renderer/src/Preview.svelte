<script lang="ts">
  import Hls from "hls.js";
  import { onMount } from "svelte";
  import { selectedFile } from "./state/current-file.svelte";
  import StreamSelector from "./stream-selector.svelte";
  import { getIcon } from "./state/utils.mjs";
  import { ChevronLeft, ChevronRight } from "@lucide/svelte";
  import Button from "$lib/components/ui/button/button.svelte";

  let handle: number = $state(0);
  let videoStream: number = $state(0);
  let audioStream: number | undefined = $state(undefined);
  let subtitleStream: number | undefined = $state(undefined);
  let chapterIndex: number = $state(-1);

  let chapterTitle: string = $derived.by(() => {
    if (chapterIndex === -1) {
      return "No Chapters";
    }

    return selectedFile.chapters[chapterIndex].title;
  });

  // Whenever one of the stream selections change, switch to the new playlist
  $effect(() => {
    if (!handle) return;

    var video = document.getElementById("video") as HTMLVideoElement;
    if (!video) return;

    video.onloadeddata = () => video.play();

    // if we're changing the streams during playback, save the
    // current playback time so we can restore it after changing
    // sources
    const currentTime = video.currentTime;

    let videoSrc: string = `playlist://h${handle}/v${videoStream}`;
    if (audioStream !== undefined) videoSrc += `/a${audioStream}`;
    if (subtitleStream !== undefined) videoSrc += `/s${subtitleStream}`;

    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    }
    // HLS.js is not supported on platforms that do not have Media Source
    // Extensions (MSE) enabled.
    //
    // When the browser has built-in HLS support (check using `canPlayType`),
    // we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video
    // element through the `src` property. This is using the built-in support
    // of the plain video element, without using HLS.js.
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
    }

    video.currentTime = currentTime;

    video.controls = true;
  });

  // This function updates the index of the currently-playing
  // chapter as the video plays. This will trigger updates of the
  // displayed chapter name via derived properties
  function updateChapter(): void {
    if (selectedFile.chapters.length === 0) {
      return;
    }

    // Initialize the chapter index the first time we're called
    if (chapterIndex === -1) {
      chapterIndex = 0;
    }

    var video = document.getElementById("video") as HTMLVideoElement;
    if (!video) return;

    const currentTime = video.currentTime;
    let currentChapter = selectedFile.chapters[chapterIndex];

    while (currentTime < currentChapter.startTime) {
      currentChapter = selectedFile.chapters[--chapterIndex];
    }

    while (currentTime > currentChapter.endTime) {
      currentChapter = selectedFile.chapters[++chapterIndex];
    }
  }

  function previousChapter(): void {
    var video = document.getElementById("video") as HTMLVideoElement;
    if (!video) return;

    if (selectedFile.chapters.length === 0) {
      video.currentTime = 0;
      return;
    }

    const currentTime = video.currentTime;
    let currentChapter = selectedFile.chapters[chapterIndex];

    // If we're more than a few seconds into a chapter, go back to the
    // beginning of the current one
    if (chapterIndex === 0 || currentTime >= currentChapter.startTime + 3) {
      video.currentTime = currentChapter.startTime;
      return;
    }

    currentChapter = selectedFile.chapters[--chapterIndex];
    video.currentTime = currentChapter.startTime;
  }

  function nextChapter(): void {
    var video = document.getElementById("video") as HTMLVideoElement;
    if (!video) return;

    if (selectedFile.chapters.length === 0) {
      video.currentTime = video.duration;
      return;
    }

    const currentTime = video.currentTime;
    let currentChapter = selectedFile.chapters[chapterIndex];

    // If the current chapter goes to the end of what's loaded,
    // jump the the end of what we have
    if (
      chapterIndex === selectedFile.chapters.length - 1 ||
      currentChapter.endTime >= video.duration
    ) {
      video.currentTime = video.duration;
      return;
    }

    // If we have more than a few seconds left in the current chapter,
    // just jump to the end of it
    if (currentTime <= currentChapter.endTime - 3) {
      video.currentTime = currentChapter.endTime;
      return;
    }

    currentChapter = selectedFile.chapters[++chapterIndex];
    video.currentTime = currentChapter.startTime;
  }

  async function startPreview(): Promise<void> {
    handle = await window.api.getPreviewHandle();

    // We're in a separate process from the main window, so the selected
    // file in the navigation list isn't visible to us and we need to set
    // it again. Set the instance in this process so we get stream details.
    await selectedFile.set("", handle, false);

    videoStream = selectedFile.streams.find((s) => s.type === "video").id;
    audioStream = selectedFile.streams.find((s) => s.type === "audio")?.id;

    var video = document.getElementById("video") as HTMLVideoElement;
    if (!video) return;

    video.addEventListener("timeupdate", updateChapter);
  }

  function getStreamOptions(
    type: string,
    allowUnselected: boolean,
  ): StreamDetails[] {
    let result = selectedFile.streams.filter((s) => s.type === type);
    if (allowUnselected) {
      result.unshift({
        id: undefined,
        codec: "",
        key: "",
        duration: 0,
        keyFramesComplete: true,
        language: "none",
        segmentBoundariesComplete: true,
        size: 0,
        type,
        icon: getIcon(type),
      });
    }
    return result;
  }

  onMount(() => {
    startPreview();
  });
</script>

<!-- grid fills the full window with 2 rows. bottom row (selectors) is fixed
 size, the top is the player and fills the remainder.
 overflow-auto keeps the player from overflowing into the selectors,
 while max-w/h-full causes the player to grow/shrink based on both directions
 to maintain aspect ratio -->
<div class="w-screen h-screen grid grid-rows-[1fr_1.5rem_2.5rem_2rem]">
  <div class="overflow-auto w-full h-full">
    <video class="max-w-full max-h-full" id="video"></video>
  </div>
  <div class="grid grid-cols-3 gap-x-3 items-stretch m-1">
    <span>Video</span>
    <span>Audio</span>
    <span>Subtitles</span>
  </div>
  <div class="grid grid-cols-3 gap-x-3 items-stretch">
    <StreamSelector
      bind:value={videoStream}
      options={getStreamOptions("video", false)}
    />
    <StreamSelector
      bind:value={audioStream}
      options={getStreamOptions("audio", true)}
    />
    <StreamSelector
      bind:value={subtitleStream}
      options={getStreamOptions("subtitle", true)}
    />
  </div>
  <div class="grid grid-cols-3 gap-x-3 items-stretch m-1">
    <div class="w-full flex justify-between">
      <Button variant="outline" class="h-6 w-6" onclick={previousChapter}>
        <ChevronLeft class="size-4" aria-hidden="true" />
      </Button>
      <div>{chapterTitle}</div>
      <Button variant="outline" class="h-6 w-6" onclick={nextChapter}>
        <ChevronRight class="size-4" aria-hidden="true" />
      </Button>
    </div>
  </div>
</div>
