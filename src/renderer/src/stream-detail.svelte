<script lang="ts">
  import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
  import { formatDuration, formatSize } from "./state/utils.mjs";
  import { type Icon as IconType } from "@lucide/svelte";
  import Label from "$lib/components/ui/label/label.svelte";

  type Attribute = {
    icon?: typeof IconType;
    id: string;
    value: string;
    checked?: boolean;
  };

  let { stream }: { stream: StreamDetails } = $props();

  let col1: Attribute[] = $state([]);
  let col2: Attribute[] = $state([]);

  function populateDetails(): void {
    if (stream.language) {
      col1.push({
        icon: stream.icon,
        id: "type",
        value: `${stream.type} (${stream.language})`,
      });
    } else {
      col1.push({ icon: stream.icon, id: "type", value: stream.type });
    }
    col2.push({ id: "id", value: stream.id.toString() });

    col1.push({ id: "codec", value: stream.codec });
    col2.push({ id: "size", value: formatSize(stream.size) });

    switch (stream.type) {
      case "audio":
        col1.push({ id: "channels", value: stream.channels.toString() });
        col1.push({ id: "default", value: "default", checked: stream.default });
        break;
      case "video":
        col1.push({ id: "dimensions", value: stream.dimensions });
        break;
      case "subtitle":
        col1.push({ id: "forced", value: "forced", checked: stream.forced });
        break;
    }

    if (stream.duration) {
      col2.push({ id: "duration", value: formatDuration(stream.duration) });
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
      {#each col1 as attr (attr.id)}
        <div class="flex">
          {#if attr.checked !== undefined}
            <Checkbox id={`${stream.id}-${attr.id}`} checked={attr.checked} />
            <Label for={`${stream.id}-${attr.id}`}>&nbsp;{attr.value}</Label>
          {:else}
            {#if attr.icon}
              <attr.icon class="mr-2 size-4" aria-hidden="true" />
            {/if}
            {`${attr.id}: ${attr.value}`}
          {/if}
        </div>
      {/each}
    </div>
    <div>
      {#each col2 as attr (attr.id)}
        <div class="flex flex-row-reverse">
          {`${attr.id}: ${attr.value}`}
          {#if attr.icon}
            <attr.icon class="mr-2 size-4" aria-hidden="true" />
          {/if}
        </div>
      {/each}
    </div>
  </div>
</button>
