<script lang="ts">
  import { formatDuration, formatSize } from "./state/utils.mjs";
  import { type Icon as IconType } from "@lucide/svelte";

  type Attribute = {
    icon?: typeof IconType;
    name: string;
  };

  let { stream }: { stream: StreamDetails } = $props();

  let col1: Attribute[] = $state([]);
  let col2: Attribute[] = $state([]);

  function streamType(stream: StreamDetails): string {
    let result: string = stream.type;
    if (stream.language) {
      result += ` (${stream.language})`;
    }

    if (stream.forced) {
      result += " FORCED";
    }

    return result;
  }

  function populateDetails(): void {
    col1.push({ icon: stream.icon, name: streamType(stream) });
    col2.push({ name: `id ${stream.id}` });

    col1.push({ name: `codec: ${stream.codec}` });
    col2.push({ name: `size: ${formatSize(stream.size)}` });

    if (stream.channels) {
      col1.push({ name: `channels: ${stream.channels}` });
    }
    if (stream.dimensions) {
      col1.push({ name: `dimensions: ${stream.dimensions}` });
    }
    if (stream.duration) {
      col2.push({ name: `duration: ${formatDuration(stream.duration)}` });
    }
  }

  populateDetails();
</script>

<button
  class="hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-2
  text-left text-sm transition-all"
>
  <div class="grid grid-cols-2 gap-4 w-full">
    <div>
      {#each col1 as attr (attr.name)}
        <div class="flex">
          {#if attr.icon}
            <attr.icon class="mr-2 size-4" aria-hidden="true" />
          {/if}
          {attr.name}
        </div>
      {/each}
    </div>
    <div>
      {#each col2 as attr (attr.name)}
        <div class="flex flex-row-reverse">
          {attr.name}
          {#if attr.icon}
            <attr.icon class="mr-2 size-4" aria-hidden="true" />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</button>
