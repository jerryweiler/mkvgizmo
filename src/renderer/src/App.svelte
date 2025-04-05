<script lang="ts">
  import NavigationList from "./navigation-list.svelte";
  import * as Resizable from "$lib/components/ui/resizable";
  import Details from "./details.svelte";
  import { navItems } from "./state/navigation-items.svelte";
  import ButtonStrip from "./button-strip.svelte";
  import { getFileStreams } from "./state/current-file.svelte";
  export let defaultLayout = [200, 400];
</script>

<div class="flex">
  <ButtonStrip />
  <div class="hidden md:block flex-grow">
    <Resizable.PaneGroup direction="horizontal" class="h-full items-stretch">
      <Resizable.Pane defaultSize={defaultLayout[0]} minSize={10}>
        <NavigationList {navItems} />
      </Resizable.Pane>
      <Resizable.Handle withHandle />
      <Resizable.Pane defaultSize={defaultLayout[1]} minSize={30}>
        <Details currentFileStreams={getFileStreams()} />
      </Resizable.Pane>
    </Resizable.PaneGroup>
  </div>
</div>
