<script lang="ts">
  import NavigationList from "./navigation-list.svelte";
  import * as Resizable from "$lib/components/ui/resizable";
  import Details from "./details.svelte";
  import { navItems } from "./state/navigation-items.svelte";
  import ButtonStrip from "./button-strip.svelte";
  import { getFileStreams } from "./state/current-file.svelte";
</script>

<div class="grid grid-cols-[auto_minmax(0,1fr)] w-screen h-screen">
  <ButtonStrip />
  <Resizable.PaneGroup
    direction="horizontal"
    class="h-full w-full items-stretch"
  >
    <Resizable.Pane defaultSize={1} minSize={20}>
      <NavigationList {navItems} />
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane defaultSize={2} minSize={30}>
      <Details currentFileStreams={getFileStreams()} />
    </Resizable.Pane>
  </Resizable.PaneGroup>
</div>
