<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import CurrentFile from "./current-file.svelte";
  import type { StreamDetails } from "./state/navigation-items.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { getFileDetails } from "./state/current-file.svelte";

  export let currentFileStreams: StreamDetails[];

  function formatSize(bytes: number): string {
    let suffix: string = "";
    if (bytes > 1024) {
      suffix = " KB";
      bytes /= 1024;
    }
    if (bytes > 1024) {
      suffix = " MB";
      bytes /= 1024;
    }
    if (bytes > 1024) {
      suffix = " GB";
      bytes /= 1024;
    }

    return bytes.toFixed(2) + suffix;
  }

  function streamType(stream: StreamDetails): string {
    let result: string = stream.type;
    if (stream.language) {
      result += ` (${stream.language})`;
    }

    if (stream.forced) {
      result += " FORCED";
    }

    return result;
  }
</script>

<Tabs.Root>
  <div class="flex h-screen flex-col">
    <div class="m-2 grow-0 shrink-0">
      <CurrentFile />
    </div>
    <Tabs.List class="m-2 grid grid-cols-2 grow-0 shrink-0">
      <Tabs.Trigger value="details">Details</Tabs.Trigger>
      <Tabs.Trigger value="raw">Raw</Tabs.Trigger>
    </Tabs.List>
    <ScrollArea class="m-2 grow-1 shrink-1">
      <Tabs.Content value="details">
        <div class="flex flex-col gap-2 pt-0">
          {#each currentFileStreams as stream}
            <button
              class="hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all"
            >
              <div class="flex w-full flex-col gap-1">
                <div class="flex items-center">
                  <div class="flex items-center gap-2 font-semibold">
                    {#key currentFileStreams}
                      <stream.icon class="mr-2 size-4" aria-hidden="true" />
                    {/key}
                    {streamType(stream)}
                  </div>
                  <div class="ml-auto text-xs">
                    {`id ${stream.id}`}
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="text-xs font-medium">codec: {stream.codec}</div>
                  <div class="text-xs font-medium ml-auto">
                    size: {formatSize(stream.size)}
                  </div>
                </div>
                {#if stream.channels}
                  <div class="flex items-center">
                    <div class="text-xs font-medium">
                      channels: {stream.channels}
                    </div>
                  </div>
                {/if}
                {#if stream.dimensions}
                  <div class="flex items-center">
                    <div class="text-xs font-medium">
                      dimensions: {stream.dimensions}
                    </div>
                  </div>
                {/if}
              </div>
            </button>
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
