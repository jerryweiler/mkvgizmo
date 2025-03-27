<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FolderOpen, FolderSearch } from "@lucide/svelte";
  import {
    getCurrentDirectory,
    setCurrentDirectory,
  } from "./assets/data.svelte";
</script>

<div class="w-full flex">
  {#if getCurrentDirectory()}
    <Button
      href="#"
      variant="outline"
      size="sm"
      class="justify-start dark:bg-muted dark:hover:bg-muted dark:text-white dark:hover:text-white grow"
    >
      <svelte:component
        this={FolderOpen}
        class="mr-2 size-4"
        aria-hidden="true"
      />
      {getCurrentDirectory()}
    </Button>
    <Button
      href="#"
      variant="default"
      size="sm"
      class="justify-start dark:bg-muted dark:hover:bg-muted dark:text-white dark:hover:text-white"
      on:click={async (): Promise<void> => {
        setCurrentDirectory(await window.api.chooseDirectory());
      }}
    >
      <svelte:component
        this={FolderSearch}
        class="mr-2 size-4"
        aria-hidden="true"
      />
    </Button>
  {:else}
    <Button
      href="#"
      variant="default"
      size="sm"
      class="justify-start dark:bg-muted dark:hover:bg-muted dark:text-white dark:hover:text-white w-full"
      on:click={async (): Promise<void> => {
        setCurrentDirectory(await window.api.chooseDirectory());
      }}
    >
      <svelte:component
        this={FolderSearch}
        class="mr-2 size-4"
        aria-hidden="true"
      />
      Open Directory
    </Button>
  {/if}
</div>
