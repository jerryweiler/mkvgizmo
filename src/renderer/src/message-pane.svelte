<script lang="ts">
  import { ScrollArea } from "$lib/components/ui/scroll-area";

  export let logger: { messages: string[] };
</script>

<div class=" flex w-full h-full font-mono">
  <ScrollArea class="p-2 w-full grow-1">
    {#each logger.messages as message}
      <span>{message}<br /></span>
    {/each}
  </ScrollArea>
</div>
