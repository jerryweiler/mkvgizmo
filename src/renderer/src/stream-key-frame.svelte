<script lang="ts">
  import { Film } from "@lucide/svelte";
  import { getContext, onMount } from "svelte";

  let img: HTMLImageElement;

  export let handle: number;
  export let streamid: number;
  export let pts_time: number;

  onMount(() => {
    img.addEventListener("visibility", (e: CustomEvent) => {
      let observer: IntersectionObserver = e.detail.observer;
      let entry: IntersectionObserverEntry = e.detail.entry;

      if (entry.isIntersecting) {
        observer.unobserve(img);
        img.width = 160;
        img.height = 120;
        img.src = img.dataset.src;
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
        <img
          bind:this={img}
          data-src={`frame://${handle}/${streamid}/${pts_time}`}
          alt="keyframe"
        />
      </div>
    </div>
  </div>
</button>
