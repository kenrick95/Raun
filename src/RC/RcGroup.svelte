<script>
  import RcEvent from "./RcEvent.svelte";
  export let eventGroup = null;
</script>

<style>
  .group {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 16px 12px;
    margin: 10px;
    border-radius: 4px;
    padding: 10px 15px;
    border: 1px solid #ddd;
    /* box-shadow: 0 0 5px #ddd; */
  }
  .group-title {
    
  grid-column: 1 / span 1;
  grid-row:1 / span 1;
  }
  .events {
  }
</style>

{#if eventGroup}
  <li class="group">
  <div class="group-title">
     {eventGroup[0].title}
  </div>
    <ul class="events">
      {#each eventGroup.reverse() as event}
        <RcEvent {event} />
      {/each}

    </ul>
  </li>
{/if}
