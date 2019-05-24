<script>
  import {
    DeferImmediateCommitEvents,
    FilterBotEvents
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
</style>

<h1 class="h1">{t('settings')}</h1>
<form>
  <label>
    <input type="checkbox" bind:checked={$DeferImmediateCommitEvents} />
     {t('settings_more_entries')}
  </label>

  <h2 class="h2">{t('filter')}</h2>

  <fieldset>
    <legend>{t('settings_show')}</legend>
    <label>
      <input type="checkbox" bind:checked={$FilterBotEvents} />
       {t('settings_bot_edits')}
    </label>
  </fieldset>

</form>
