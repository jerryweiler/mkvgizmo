<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import CurrentFile from "./current-file.svelte";
  import type { StreamDetails } from "./state/navigation-items.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { getFileDetails } from "./state/current-file.svelte";
  import StreamDetail from "./stream-detail.svelte";
  import { FileAudio, FileText, FileVideo } from "@lucide/svelte";
  import { Toggle } from "$lib/components/ui/toggle";

  export let currentFileStreams: StreamDetails[];
  export let displayVideo: boolean = true;
  export let displayAudio: boolean = true;
  export let displaySubtitles: boolean = true;

  function shouldDisplayStream(stream: StreamDetails): boolean {
    switch (stream.type) {
      case "video":
        return displayVideo;
      case "audio":
        return displayAudio;
      case "subtitle":
        return displaySubtitles;
      default:
        return false;
    }
  }
</script>

<Tabs.Root class="h-full">
  <div class="grid grid-rows-[auto_auto_minmax(0,1fr)] w-full h-full">
    <div class="m-2">
      <CurrentFile />
    </div>
    <div class="flex w-full">
      <Tabs.List class="m-2 grid grid-cols-2 w-full grow-1">
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
        <Tabs.Trigger value="raw">Raw</Tabs.Trigger>
      </Tabs.List>
      <Toggle
        variant="outline"
        title="Display Video Streams"
        class="mx-1 my-2 grow-0"
        bind:pressed={displayVideo}
      >
        <FileVideo class="size-4" aria-hidden="true" />
      </Toggle>
      <Toggle
        variant="outline"
        title="Display Audio Streams"
        class="mx-1 my-2 grow-0"
        bind:pressed={displayAudio}
      >
        <FileAudio class="size-4" aria-hidden="true" />
      </Toggle>
      <Toggle
        variant="outline"
        title="Display Subtitle Streams"
        class="mx-1 my-2 grow-0"
        bind:pressed={displaySubtitles}
      >
        <FileText class="size-4" aria-hidden="true" />
      </Toggle>
      <div class="mr-2"></div>
    </div>
    <ScrollArea class="m-2">
      <Tabs.Content value="details">
        <div class="flex flex-col gap-2 pt-0">
          {#each currentFileStreams as stream}
            {#if shouldDisplayStream(stream)}
              <StreamDetail {stream} />
            {/if}
          {/each}
        </div>
      </Tabs.Content>
      <Tabs.Content value="raw">
        <div class="w-full whitespace-pre-wrap font-mono">
          {getFileDetails()}
        </div>
      </Tabs.Content>
    </ScrollArea>
  </div>
</Tabs.Root>
