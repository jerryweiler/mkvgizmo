<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import Input from "$lib/components/ui/input/input.svelte";
  import { Label } from "$lib/components/ui/label";
  import { Settings } from "@lucide/svelte";
  import { getFfmpegPath, setFfmpegPath } from "./state/config.svelte";

  let pathvalue;
  let open = false;

  function openDialog(): void {
    pathvalue = getFfmpegPath();
    open = true;
  }

  async function saveConfig(): Promise<void> {
    if (await setFfmpegPath(pathvalue)) {
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
      <Dialog.Title>ffmpeg Config</Dialog.Title>
      <Dialog.Description>
        Enter the path of the directory that contains ffmpeg and ffprobe
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="path" class="text-right">Path</Label>
        <Input id="path" class="col-span-3" bind:value={pathvalue} />
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit" on:click={(): Promise<void> => saveConfig()}
        >Save</Button
      >
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
