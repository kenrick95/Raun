<script>
  export let event = {};

  let eventHref = "#";
  if (event) {
    eventHref = `${event.server_url}w/index.php?title=${event.title}&diff=${
      event.revision.new
    }&oldid=${event.revision.old}`;
  }
</script>

<style>
  .title {
    color: #05a;
  }
  .comment {
  }
</style>

<li>
  <a href={eventHref} class="title">{event.title}</a>

  <div class="comment">{event.comment}</div>

</li>
