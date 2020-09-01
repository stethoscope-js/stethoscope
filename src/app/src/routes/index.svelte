<script>
  import { onMount } from "svelte";
  import Loading from "../components/Loading.svelte";

  let data = [];
  let loading = false;

  onMount(async () => {
    loading = true;
    const response = await fetch(
      "https://api.github.com/repos/AnandChowdhary/life/contents/data"
    );
    data = await response.json();
    loading = false;
  });
</script>

<svelte:head>
  <title>Life</title>
</svelte:head>

{#if loading}
  <Loading />
{:else}{data}{/if}
