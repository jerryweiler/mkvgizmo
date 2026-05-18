<script lang="ts">
  import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
  import { formatDuration, formatSize } from "./state/utils.mjs";
  import { SquareChevronDownIcon, type Icon as IconType } from "@lucide/svelte";
  import Label from "$lib/components/ui/label/label.svelte";
  import { selectedFile } from "./state/current-file.svelte";
  import { streamUpdates } from "./state/updates.svelte";

  type Attribute = {
    icon?: typeof IconType;
    id: string;
    value: string;
    checked?: boolean;
  };

  let { stream }: { stream: StreamDetails } = $props();

  let col1: Attribute[] = $state([]);
  let col2: Attribute[] = $state([]);

  function getEffectiveValue(stream: StreamDetails, attr: string): boolean {
    const update = streamUpdates.getUpdate(
      selectedFile.handle,
      stream.id,
      attr,
    );
    if (update !== undefined) {
      return update;
    }

    switch (attr) {
      case "default":
        return stream.default;
      case "forced":
        return stream.forced;
    }

    throw new Error("invalid attribute passed to getValue");
  }

  function populateDetails(): void {
    let sizeIcon: typeof IconType = undefined;

    if (stream.type === "subtitle") {
      // find all of the subtitles with the same language as the one we're
      // processing
      let subs = selectedFile.streams.filter(
        (s) => s.type === stream.type && s.language === stream.language,
      );

      // if more than one subtitle stream with this language exists,
      // it's likely one is supposed to be a forced subtitle for
      // untranslated on-screen text or purposely untranslated dialog.
      // give a visual indicator of the smallest stream.
      if (subs.length > 1 && subs.every((s) => s.size >= stream.size)) {
        sizeIcon = SquareChevronDownIcon;
      }
    }

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
    col2.push({ icon: sizeIcon, id: "size", value: formatSize(stream.size) });

    switch (stream.type) {
      case "audio":
        col1.push({ id: "channels", value: stream.channels.toString() });
        col1.push({
          id: "default",
          value: "default",
          checked: getEffectiveValue(stream, "default"),
        });
        break;
      case "video":
        col1.push({ id: "dimensions", value: stream.dimensions });
        break;
      case "subtitle":
        col1.push({
          id: "forced",
          value: "forced",
          checked: getEffectiveValue(stream, "forced"),
        });
        break;
    }

    if (stream.duration) {
      col2.push({ id: "duration", value: formatDuration(stream.duration) });
    }
  }

  populateDetails();

  function onCheckedChange(attr: string, value: boolean): void {
    // this currently handles changes to the 'forced' and 'default'
    // attributes. these attributes should only be present on one stream
    // of each language in a file. if we're turning this attribute on,
    // clear if from other streams of the same language.
    if (value) {
      for (const s of selectedFile.streams) {
        if (
          s.id !== stream.id &&
          s.type === stream.type &&
          s.language === stream.language &&
          getEffectiveValue(s, attr)
        ) {
          streamUpdates.add({
            handle: selectedFile.handle,
            stream: s.id,
            attr,
            value: false,
          });
        }
      }
    }

    streamUpdates.add({
      handle: selectedFile.handle,
      stream: stream.id,
      attr,
      value,
    });
  }

  function isUpdated(attribute: string): boolean {
    return (
      streamUpdates.getUpdate(selectedFile.handle, stream.id, attribute) !==
      undefined
    );
  }
</script>

<button
  id={`stream-${stream.id}`}
  class="hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-2
  text-left text-sm transition-all"
>
  <div class="grid grid-cols-2 gap-4 w-full">
    <div>
      {#each col1 as attr (attr.id)}
        <div class="flex">
          {#if attr.checked !== undefined}
            <Checkbox
              id={`${attr.id}-${stream.id}`}
              bind:checked={
                () => getEffectiveValue(stream, attr.id),
                (checked) => onCheckedChange(attr.id, checked)
              }
            />
            <Label for={`${stream.id}-${attr.id}`}>
              &nbsp;
              <span class={isUpdated(attr.id) ? "text-red-500" : ""}>
                {attr.value}
              </span>
            </Label>
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
