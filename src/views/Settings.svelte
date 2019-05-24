<script>
  import {
    DeferImmediateCommitEvents,
    DisplayEventsFromBot
  } from "../stores/AppConfig.js";
  import { t } from "../stores/I18n.js";
</script>

<style>
  .h1 {
    font-size: 20px;
    margin-bottom: 4px;
  }
  .h2 {
    font-size: 16px;
    margin-bottom: 4px;
  }

  .description {
    font-size: 12px;
  }

  label {
    cursor: pointer;
  }
</style>

<h1 class="h1">{t('settings')}</h1>
<form>
  <label>
    <input type="checkbox" bind:checked={$DeferImmediateCommitEvents} />
     {t('settings_more_entries')}
  </label>

  <h2 class="h2">{t('filter')}</h2>

  <div class="description">{t('filter_description')}</div>

  <fieldset>
    <legend>{t('settings_show')}</legend>
    <label>
      <input type="checkbox" bind:checked={$DisplayEventsFromBot} />
       {t('settings_bot_edits')}
    </label>
  </fieldset>

</form>
