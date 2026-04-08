<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FolderOpen } from "@lucide/svelte";
  import { workingDir } from "./state/current-directory.svelte";

  const defaultText: string = "No Directory Selected";
</script>

<div class="w-full flex">
  <Button
    href="#"
    variant="secondary"
    size="sm"
    class="justify-start min-w-0 mr-1 grow"
    title={workingDir.get() ?? defaultText}
  >
    <div class="flex w-full">
      {#if workingDir.get()}
        <FolderOpen class="mr-2 size-4 shrink-0" aria-hidden="true" />
      {/if}
      <span class="truncate">{workingDir.get() ?? defaultText}</span>
    </div>
  </Button>
</div>
