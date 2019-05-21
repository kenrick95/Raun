<script>
  import { t } from "./stores/I18n.js";
  import { RcStreamGroups } from "./stores/RcStreamGroup.js";
  import { FlushRcStream, UncommittedRcStream } from "./stores/RcStream.js";
  import { DeferImmediateCommitEvents } from "./stores/AppConfig.js";
  import RcGroup from "./RC/RcGroup.svelte";

  function handleFlush() {
    FlushRcStream.set(true);
  }
</script>

<style>
  .groups {
  }
</style>

<header>
  <h1>
    Raun
    <small>{$t.def_def}</small>
  </h1>
</header>

<aside>
  {#if $DeferImmediateCommitEvents}
    <button on:click={handleFlush}>
       {$t.more_entries.replace('$1', $UncommittedRcStream.length)}
    </button>
  {/if}
  <form>
    <label>
      <input type="checkbox" bind:checked={$DeferImmediateCommitEvents} />
       {$t.settings_more_entries}
    </label>

  </form>

</aside>

<main>

  <ul class="groups">

    {#each $RcStreamGroups as eventGroup}
      <RcGroup {eventGroup} />
    {/each}
  </ul>
</main>
<footer />
