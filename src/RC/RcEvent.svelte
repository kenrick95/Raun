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
  Ores.subscribe(revids => {
    if (revids[event.revision.new]) {
      eventScore = Math.round(revids[event.revision.new] * 100);
    }
  });
</script>

<style>
  .event {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 16px 12px 12px;
  }
  .title {
    color: #05a;
    grid-column: 1 / span 3;
    grid-row: 1 / span 3;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .comment {
    grid-column: 1 / span 1;
    grid-row: 3 / span 1;
    
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .score {
    grid-column: 3 / span 1;
    grid-row: 2 / span 1;
  }
</style>

<li class="event">
  <a href={eventHref} class="title">{event.title}</a>

  <div class="comment">{event.comment}</div>

  {#if eventScore}
    <div class="score">{eventScore}%</div>
  {/if}

</li>
