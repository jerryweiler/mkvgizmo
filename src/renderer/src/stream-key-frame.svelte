<script lang="ts">
  import { Film } from "@lucide/svelte";

  export let handle: number;
  export let streamid: number;
  export let pts_time: number;
</script>

<button
  class="hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all"
>
  <div class="flex w-full flex-col gap-1">
    <div class="flex items-center">
      <div class="flex items-center gap-2 font-semibold">
        <Film class="mr-2 size-4" aria-hidden="true" />
        {`${pts_time} seconds`}
        <img src={`frame://${handle}/${streamid}/${pts_time}`} alt="keyframe" />
      </div>
    </div>
  </div>
</button>
