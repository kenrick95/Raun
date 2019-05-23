<script>
  import { Ores } from "../stores/Ores";
  import { Locale } from "../stores/GlobalConfig";
  export let event = {};

  let eventHref = "#";
  $: if (event) {
    eventHref = `${event.server_url}/w/index.php?title=${event.title}&diff=${
      event.revision.new
    }&oldid=${event.revision.old}`;
  }
  let eventScore = null;
  $: eventScore = $Ores[event.revision.new]
    ? Math.round($Ores[event.revision.new] * 100)
    : null;

  let eventUserHref = `${event.server_url}/wiki/Special:Contributions/${
    event.user
  }`;

  let formattedTimeLocal = new Intl.DateTimeFormat([$Locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(event.timestamp * 1000);
  let formattedTimeUTC = new Date(event.timestamp * 1000).toISOString();
</script>

<style>
  .event {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 36px;
    grid-template-rows: 20px 14px 14px;

    row-gap: 2px;
    column-gap: 4px;

    line-height: 16px;
  }
  .time {
    color: #05a;
    grid-column: 1 / span 1;
    grid-row: 1 / span 1;
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

  .wiki {
    grid-column: 1 / span 1;
    grid-row: 2 / span 1;
  
    font-size: 10px;
    line-height: 14px;
  }
  .score {
    grid-column: 4 / span 1;
    grid-row: 2 / span 1;

    font-size: 10px;
    line-height: 14px;
  }

  .user {
    grid-column: 2 / span 1;
    grid-row: 1 / span 1;
  }
</style>

<li class="event">
  <a
    href={eventHref}
    class="time"
    target="_blank"
    rel="noreferrer noopener"
    title={`${formattedTimeUTC} UTC`}>
     {formattedTimeLocal}
  </a>

  <a
    href={eventUserHref}
    class="user"
    target="_blank"
    rel="noreferrer noopener">
     {event.user}
  </a>

  <div class="wiki" title={event.wiki}>{event.wiki}</div>

  {#if eventScore}
    <div class="score">{eventScore}%</div>
  {/if}

  <div class="comment" title={event.comment}>{event.comment}</div>

</li>
