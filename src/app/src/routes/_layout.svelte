<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  const { page } = stores();

  let base = "";
  let path = "";
  let query = $page.query;
  let iframe = false;

  $: path = $page.path;
  $: query = $page.query;

  onMount(() => {
    if (window) base = `${window.location.protocol}//${window.location.host}`;
    try {
      iframe = window.self !== window.top;
    } catch (e) {
      iframe = true;
    }
  });
</script>

<style>
  label {
    display: block;
  }
  label span {
    display: block;
    margin-bottom: 0.5rem;
  }
  input {
    display: block;
    width: 100%;
    box-sizing: border-box;
    font: inherit;
    padding: 0.5rem;
    border-radius: 0.2rem;
    border: 0.1rem solid rgba(0, 0, 0, 0.2);
  }
  button {
    box-sizing: border-box;
    font: inherit;
    padding: 0.5rem 1rem;
    border-radius: 0.2rem;
    border: 0.1rem solid rgba(0, 0, 0, 0.2);
  }
  footer {
    margin-top: 2.5rem;
    display: flex;
  }
  footer label {
    flex: 1 0 0;
    margin-right: 1rem;
  }
  footer .button {
    display: flex;
    align-items: flex-end;
  }
</style>

<main>
  <slot />
</main>

{#if !iframe}
  <footer>
    <label>
      <span>Embed this page</span>
      <input
        type="text"
        value={`<iframe src="${base}${path || ''}?path=${encodeURIComponent(query.path || '')}" style="border: none; width: 100%; height: 400px" name="lifedata" title="Life data" scrolling="no" loading="lazy" allowfullscreen></iframe>`}
        readonly />
    </label>
    <div class="button"><button>Copy</button></div>
  </footer>
{/if}
