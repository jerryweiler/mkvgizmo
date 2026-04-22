<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import CurrentFile from "./current-file.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { selectedFile } from "./state/current-file.svelte";
  import StreamDetail from "./stream-detail.svelte";
  import {
    FileHeadphone,
    FilePlay,
    FileText,
    FileVideoCamera,
  } from "@lucide/svelte";
  import { Toggle } from "$lib/components/ui/toggle";
  import StreamKeyFrame from "./stream-key-frame.svelte";
  import { setContext } from "svelte";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import Button from "$lib/components/ui/button/button.svelte";

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

  interface Props {
    currentFileStreams: StreamDetails[];
    displayVideo?: boolean;
    displayAudio?: boolean;
    displaySubtitles?: boolean;
  }

  let {
    currentFileStreams,
    displayVideo = true,
    displayAudio = true,
    displaySubtitles = true,
  }: Props = $props();

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
        {#each currentFileStreams as stream (stream.key)}
          {#if displayVideo && stream.type === "video"}
            <Tabs.Trigger value={stream.id.toString()}>
              {#if !stream.keyFramesComplete}
                <Spinner />
              {/if}
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
        <FileVideoCamera class="size-4" aria-hidden="true" />
      </Toggle>
      <Toggle
        variant="outline"
        title="Display Audio Streams"
        class="mx-1 my-2 grow-0"
        bind:pressed={displayAudio}
      >
        <FileHeadphone class="size-4" aria-hidden="true" />
      </Toggle>
      <Toggle
        variant="outline"
        title="Display Subtitle Streams"
        class="mx-1 my-2 grow-0"
        bind:pressed={displaySubtitles}
      >
        <FileText class="size-4" aria-hidden="true" />
      </Toggle>
      <Button
        variant="outline"
        onclick={(): void => {
          if (selectedFile.handle) window.api.openPreview(selectedFile.handle);
        }}
        class="mx-1 my-2 grow-0"
        title="Preview"
      >
        <FilePlay class="size-4" aria-hidden="true" />
      </Button>
      <div class="mr-2"></div>
    </div>
    <ScrollArea class="pr-3 m-2 overflow-hidden">
      <Tabs.Content value="details">
        <div class="flex flex-col gap-2 pt-0">
          {#each currentFileStreams as stream (stream.key)}
            {#if shouldDisplayStream(stream)}
              <StreamDetail {stream} />
            {/if}
          {/each}
        </div>
      </Tabs.Content>
      <Tabs.Content value="raw">
        <div class="w-full whitespace-pre-wrap font-mono">
          {#key currentFileStreams}
            {selectedFile.details}
          {/key}
        </div>
      </Tabs.Content>
      {#each currentFileStreams as stream (stream.key)}
        {#if displayVideo && stream.type === "video"}
          <Tabs.Content value={stream.id.toString()}>
            <div class="flex flex-col gap-2 pt-0">
              {#each stream.keyFrames as pts_time (pts_time)}
                <StreamKeyFrame
                  handle={selectedFile.handle}
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
