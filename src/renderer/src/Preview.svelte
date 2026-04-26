<script lang="ts">
  import Hls from "hls.js";
  import { onMount } from "svelte";
  import { selectedFile } from "./state/current-file.svelte";
  import StreamSelector from "./stream-selector.svelte";
  import { getIcon } from "./state/utils.mjs";

  let handle: number = $state(0);
  let videoStream: number = $state(0);
  let audioStream: number | undefined = $state(undefined);
  let subtitleStream: number | undefined = $state(undefined);

  // Whenever one of the stream selections change, switch to the new playlist
  $effect(() => {
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

  async function startPreview(): Promise<void> {
    handle = await window.api.getPreviewHandle();

    // We're in a separate process from the main window, so the selected
    // file in the navigation list isn't visible to us and we need to set
    // it again. Set the instance in this process so we get stream details.
    await selectedFile.set("", handle, false);

    videoStream = selectedFile.streams.find((s) => s.type === "video").id;
    audioStream = selectedFile.streams.find((s) => s.type === "audio")?.id;
  }

  function getOptions(type: string, allowUnselected: boolean): StreamDetails[] {
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
        icon: getIcon(type)
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
<div class="w-screen h-screen grid grid-rows-[1fr_2rem]">
  <div class="overflow-auto w-full h-full">
    <video class="max-w-full max-h-full" id="video"></video>
  </div>
  <div>
    <StreamSelector
      bind:value={videoStream}
      options={getOptions("video", false)}
    />
    <StreamSelector
      bind:value={audioStream}
      options={getOptions("audio", true)}
    />
    <StreamSelector
      bind:value={subtitleStream}
      options={getOptions("subtitle", true)}
    />
  </div>
</div>
