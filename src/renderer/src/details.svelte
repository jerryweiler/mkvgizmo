<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import CurrentFile from "./current-file.svelte";
  import type { StreamDetails } from "./state/navigation-items.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { getFileDetails } from "./state/current-file.svelte";
  import StreamDetail from "./stream-detail.svelte";
  export let currentFileStreams: StreamDetails[];
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
            <StreamDetail {stream} />
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
