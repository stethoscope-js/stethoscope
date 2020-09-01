<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  import Loading from "../components/Loading.svelte";

  let query = $page.query;
  let data = [];
  let state = "loading";

  $: query = $page.query;

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    page.subscribe(({ query }) => {
      update(query)
        .then(() => (state = "success"))
        .catch(() => (state = "errir"));
    });
  }

  async function update(query) {
    try {
      state = "loading";
      const response = await fetch(
        `https://github-api-proxy.anandchowdhary.vercel.app/api?endpoint=/repos/AnandChowdhary/life/contents/data/${
          query.path || ""
        }`
      );
      data = await response.json();
      if (
        Array.isArray(data) &&
        data.length &&
        typeof data[0].name === "string"
      ) {
        data = data.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      }
      state = "success";
    } catch (error) {
      state = "error";
    }
  }
</script>

<svelte:head>
  <title>Life</title>
</svelte:head>

{#if state === 'loading'}
  <Loading />
{:else if state === 'error'}
  <p class="error">We got an error in fetching this data</p>
{:else if Array.isArray(data)}
  <div class="big-links">
    {#each data as item}
      <a
        href={`?path=${encodeURIComponent(`${query.path || ''}${item.name}/`)}`}>
        <span>{item.name.split('-').join(' ')}</span>
      </a>
    {/each}
  </div>
{:else}
  <pre>{window.atob(data.content)}</pre>
{/if}
