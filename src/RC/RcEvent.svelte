<script>
  import { Ores } from "../stores/Ores";
  import { Locale } from "../stores/GlobalConfig";
  import { t } from "../stores/I18n";
  import { isAnon } from "../utils/user";
  import { getScoreColor } from "../utils/score";

  export let event = {};

  let eventHref = "#";
  $: if (event.revision) {
    eventHref = `${event.server_url}/w/index.php?title=${event.title}&diff=${
      event.revision.new
    }&oldid=${event.revision.old}`;
  }

  $: eventScore = $Ores[event.revision.new]
    ? Math.round($Ores[event.revision.new] * 100)
    : null;

  $: eventUserHref = `${event.server_url}/wiki/Special:Contributions/${
    event.user
  }`;

  $: formattedTimeLocal = new Intl.DateTimeFormat([$Locale], {
    // year: "numeric",
    // month: "long",
    // day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(event.timestamp * 1000);
  $: formattedTimeUTC = new Date(event.timestamp * 1000).toISOString();

  let diff = null;
  $: if (event.length) {
    diff = event.length.new - (event.length.old || 0);
  }

  let revTags = [];
  $: if (event.patrolled) {
    revTags.push("patrolled");
  }
  $: if (event.minor) {
    revTags.push("minor");
  }

  let userTags = [];
  $: if (event.bot) {
    userTags.push("bot");
  }
  $: if (isAnon(event.user)) {
    userTags.push("anon");
  }

  function getStyle(eventScore) {
    if (eventScore >= 45) {
      return "background-color: #ffd3bd";
    }
    return "";
  }
</script>

<style>
  .event {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 20px 14px;

    row-gap: 2px;
    column-gap: 4px;

    line-height: 16px;
  }
  .event + .event {
    margin-top: 8px;
  }
  .time {
    color: #05a;
    grid-column: 1 / span 2;
    grid-row: 1 / span 1;
  }
  .comment {
    grid-column: 1 / span 11;
    grid-row: 2 span 1;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    font-size: 10px;
    line-height: 14px;
  }

  .score {
    grid-column: 12 / span 1;
    grid-row: 1 / span 1;

    font-weight: 500;
    font-size: 10px;
    line-height: 14px;

    display: flex;
    align-items: center;
  }

  .user {
    grid-column: 6 / span 2;
    grid-row: 1 / span 1;

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .revtags {
    grid-column: 3 / span 3;
    grid-row: 1 / span 1;

    display: flex;
    align-items: center;
  }
  .usertags {
    grid-column: 8 / span 3;
    grid-row: 1 / span 1;

    display: flex;
    align-items: center;
  }
  .tag {
    font-weight: 500;
    font-size: 10px;
    line-height: 14px;
    color: #999;
    flex: 0 1 auto;
  }

  .tag + .tag {
    margin-left: 12px;
  }

  .diff {
    grid-column: 11 / span 1;
    grid-row: 1 / span 1;

    font-weight: 500;
    font-size: 10px;
    line-height: 14px;
    display: flex;
    align-items: center;
    color: #999;
  }

  .diff-pos {
    color: #5cb85c;
  }
  .diff-neg {
    color: #d9534f;
  }
</style>

<li class="event" style={getStyle(eventScore)}>
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
    rel="noreferrer noopener"
    title={`User:${event.user}`}>
     {event.user}
  </a>

  {#if diff != null}
    <div
      class={[
        'diff',
        diff > 0 ? 'diff-pos' : null,
        diff < 0 ? 'diff-neg' : null
      ]
        .filter(Boolean)
        .join(' ')}>
      {#if diff > 0}+{diff}{:else}{diff}{/if}
    </div>
  {/if}

  {#if revTags.length > 0}
    <div class="revtags">
      {#each revTags as tag}
        <div class="tag">{t(tag)}</div>
      {/each}
    </div>
  {/if}

  {#if userTags.length > 0}
    <div class="usertags">
      {#each userTags as tag}
        <div class="tag">{t(tag)}</div>
      {/each}
    </div>
  {/if}

  <div class="comment" title={event.comment}>{event.comment}</div>

  {#if eventScore}
    <div
      class="score"
      style={`color: ${getScoreColor(eventScore)}`}
      title={t('ores_score')}>
       {eventScore}%
    </div>
  {/if}
</li>
