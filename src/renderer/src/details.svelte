<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import CurrentFile from "./current-file.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { selectedFile } from "./state/current-file.svelte";
  import StreamDetail from "./stream-detail.svelte";
  import { FilePlay } from "@lucide/svelte";
  import StreamKeyFrame from "./stream-key-frame.svelte";
  import { setContext } from "svelte";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { filters } from "./state/filters.svelte";
  import Filters from "./filters.svelte";

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

  function multipleVideoStreams(): boolean {
    return selectedFile.streams.filter((s) => s.type === "video").length > 1;
  }
</script>

<Tabs.Root class="h-full" value="details">
  <div class="grid grid-rows-[auto_auto_minmax(0,1fr)] w-full h-full">
    <div class="m-2">
      <CurrentFile />
    </div>
    <div class="flex w-full">
      <Tabs.List class="m-2 grid auto-cols-fr grid-flow-col w-full grow">
        <Tabs.Trigger id="streamDetailTab" value="details">Details</Tabs.Trigger
        >
        <Tabs.Trigger id="streamRawTab" value="raw">Raw</Tabs.Trigger>
        {#each selectedFile.streams as stream (stream.key)}
          {#if filters.video && stream.type === "video"}
            <Tabs.Trigger
              id={`keyframeTab-${stream.id}`}
              value={stream.id.toString()}
            >
              {#if !stream.keyFramesComplete}
                <Spinner />
              {/if}
              {`KeyFrames ${multipleVideoStreams() ? stream.id.toString() : ""}`}
            </Tabs.Trigger>
          {/if}
        {/each}
      </Tabs.List>
      <Filters />
      <Button
        id="play"
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
          {#each selectedFile.streams as stream (stream.key)}
            {#if filters.shouldDisplayStream(stream)}
              <StreamDetail {stream} />
            {/if}
          {/each}
        </div>
      </Tabs.Content>
      <Tabs.Content value="raw">
        <div class="w-full whitespace-pre-wrap font-mono select-text">
          {#key selectedFile.streams}
            {selectedFile.details}
          {/key}
        </div>
      </Tabs.Content>
      {#each selectedFile.streams as stream (stream.key)}
        {#if filters.video && stream.type === "video"}
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
