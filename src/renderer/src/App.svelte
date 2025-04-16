<script lang="ts">
  import NavigationList from "./navigation-list.svelte";
  import * as Resizable from "$lib/components/ui/resizable";
  import Details from "./details.svelte";
  import { navItems } from "./state/navigation-items.svelte";
  import ButtonStrip from "./button-strip.svelte";
  import { getFileStreams } from "./state/current-file.svelte";
  import MessagePane from "./message-pane.svelte";
  import { logger } from "./state/logger.svelte";
</script>

<div class="w-screen h-screen">
  <Resizable.PaneGroup direction="vertical" class="h-full w-full items-stretch">
    <Resizable.Pane defaultSize={4} minSize={50}>
      <div class="grid grid-cols-[auto_minmax(0,1fr)] w-full h-full">
        <ButtonStrip />
        <Resizable.PaneGroup
          direction="horizontal"
          class="h-full w-full items-stretch"
        >
          <Resizable.Pane defaultSize={1} minSize={20} class="h-full">
            <NavigationList {navItems} />
          </Resizable.Pane>
          <Resizable.Handle withHandle />
          <Resizable.Pane defaultSize={2} minSize={30}>
            <Details currentFileStreams={getFileStreams()} />
          </Resizable.Pane>
        </Resizable.PaneGroup>
      </div>
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane defaultSize={1} minSize={10}>
      <MessagePane {logger} />
    </Resizable.Pane>
  </Resizable.PaneGroup>
</div>
