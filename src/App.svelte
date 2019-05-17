<script>
  import { t } from "./i18n/index.js";
  import { StreamStore } from "./Stream/index.js";
  import RcGroup from "./RC/RcGroup.svelte";
</script>

<style>

</style>

<header>
  <h1>Raun {$t.def_def}</h1>
</header>
<main>
  {#each $StreamStore.events as event}
    <RcGroup {event} />
  {/each}
</main>
<footer />
