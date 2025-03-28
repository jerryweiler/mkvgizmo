<script lang="ts">
  import { Button } from "./lib/components/ui/button";
  import DirPicker from "./dirPicker.svelte";
  import { changeCurrentDirectory, type NavItem } from "./assets/data.svelte";

  export let navItems: { items: NavItem[] };
</script>

<div class="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
  <nav
    class="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"
  >
    <DirPicker />
    {#each navItems.items as item}
      <Button
        href="#"
        variant="outline"
        size="sm"
        class="justify-start dark:bg-muted dark:hover:bg-muted dark:text-white dark:hover:text-white"
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
  </nav>
</div>
