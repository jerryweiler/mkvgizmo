<script lang="ts">
  async function getPlaylist(): Promise<string> {
    const response = await fetch("playlist://1/0/1");
    const body = await response.text();
    return body;
  }
</script>

<div class="w-screen h-screen">
  <div class="w-full whitespace-pre-wrap font-mono">
    Playlist:
    {#await getPlaylist() then value}{value}{/await}
  </div>
</div>
