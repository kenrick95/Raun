<script>
  import RcEvent from "./RcEvent.svelte";
  export let eventGroup = null;
</script>

<style>
  .events {
  }
</style>

{#if eventGroup}
  <li>
    <ul class="events">
      {#each eventGroup.reverse() as event}
        <RcEvent {event} />
      {/each}

    </ul>
  </li>
{/if}
