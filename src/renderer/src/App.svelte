<script lang="ts">
  import Nav from "./nav.svelte";
  import * as Resizable from "$lib/components/ui/resizable";
  import { TestData, ActiveFile } from "./assets/testdata";
  import Details from "./details.svelte";
  export let defaultLayout = [200, 400];
</script>

<div class="hidden md:block">
  <Resizable.PaneGroup direction="horizontal" class="h-full items-stretch">
    <Resizable.Pane defaultSize={defaultLayout[0]} minSize={10}>
      <Nav items={TestData} />
    </Resizable.Pane>
    <Resizable.Handle withHandle />
    <Resizable.Pane defaultSize={defaultLayout[1]} minSize={30}>
      <Details activeFile={ActiveFile}/>
    </Resizable.Pane>
  </Resizable.PaneGroup>
</div>
