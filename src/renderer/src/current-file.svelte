<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FileVideo } from "@lucide/svelte";
  import { getCurrentFile } from "./state/current-file.svelte";
</script>

<div class="w-full flex">
  <Button
    href="#"
    variant="secondary"
    size="sm"
    class="justify-start grow mr-1"
  >
    {#if getCurrentFile()}
      <svelte:component
        this={FileVideo}
        class="mr-2 size-4"
        aria-hidden="true"
      />
      {getCurrentFile()}
    {:else}
      No File Selected
    {/if}
  </Button>
</div>
