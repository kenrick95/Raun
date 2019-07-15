<script>
  import RcEvent from "./RcEvent.svelte";
  import { t } from "../stores/I18n";
  export let eventGroup = null;

  let eventGroupInfo = null;
  $: if (eventGroup && eventGroup.length > 0) {
    eventGroupInfo = {
      ...eventGroup[0],

      href: `${eventGroup[0].server_url}/w/index.php?title=${
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
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 16px 14px repeat(auto);
    margin: 10px;
    border-radius: 4px;
    padding: 10px 15px;
    border: 1px solid #ddd;

    row-gap: 4px;
    column-gap: 4px;
  }
  .group-title {
    grid-column: 1 / span 12;
    grid-row: 1 / span 1;
  }

  .wiki {
    grid-column: 1 / span 1;
    grid-row: 2 / span 1;

    font-size: 10px;
    line-height: 14px;
    color: #999;
  }
  .namespace {
    grid-column: 2 / span 1;
    grid-row: 2 / span 1;

    font-size: 10px;
    line-height: 14px;

    text-transform: lowercase;
    color: #999;
  }
  .events {
    grid-column: 1 / span 12;
    grid-row: 3 / span 1;
    padding-left: 28px;
  }
</style>

{#if eventGroupInfo}
  <li class="group">
    <a
      class="group-title"
      href={eventGroupInfo.href}
      target="_blank"
      rel="noreferrer noopener">
       {eventGroupInfo.title}
    </a>

    <div class="wiki" title={eventGroupInfo.wiki}>{eventGroupInfo.wiki}</div>
    <div class="namespace">{$t('ns' + eventGroupInfo.namespace)}</div>


    <ul class="events">
      {#each eventGroup as event, i (event.timestamp)}
        <RcEvent {event} />
      {/each}

    </ul>
  </li>
{/if}
