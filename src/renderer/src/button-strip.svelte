<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FolderSearch, Save } from "@lucide/svelte";
  import { workingDir } from "./state/current-directory.svelte";
  import Config from "./config.svelte";
  import { tick } from "svelte";
  import { setInitialFocus } from "./state/focus.svelte";
  import { streamUpdates, verifyAbandonChanges } from "./state/updates.svelte";
  import { selectedFile } from "./state/current-file.svelte";
</script>

<div class="flex-none">
  <div class="m-1 py-1">
    <Button
      id="chooseDir"
      onclick={async (): Promise<void> => {
        if (!verifyAbandonChanges()) {
          return;
        }

        await workingDir.set(await window.api.chooseDirectory());
        streamUpdates.clear();
        tick();
        setInitialFocus();
      }}
      title="Choose Directory"
    >
      <FolderSearch class="size-4" aria-hidden="true" />
    </Button>
  </div>
  <div class="m-1 py-1">
    <Config />
  </div>
  <div class="m-1 py-1">
    <Button
      id="save"
      title="Save Changes"
      disabled={streamUpdates.getAllUpdates().length === 0}
      onclick={async (): Promise<void> => {
        await streamUpdates.save();
        selectedFile.clear();
      }}
    >
      <Save />
    </Button>
  </div>
</div>
