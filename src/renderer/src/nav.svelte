<script lang="ts">
  import type { NavItem } from "./data";
  import { Button } from "./lib/components/ui/button";

  export let items: NavItem[];
</script>

<div
  class="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
>
  <nav
    class="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2"
  >
    {#each items as item}
      <Button
        href="#"
        variant="outline"
        size="sm"
        class="justify-start dark:bg-muted dark:hover:bg-muted dark:text-white dark:hover:text-white"
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


<!-- on:click={() => mailStore.setMail(item.id)} -->
