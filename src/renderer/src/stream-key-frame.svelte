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
    // we want to add the img element to the observer list so we can load the
    // keyframe into it on-demand when it becomes visible. we have multiple
    // places where we remove it from the observer list, but we only want
    // the first one to do so or we get unhandle exceptions. to prevent multiple
    // unobserve calls, capture a copy and clear if the first time we remove it.
    let observer = getContext("visibility-observer") as IntersectionObserver;
    let observedImg = img;
    function unobserve(): void {
      if (observedImg) {
        observer.unobserve(observedImg);
      }
      observedImg = null;
    }

    img.addEventListener("visibility", (e: CustomEvent) => {
      let entry: IntersectionObserverEntry = e.detail.entry;
      if (entry.isIntersecting) {
        unobserve();
        src = `frame://${handle}/${streamid}/${pts_time}`;
      }
    });

    observer.observe(observedImg);

    return (): void => unobserve();
  });
</script>

<button
  class="hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3
  text-left text-sm transition-all"
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
