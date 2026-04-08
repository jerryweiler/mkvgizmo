<script lang="ts">
  import CurrentDirectory from "./current-directory.svelte";
  import { workingDir } from "./state/current-directory.svelte";
  import ScrollArea from "$lib/components/ui/scroll-area/scroll-area.svelte";
  import NavigationItem from "./navigation-item.svelte";
</script>

<div class="flex h-full flex-col">
  <div class="m-2 grow-0">
    <CurrentDirectory />
  </div>
  <ScrollArea class="p-2 grow overflow-hidden">
    <div class="flex flex-col gap-4">
      <div class="grid gap-1">
        {#each workingDir.children as item (item.name)}
          <NavigationItem {item} />
        {/each}
      </div>
    </div>
  </ScrollArea>
</div>
