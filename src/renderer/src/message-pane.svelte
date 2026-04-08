<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";
  import type { Logger } from "./state/logger.svelte";

  let { logger }: { logger: Logger } = $props();
</script>

<div class=" flex w-full h-full font-mono">
  <ScrollArea class="p-2 w-full grow overflow-hidden">
    {#each logger.messages as message (message.id)}
      <span>{message.line}<br /></span>
    {/each}
  </ScrollArea>
</div>
