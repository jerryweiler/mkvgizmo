<script lang="ts">
  import { tick } from "svelte";
  import * as Command from "$lib/components/ui/command/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { CheckIcon, ChevronsUpDownIcon } from "@lucide/svelte";

  let {
    value = $bindable(),
    options,
  }: { value: number; options: StreamDetails[] } = $props();

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);

  const selectedValue: StreamDetails = $derived(
    options.find((f) => f.id === value),
  );

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
        class="w-full justify-between m-0.5"
        role="combobox"
        aria-expanded={open}
      >
        {#if selectedValue}
          <selectedValue.icon class="mr-1 size-4 shrink-0" aria-hidden="true" />
          {selectedValue.id}
          {selectedValue.language}
        {/if}
        <ChevronsUpDownIcon class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-50 p-0">
    <Command.Root>
      <Command.List>
        <Command.Empty>No streams found.</Command.Empty>
        <Command.Group value="streams">
          {#each options as option (option.key)}
            <Command.Item
              value={option.id?.toString()}
              onSelect={() => {
                value = option.id;
                closeAndFocusTrigger();
              }}
            >
              {#if value === option.id}
                <CheckIcon />
              {/if}
              {option.id}
              {option.language}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
