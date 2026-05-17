<script lang="ts">
  import { tick } from "svelte";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { CheckIcon } from "@lucide/svelte";
  import { filters } from "./state/filters.svelte";

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(): void {
    open = false;
    tick().then(() => {
      triggerRef.focus();
    });
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="outline"
        class="w-full justify-between"
        role="combobox"
        aria-expanded={open}
        id="languages"
      >
        {`Lang: ${filters.language}`}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-20 p-0">
    <Command.Root>
      <Command.List>
        <Command.Empty>All</Command.Empty>
        <Command.Group value="streams">
          {#each filters.languages as option (option)}
            <Command.Item
              value={option}
              onSelect={() => {
                filters.language = option;
                closeAndFocusTrigger();
              }}
            >
              {#if filters.language === option}
                <CheckIcon />
              {/if}
              {option}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
