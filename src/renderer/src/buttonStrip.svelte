<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FolderSearch } from "@lucide/svelte";
  import { setCurrentDirectory } from "./assets/data.svelte";
  import Config from "./config.svelte";
</script>

<div class="flex-none">
  <div class="m-1 py-1">
    <Button
      on:click={async (): Promise<void> => {
        setCurrentDirectory(await window.api.chooseDirectory());
      }}
    >
      <svelte:component this={FolderSearch} class="size-4" aria-hidden="true" />
    </Button>
  </div>
  <div class="m-1">
    <Config />
  </div>
</div>
