<script>
  import { stores } from "@sapper/app";
  const { page } = stores();
  import Loading from "../components/Loading.svelte";

  let query = $page.query;
  let data = [];
  let options = [];
  let partType = "";
  let currentPath = "";
  let state = "loading";

  $: query = $page.query;

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    page.subscribe(({ query }) => {
      update(query)
        .then(() => (state = "success"))
        .catch(() => (state = "error"));
      list(query)
        .then(() => (state = "success"))
        .catch(() => (state = "error"));
    });
  }

  async function list(query) {
    const path = query.path || "";
    if (
      (path.includes("/weekly/") ||
        path.includes("/monthly/") ||
        path.includes("/yearly/")) &&
      (path.endsWith("graph.png") || path.endsWith("summary.json"))
    ) {
      const parts = path.split("/");
      parts.pop();
      currentPath = parts[5];
      parts.pop();
      const newPath = parts.join("/");
      partType = parts[2];
      try {
        state = "loading";
        const response = await fetch(
          `https://github-api-proxy.anandchowdhary.vercel.app/api?endpoint=/repos/AnandChowdhary/life/contents/data/${
            newPath || ""
          }`
        );
        const json = await response.json();
        if (Array.isArray(json) && json.length) {
          options = json.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          );
        }
      } catch (error) {
        state = "error";
      }
    }
  }

  async function update(query) {
    try {
      state = "loading";
      if ((query.path || "").endsWith(".png")) {
        data = `https://raw.githubusercontent.com/AnandChowdhary/life/master/data/${query.path}`;
        state = "success";
        return;
      }
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
{:else if typeof data === 'string'}
  <nav class="options">
    <strong>{partType}</strong>
    {#each options as item}
      <a
        href={`?path=${encodeURIComponent(item.html_url.split('/master/data/')[1] + '/graph.png')}`}
        class={currentPath === item.name ? 'active' : ''}>
        <span>{item.name}</span>
      </a>
    {/each}
  </nav>
  <img alt="" src={data} />
{:else if Array.isArray(data)}
  <div class="big-links">
    {#each data as item}
      <a
        href={`?path=${encodeURIComponent(item.html_url.split('/master/data/')[1])}`}>
        <span>{item.name.split('-').join(' ')}</span>
      </a>
    {/each}
  </div>
{:else if data.content}
  <pre>{window.atob(data.content)}</pre>
{/if}
