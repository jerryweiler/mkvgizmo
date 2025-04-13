<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import CurrentDirectory from "./current-directory.svelte";
  import { changeCurrentDirectory } from "./state/current-directory.svelte";
  import type { NavItem } from "./state/navigation-items.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { getCurrentFile, setCurrentFile } from "./state/current-file.svelte";
  import { cn } from "$lib/utils";

  export let navItems: { items: NavItem[] };
</script>

<div class="flex h-full flex-col">
  <div class="m-2 grow-0">
    <CurrentDirectory />
  </div>
  <ScrollArea class="p-2 grow-1">
    <div class="flex flex-col gap-4">
      <div class="grid gap-1">
        {#each navItems.items as item}
          <Button
            href="#"
            variant="outline"
            size="sm"
            class={cn(
              "justify-start min-w-0 mr-1",
              item.name === getCurrentFile() && "bg-muted",
            )}
            on:click={async (): Promise<void> => {
              if (item.isDirectory) {
                await changeCurrentDirectory(item.name);
              } else {
                setCurrentFile(item.name);
              }
            }}
            title={item.name}
          >
            <div class="flex w-full">
              {#key navItems.items}
                <item.icon class="mr-2 size-4 shrink-0" aria-hidden="true" />
              {/key}
              <!-- note: since there's an element between the span and the nearest flex-box
             child ancestor, we need the parent of the span (the button) to have a min-width
             attribute for width of the span to be calculated properly.
             see https://css-tricks.com/flexbox-truncated-text/ -->
              <span class="truncate">{item.name}</span>
            </div>
          </Button>
        {/each}
      </div>
    </div>
  </ScrollArea>
</div>
