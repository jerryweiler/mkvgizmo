<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { Film } from "@lucide/svelte";
  import { getContext, onMount } from "svelte";

  let img: HTMLImageElement;

  interface Props {
    handle: number;
    streamid: number;
    pts_time: number;
  }

  let { handle, streamid, pts_time }: Props = $props();
  let src: string = $state("");

  onMount(() => {
    img.addEventListener("visibility", (e: CustomEvent) => {
      let observer: IntersectionObserver = e.detail.observer;
      let entry: IntersectionObserverEntry = e.detail.entry;

      if (entry.isIntersecting) {
        observer.unobserve(img);
        src = `frame://${handle}/${streamid}/${pts_time}`;
      }
    });

    let observer = getContext("visibility-observer") as IntersectionObserver;
    observer.observe(img);

    return (): void => observer.unobserve(img);
  });
</script>

<button
  class="hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all"
>
  <div class="flex w-full flex-col gap-1">
    <div class="flex items-center">
      <div class="flex items-center gap-2 font-semibold">
        <Film class="mr-2 size-4" aria-hidden="true" />
        {`${pts_time} seconds`}
      </div>
      <div class="ml-auto">
        <Popover.Root>
          <Popover.Trigger>
            <img
              bind:this={img}
              {src}
              width="160"
              height="120"
              alt="keyframe"
            />
          </Popover.Trigger>
          <Popover.Content class="w-auto h-auto">
            <img {src} width="640" height="480" alt="keyframe" />
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>
  </div>
</button>
