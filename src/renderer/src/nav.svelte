<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import DirPicker from "./dirPicker.svelte";
  import { changeCurrentDirectory, type NavItem } from "./assets/data.svelte";
  import ScrollArea from "./lib/components/ui/scroll-area/scroll-area.svelte";

  export let navItems: { items: NavItem[] };
</script>

<div class="flex h-screen flex-col">
  <div class="px-2 py-2 mb-2 grow-0">
    <DirPicker />
  </div>
  <ScrollArea class="grow-1">
    <div class="flex flex-col gap-4 py-2">
      <div class="grid gap-1 px-2">
        {#each navItems.items as item}
          <Button
            href="#"
            variant="outline"
            size="sm"
            class="justify-start truncate mr-1"
            on:click={async (): Promise<void> => {
              if (item.isDirectory) {
                await changeCurrentDirectory(item.name);
              }
            }}
          >
            <svelte:component
              this={item.icon}
              class="mr-2 size-4"
              aria-hidden="true"
            />
            {item.name}
          </Button>
        {/each}
      </div>
    </div>
  </ScrollArea>
</div>
