<script>
  import { t } from "./stores/I18n.js";
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
</style>

<header>
  <h1>
    Raun
    <small>{$t.def_def}</small>
  </h1>
</header>

<main>
  <form action="/" method="GET" class="form">
    <label for="wiki" class="label">Wiki</label>

    <select id="wiki" name="dbname" class="field" required>
      {#each $SiteMatrix as Site}
        {#if Site}
          <option>{Site.dbName}</option>
        {/if}
      {:else}
        <option>enwiki</option>
      {/each}
    </select>

    <label for="locale" class="label">User interface language</label>

    <input
      type="text"
      id="locale"
      name="userlang"
      class="field"
      placeholder="en"
      required
      value="en" />
    <div id="submit-container">
      <input id="submit" type="submit" value={$t.save} />
    </div>
  </form>
</main>
<footer />
