import { readable } from 'svelte/store';
const ENDPOINT = 'https://stream.wikimedia.org/v2/stream/recentchange';

/**
 * @typedef {Object} RcEvent
 * @property {?number} id
 * @property {string} type rc_type: One of "edit", "new", "log", "categorize", or "external"
 * @property {string} title Title::getPrefixedText
 * @property {number} namespace rc_namespace/page_namespace/-1
 * @property {string} comment rc_comment
 * @property {?string} parsedcomment contains HTML entitites
 * @property {number} timestamp Unix timestamp, rc_timestamp
 * @property {string} user rc_user_text
 * @property {boolean} bot is bot, rc_bot
 * @property {string} server_url $wgCanonicalServer; example: "https://de.wikipedia.org"
 * @property {string} server_name $wgServerName; example: "de.wikipedia.org"
 * @property {string} server_script_path  $wgScriptPath; example: "/w"
 * @property {string} wiki  wfWikiID ($wgDBprefix, $wgDBname); example: "dewiki"

 * @property {boolean} minor only for type="edit"
 * @property {boolean} patrolled only for type="edit"
 * @property {Object} length only for type="edit"
 * @property {?number} length.old only for type="edit"
 * @property {?number} length.new only for type="edit"
 * @property {Object} revision only for type="edit"
 * @property {?number} revision.old only for type="edit"
 * @property {?number} revision.new only for type="edit"

 */
/**
 * @var {RcEvent[]} events
 */
let events = [];

export const RcStream = readable(
  events,
  //@ts-ignore
  async (set) => {
    const eventSource = new EventSource(ENDPOINT);
    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (
        data.server_name !==
          window.PROJECT_SUBDOMAIN + '.' + window.PROJECT_NAME + '.org' ||
        (data.type !== 'edit' && data.type !== 'new')
      ) {
        return;
      }
      events = [data, ...events];
      set(events);
    };
  }
);
