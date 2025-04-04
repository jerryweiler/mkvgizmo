<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FolderOpen } from "@lucide/svelte";
  import { getCurrentDirectory } from "./state/current-directory.svelte";
</script>

<div class="w-full flex">
  <Button
    href="#"
    variant="secondary"
    size="sm"
    class="justify-start grow mr-1"
  >
    {#if getCurrentDirectory()}
      <FolderOpen class="mr-2 size-4" aria-hidden="true" />
      {getCurrentDirectory()}
    {:else}
      No Directory Selected
    {/if}
  </Button>
</div>
