<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import Input from "$lib/components/ui/input/input.svelte";
  import { Label } from "$lib/components/ui/label";
  import { FolderSearch, Settings } from "@lucide/svelte";
  import {
    getFfmpegPath,
    getStartingPath,
    saveConfig,
  } from "./state/config.svelte";

  let ffmpegPath;
  let startingPath;
  let open = false;

  function openDialog(): void {
    ffmpegPath = getFfmpegPath();
    startingPath = getStartingPath();
    open = true;
  }

  async function save(): Promise<void> {
    if (await saveConfig({ ffmpegPath, startingPath })) {
      open = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button on:click={(): void => openDialog()}>
      <Settings class="size-4" aria-hidden="true" />
    </Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Config</Dialog.Title>
      <Dialog.Description>
        Enter desired configuration values
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-8 items-center gap-4">
        <div class="col-span-8">
          Set the directory that contains ffmpeg.exe and ffprobe.exe
        </div>
        <Label for="ffmpeg" class="col-span-2 text-right">FFmpeg Path</Label>
        <Input id="ffmpeg" class="col-span-5" bind:value={ffmpegPath} />
        <Button
          variant="secondary"
          on:click={async (): Promise<void> => {
            ffmpegPath = await window.api.chooseDirectory();
          }}
        >
          <FolderSearch class="size-4" aria-hidden="true" />
        </Button>
        <div class="col-span-8">Set the directory to be used on startup</div>
        <Label for="startup" class="col-span-2 text-right">Startup Path</Label>
        <Input id="startup" class="col-span-5" bind:value={startingPath} />
        <Button
          variant="secondary"
          on:click={async (): Promise<void> => {
            startingPath = await window.api.chooseDirectory();
          }}
        >
          <FolderSearch class="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={(): Promise<void> => save()}>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
