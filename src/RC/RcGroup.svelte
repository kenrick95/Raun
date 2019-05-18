<script>
  import RcEvent from "./RcEvent.svelte";
  export let eventGroup = null;

  let eventGroupInfo = null;
  if (eventGroup && eventGroup.length > 0) {
    eventGroupInfo = {
      title: eventGroup[0].title,
      href: `${eventGroup[0].server_url}w/index.php?title=${
        eventGroup[0].title
      }&diff=${eventGroup[0].revision.new}&oldid=${
        eventGroup[eventGroup.length - 1].revision.old
      }`
    };
  }
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
    grid-row: 1 / span 1;
    color: #05a;
  }
  .events {
  }
</style>

{#if eventGroupInfo}
  <li class="group">
    <a class="group-title" href={eventGroupInfo.href}>
       {eventGroupInfo.title}
    </a>
    <ul class="events">
      {#each eventGroup.reverse() as event}
        <RcEvent {event} />
      {/each}

    </ul>
  </li>
{/if}
