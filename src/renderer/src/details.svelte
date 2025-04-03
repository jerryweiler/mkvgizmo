<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import CurrentFile from "./current-file.svelte";
  import type { NavItem } from "./state/navigation-items.svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { getFileDetails } from "./state/current-file.svelte";

  export let activeFile: NavItem;
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
          {#each activeFile.details as detail}
            <button
              class="hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all"
            >
              <div class="flex w-full flex-col gap-1">
                <div class="flex items-center">
                  <div class="flex items-center gap-2 font-semibold">
                    <svelte:component
                      this={detail.icon}
                      class="mr-2 size-4"
                      aria-hidden="true"
                    />
                    {detail.type}
                  </div>
                  <div class="ml-auto text-xs">
                    {detail.streamid}
                  </div>
                </div>
                <div class="text-xs font-medium">{detail.language}</div>
              </div>
            </button>
          {/each}
        </div>
      </Tabs.Content>
      <Tabs.Content value="raw">
        {getFileDetails()}
      </Tabs.Content>
    </ScrollArea>
  </div>
</Tabs.Root>
