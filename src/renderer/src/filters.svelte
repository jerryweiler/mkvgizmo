<script>
  import { Toggle } from "$lib/components/ui/toggle";
  import { FileHeadphone, FileText, FileVideoCamera } from "@lucide/svelte";
  import { filters } from "./state/filters.svelte";
  import LanguageSelector from "./language-selector.svelte";
</script>

<div class="flex">
  <Toggle
    id="toggleVideo"
    variant="outline"
    title="Display Video Streams"
    class="mx-1 my-2 grow-0 data-[state=off]:*:[svg]:stroke-gray-300"
    bind:pressed={
      () => filters.video,
      (pressed) => {
        filters.video = pressed;
      }
    }
  >
    <FileVideoCamera class="size-4" aria-hidden="true" />
  </Toggle>
  <Toggle
    id="toggleAudio"
    variant="outline"
    title="Display Audio Streams"
    class="mx-1 my-2 grow-0 data-[state=off]:*:[svg]:stroke-gray-300"
    bind:pressed={
      () => filters.audio,
      (pressed) => {
        filters.audio = pressed;
      }
    }
  >
    <FileHeadphone class="size-4" aria-hidden="true" />
  </Toggle>
  <Toggle
    id="toggleSubs"
    variant="outline"
    title="Display Subtitle Streams"
    class="mx-1 my-2 grow-0 data-[state=off]:*:[svg]:stroke-gray-300"
    bind:pressed={
      () => filters.subtitles,
      (pressed) => {
        filters.subtitles = pressed;
      }
    }
  >
    <FileText class="size-4" aria-hidden="true" />
  </Toggle>
  <div class="mx-1 my-2 grow-0 items-stretch">
    <LanguageSelector />
  </div>
</div>
