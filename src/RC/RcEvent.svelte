<script>
  import { Ores } from "../stores/Ores";
  export let event = {};

  let eventHref = "#";
  if (event) {
    eventHref = `${event.server_url}/w/index.php?title=${event.title}&diff=${
      event.revision.new
    }&oldid=${event.revision.old}`;
  }
  let eventScore = null;
  $: eventScore = $Ores[event.revision.new]
    ? Math.round($Ores[event.revision.new] * 100)
    : null;
</script>

<style>
  .event {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 36px;
    grid-template-rows: 16px 14px 14px;
  }
  .title {
    color: #05a;
    grid-column: 1 / span 4;
    grid-row: 1 / span 4;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .comment {
    grid-column: 1 / span 4;
    grid-row: 3 / span 1;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    font-size: 10px;
    line-height: 14px;
  }

  .score {
    grid-column: 4 / span 1;
    grid-row: 2 / span 1;

    font-size: 10px;
    line-height: 14px;
  }
</style>

<li class="event">
  <a
    href={eventHref}
    class="title"
    target="_blank"
    rel="noreferrer noopener"
    title={event.title}>
     {event.title}
  </a>

  <div class="comment" title={event.comment}>{event.comment}</div>

  {#if eventScore}
    <div class="score">{eventScore}%</div>
  {/if}

</li>
