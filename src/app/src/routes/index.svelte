<script>
  import { onMount } from "svelte";
  import Loading from "../components/Loading.svelte";

  let data = [];
  let state = "loading";

  onMount(async () => {
    try {
      const response = await fetch(
        "https://api.github.com/repos/AnandChowdhary/life/contents/data"
      );
      data = await response.json();
      state = "success";
    } catch (error) {
      state = "error";
    }
  });
</script>

<svelte:head>
  <title>Life</title>
</svelte:head>

{#if state === 'loading'}
  <Loading />
{:else if state === 'error'}
  <p class="error">We got an error in fetching this data</p>
{:else}
  <div class="big-links">
    {#each data as item}
      <a href={`/${item.name}/`}>
        <span>{item.name.split('-').join(' ')}</span>
      </a>
    {/each}
  </div>
{/if}
