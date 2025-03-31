<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import type { NavItem } from "./state/navigation-items.svelte";

  export let activeFile: NavItem;
</script>

<ScrollArea class="h-screen">
  <div class="flex flex-col gap-2 p-4 pt-0">
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
</ScrollArea>
