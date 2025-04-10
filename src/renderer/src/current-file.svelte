<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FileVideo } from "@lucide/svelte";
  import { getCurrentFile } from "./state/current-file.svelte";

  const defaultText: string = "No File Selected";
</script>

<div class="w-full flex">
  <Button
    href="#"
    variant="secondary"
    size="sm"
    class="justify-start min-w-0 mr-1 grow"
    title={getCurrentFile() ?? defaultText}
  >
    <div class="flex w-full">
      {#if getCurrentFile()}
        <FileVideo class="mr-2 size-4 shrink-0" aria-hidden="true" />
      {/if}
      <span class="truncate">{getCurrentFile() ?? defaultText}</span>
    </div>
  </Button>
</div>
