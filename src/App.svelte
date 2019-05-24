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
    padding-left: 0;
  }
  .settings {
    position: fixed;
    right: 0;
    top: 0;
    padding: 10px 15px;
    background: white;
  }
  .settings-header {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .more-entries {
    visibility: hidden;
    margin-left: 10px;
  }
  .more-entries-show {
    visibility: visible;
  }
</style>

<header>
  <h1>
    Raun
    <small>{t('def_def')}</small>
  </h1>
</header>

<aside class="settings">
  <h1 class="settings-header">{t('settings')}</h1>
  <form>
    <label>
      <input type="checkbox" bind:checked={$DeferImmediateCommitEvents} />
       {t('settings_more_entries')}
    </label>

  </form>

</aside>

<main>

  <button
    on:click={handleFlush}
    class={'more-entries' + ($UncommittedRcStream.length > 0 ? ' more-entries-show' : '')}>
     {t('more_entries', $UncommittedRcStream.length)}
  </button>

  <ul class="groups">

    {#each $RcStreamGroups as eventGroup}
      <RcGroup {eventGroup} />
    {/each}
  </ul>
</main>
<footer />
