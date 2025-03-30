<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FolderSearch, Settings } from "@lucide/svelte";
  import { setCurrentDirectory } from "./assets/data.svelte";
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
    <Button>
      <svelte:component this={Settings} class="size-4" aria-hidden="true" />
    </Button>
  </div>
</div>
