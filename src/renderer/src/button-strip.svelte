<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FolderSearch } from "@lucide/svelte";
  import { workingDir } from "./state/current-directory.svelte";
  import Config from "./config.svelte";
  import { tick } from "svelte";
  import { setInitialFocus } from "./state/focus.svelte";
</script>

<div class="flex-none">
  <div class="m-1 py-1">
    <Button
      id="chooseDir"
      onclick={async (): Promise<void> => {
        await workingDir.set(await window.api.chooseDirectory());
        tick();
        setInitialFocus();
      }}
      title="Choose Directory"
    >
      <FolderSearch class="size-4" aria-hidden="true" />
    </Button>
  </div>
  <div class="m-1">
    <Config />
  </div>
</div>
