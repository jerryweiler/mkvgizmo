<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import CurrentFile from "./current-file.svelte";
  import type { StreamDetails } from "./state/navigation-items.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import {
    getCurrentHandle,
    getFileDetails,
  } from "./state/current-file.svelte";
  import StreamDetail from "./stream-detail.svelte";
  import { FileAudio, FileText, FileVideo } from "@lucide/svelte";
  import { Toggle } from "$lib/components/ui/toggle";
  import StreamKeyFrame from "./stream-key-frame.svelte";
  import { setContext } from "svelte";

  function observerCallback(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver,
  ): void {
    for (let entry of entries) {
      let event = new CustomEvent("visibility", {
        detail: {
          entry: entry,
          observer: observer,
        },
      });
      entry.target.dispatchEvent(event);
    }
  }

  let observer = new IntersectionObserver(observerCallback);
  setContext("visibility-observer", observer);

  export let currentFileStreams: StreamDetails[];
  export let displayVideo: boolean = true;
  export let displayAudio: boolean = true;
  export let displaySubtitles: boolean = true;

  function multipleVideoStreams(): boolean {
    return currentFileStreams.filter((s) => s.type === "video").length > 1;
  }

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

<Tabs.Root class="h-full" value="details">
  <div class="grid grid-rows-[auto_auto_minmax(0,1fr)] w-full h-full">
    <div class="m-2">
      <CurrentFile />
    </div>
    <div class="flex w-full">
      <Tabs.List class="m-2 grid auto-cols-fr grid-flow-col w-full grow">
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
        <Tabs.Trigger value="raw">Raw</Tabs.Trigger>
        {#each currentFileStreams as stream}
          {#if displayVideo && stream.type === "video"}
            <Tabs.Trigger value={stream.id.toString()}>
              {`KeyFrames ${multipleVideoStreams() ? stream.id.toString() : ""}`}
            </Tabs.Trigger>
          {/if}
        {/each}
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
    <ScrollArea class="m-2 overflow-hidden">
      <Tabs.Content value="details">
        <div class="flex flex-col gap-2 pt-0">
          {#key displayAudio && displaySubtitles && displayVideo}
            {#each currentFileStreams as stream}
              {#if shouldDisplayStream(stream)}
                <StreamDetail {stream} />
              {/if}
            {/each}
          {/key}
        </div>
      </Tabs.Content>
      <Tabs.Content value="raw">
        <div class="w-full whitespace-pre-wrap font-mono">
          {#key currentFileStreams}
            {getFileDetails()}
          {/key}
        </div>
      </Tabs.Content>
      {#each currentFileStreams as stream}
        {#if displayVideo && stream.type === "video"}
          <Tabs.Content value={stream.id.toString()}>
            <div class="flex flex-col gap-2 pt-0">
              {#each stream.keyFrames as pts_time}
                <StreamKeyFrame
                  handle={getCurrentHandle()}
                  streamid={stream.id}
                  {pts_time}
                />
              {/each}
            </div>
          </Tabs.Content>
        {/if}
      {/each}
    </ScrollArea>
  </div>
</Tabs.Root>
