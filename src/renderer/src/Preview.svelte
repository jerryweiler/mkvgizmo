<script lang="ts">
  import Hls from "hls.js";
  import { onMount } from "svelte";
  import { selectedFile } from "./state/current-file.svelte";

  let videoStream: number = $state(0);
  let audioStream: number | undefined = $state(undefined);

  async function startPreview(): Promise<void> {
    const handle = await window.api.getPreviewHandle();

    // We're in a separate process from the main window, so the selected
    // file in the navigation list isn't visible to us and we need to set
    // it again. Set the instance in this process so we get stream details.
    await selectedFile.set("", handle, false);

    videoStream = selectedFile.streams.find((s) => s.type === "video").id;
    audioStream = selectedFile.streams.find((s) => s.type === "audio")?.id;
    if (audioStream === undefined) return;

    var video = document.getElementById("video") as HTMLVideoElement;
    if (!video) return;

    video.onloadeddata = () => video.play();

    var videoSrc = `playlist://h${handle}/v${videoStream}/a${audioStream}`;
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

    video.controls = true;
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
    <h2>Bottom Row (Fixed Height)</h2>
  </div>
</div>
