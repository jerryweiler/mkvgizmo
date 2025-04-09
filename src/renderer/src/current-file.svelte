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
    class="justify-start grow mr-1"
    title={getCurrentFile() ?? defaultText}
  >
    {#if getCurrentFile()}
      <FileVideo class="mr-2 size-4" aria-hidden="true" />
    {/if}
    {getCurrentFile() ?? defaultText}
  </Button>
</div>
