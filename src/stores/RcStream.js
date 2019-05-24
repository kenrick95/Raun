import { writable } from 'svelte/store';
import { DbNames } from './GlobalConfig';
import { DeferImmediateCommitEvents } from './AppConfig';
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
 *
 * This will be deleted once processed at RcStreamGroup
 *
 * New events at the back
 */
export const RcStream = writable([], (set) => {
  DbNames.subscribe((dbNames) => {
    const eventSource = new EventSource(ENDPOINT);
    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (
        !dbNames.includes(data.wiki) ||
        (data.type !== 'edit' && data.type !== 'new')
      ) {
        return;
      }

      UncommittedRcStream.update((uncommittedEvents) => {
        return [...uncommittedEvents, data];
      });
    };

    let shouldDeferImmediateCommitEventsTemp = false;
    let uncommittedEventsTemp = [];
    UncommittedRcStream.subscribe((uncommittedEvents) => {
      if (!uncommittedEvents || uncommittedEvents.length < 1) {
        return;
      }
      uncommittedEventsTemp = uncommittedEvents;
      if (!shouldDeferImmediateCommitEventsTemp) {
        commitEvents();
      }
    });

    function commitEvents() {
      UncommittedRcStream.set([]);
      set([...uncommittedEventsTemp]);
      uncommittedEventsTemp = [];
    }
    DeferImmediateCommitEvents.subscribe((shouldDeferImmediateCommitEvents) => {
      shouldDeferImmediateCommitEventsTemp = shouldDeferImmediateCommitEvents;
    });

    FlushRcStream.subscribe((shouldFlushRcStream) => {
      if (shouldFlushRcStream) {
        commitEvents();
        FlushRcStream.set(false);
      }
    });
  });
});
export const FlushRcStream = writable(false);

/**
 * @var {RcEvent[]} uncommittedEvents
 *
 *
 * Only when FlushRcStream=true, this will be "committed" to "events"
 * New events at the back
 */
export const UncommittedRcStream = writable([]);
