<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import CurrentDirectory from "./current-directory.svelte";
  import { workingDir } from "./state/current-directory.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import { selectedFile } from "./state/current-file.svelte";
  import { cn } from "$lib/utils";
</script>

<div class="flex h-full flex-col">
  <div class="m-2 grow-0">
    <CurrentDirectory />
  </div>
  <ScrollArea class="p-2 grow overflow-hidden">
    <div class="flex flex-col gap-4">
      <div class="grid gap-1">
        {#each workingDir.children as item (item.name)}
          <Button
            href="#"
            variant="outline"
            size="sm"
            class={cn(
              "justify-start min-w-0 mr-1",
              item.name === selectedFile.name && "bg-muted",
            )}
            onclick={async (): Promise<void> => {
              if (item.isDirectory) {
                await workingDir.navigate(item.name);
              } else {
                selectedFile.set(item.name, item.handle);
              }
            }}
            title={item.name}
          >
            <div class="flex w-full">
              {#key item.name}
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
