<script>
  import { t } from "./stores/I18n.js";
  import Header from "./views/Header.svelte";
  import Footer from "./views/Footer.svelte";
  import { SiteMatrix } from "./stores/SiteMatrix.js";
</script>

<style>
  .form {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: repeat(auto);
    margin: 10px;
    border-radius: 4px;
    padding: 10px 15px;
    border: 1px solid #ddd;
    column-gap: 12px;
    row-gap: 6px;
  }
  .label {
    grid-column: 1 / span 1;
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }
  .field {
    grid-column: 2 / span 1;
    margin-bottom: 6px;
  }
  #submit-container {
    grid-column: 2 / span 1;
  }
  #submit {
    margin-bottom: 6px;
  }
  :global(a) {
    color: #05a;
  }
</style>

<Header />

<main>
  <form action="/" method="GET" class="form">
    <label for="wiki" class="label">{$t('tool_wikis')}</label>

    <select id="wiki" name="dbname" class="field" required>
      {#each $SiteMatrix as Site}
        {#if Site}
          {#if Site.dbName === 'enwiki'}
            <!-- Still "choose" enwiki as default so that the selection isn't changed after loaded -->
            <option value={Site.dbName} selected="selected">
               {Site.dbName} - {Site.url}
            </option>
          {:else}
            <option value={Site.dbName}>{Site.dbName} - {Site.url}</option>
          {/if}
        {/if}
      {:else}
        <option value="enwiki">enwiki - https://en.wikipedia.org</option>
      {/each}
    </select>

    <label for="locale" class="label">{$t('tool_language')}</label>

    <input
      type="text"
      id="locale"
      name="userlang"
      class="field"
      placeholder="en"
      required
      value="en" />
    <div id="submit-container">
      <input id="submit" type="submit" value={$t('submit')} />
    </div>
  </form>
</main>
<Footer />
