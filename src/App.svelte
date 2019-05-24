<script>
  import { t } from "./stores/I18n.js";
  import { RcStreamGroups } from "./stores/RcStreamGroup.js";
  import { FlushRcStream, UncommittedRcStream } from "./stores/RcStream.js";
  import RcGroup from "./views/RcGroup.svelte";
  import Settings from "./views/Settings.svelte";
  import { slide } from "svelte/transition";
  let isSettingsActive = true;
  function toggleFilter() {
    isSettingsActive = !isSettingsActive;
  }
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
    text-align: right;
  }
  .settings-button {
    display: inline-block;
  }
  .settings-container {
    text-align: initial;
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
  <button class="settings-button" on:click={toggleFilter}>
     {isSettingsActive ? t('hide_settings') : t('show_settings')}
  </button>
  {#if isSettingsActive}
    <div class="settings-container" transition:slide={{ duration: 200 }}>
      <Settings />
    </div>
  {/if}
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
