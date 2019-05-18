<script>
  import { t } from "./stores/I18n.js";
  import { RcStreamGroups } from "./stores/RcStreamGroup.js";
  import RcGroup from "./RC/RcGroup.svelte";
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
<main>

  <ul class="groups">

    {#each $RcStreamGroups.reverse() as eventGroup}
      <RcGroup {eventGroup} />
    {/each}
  </ul>
</main>
<footer />
