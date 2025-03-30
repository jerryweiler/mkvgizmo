<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FolderOpen } from "@lucide/svelte";
  import { getCurrentDirectory } from "./assets/data.svelte";
</script>

<div class="w-full flex">
  <Button
    href="#"
    variant="secondary"
    size="sm"
    class="justify-start dark:bg-muted dark:hover:bg-muted dark:text-white dark:hover:text-white grow mr-1"
  >
    {#if getCurrentDirectory()}
      <svelte:component
        this={FolderOpen}
        class="mr-2 size-4"
        aria-hidden="true"
      />
      {getCurrentDirectory()}
    {:else}
      No Directory Selected
    {/if}
  </Button>
</div>
