<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { workingDir, type ChildItem } from "./state/current-directory.svelte";
  import { selectedFile } from "./state/current-file.svelte";
  import { cn } from "$lib/utils";
  import { formatSize } from "./state/utils.mjs";
  import { tick } from "svelte";
  import { setInitialFocus } from "./state/focus.svelte";
  import { streamUpdates, verifyAbandonChanges } from "./state/updates.svelte";
  import { FilePen } from "@lucide/svelte";

  let { item }: { item: ChildItem } = $props();
</script>

<Button
  id={`navItem-${item.handle}`}
  variant="outline"
  size="sm"
  class={cn(
    "justify-start min-w-0 mr-1",
    item.name === selectedFile.name && "bg-muted ml-3",
  )}
  onclick={async (): Promise<void> => {
    if (item.isDirectory) {
      if (!verifyAbandonChanges()) {
        return;
      }

      await workingDir.navigate(item.name);
      streamUpdates.clear();
      await tick();
      setInitialFocus();
    } else {
      await selectedFile.set(item.name, item.handle);
    }
  }}
  title={item.name}
>
  <div class="flex w-full text-left">
    {#if streamUpdates.fileHasUpdates(item.handle)}
      <FilePen
        class="mr-2 size-4 shrink-0"
        color="var(--color-red-500)"
        aria-hidden="true"
      />
    {:else}
      {#key item.name}
        <item.icon class="mr-2 size-4 shrink-0" aria-hidden="true" />
      {/key}
    {/if}
    <!-- note: since there's an element between the span and the nearest flex-box
    child ancestor, we need the parent of the span (the button) to have a min-width
    attribute for width of the span to be calculated properly.
    see https://css-tricks.com/flexbox-truncated-text/ -->
    <span class="truncate grow shrink">{item.name}</span>
    {#if !item.isDirectory}
      <span class="ml-auto text-xs shrink-0">
        &nbsp;{formatSize(item.size)}
      </span>
    {/if}
  </div>
</Button>
