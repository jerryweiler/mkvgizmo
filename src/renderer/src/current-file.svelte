<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FilePlay } from "@lucide/svelte";
  import { selectedFile } from "./state/current-file.svelte";

  const defaultText: string = "No File Selected";
</script>

<div class="w-full flex">
  <Button
    href="#"
    variant="secondary"
    size="sm"
    class="justify-start min-w-0 mr-1 grow"
    title={selectedFile.name ?? defaultText}
  >
    <div class="flex w-full">
      {#if selectedFile.name}
        <FilePlay class="mr-2 size-4 shrink-0" aria-hidden="true" />
      {/if}
      <span class="truncate">{selectedFile.name ?? defaultText}</span>
    </div>
  </Button>
</div>
