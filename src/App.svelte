<script>
  import { t } from "./i18n/index.js";
  import { StreamGroups } from "./Stream/group.js";
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

    {#each $StreamGroups.reverse() as eventGroup}
      <RcGroup {eventGroup} />
    {/each}
  </ul>
</main>
<footer />
