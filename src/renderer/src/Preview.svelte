<script lang="ts">
  import Hls from "hls.js";
  import { onMount } from "svelte";

  onMount(() => {
    var video = document.getElementById("video") as HTMLVideoElement;
    if (!video) return;

    video.onloadeddata = () => video.play();

    var videoSrc = "playlist://1/0/1";
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
  });
</script>

<div class="w-screen h-screen">
  <video id="video"></video>
</div>
