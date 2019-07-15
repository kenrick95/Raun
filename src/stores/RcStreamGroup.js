import { readable } from 'svelte/store';
import { RcStream } from './RcStream';
import { OresQueue } from './Ores';
import { filterEvents } from './AppConfig';

/**
 * @var {Array<Array<RcEvent>>} eventGroups
 *
 * New events at the front
 */
let eventGroups = [];


export const RcStreamGroups = readable(eventGroups, async (set) => {
  RcStream.subscribe((events) => {
    if (!events || events.length < 1) {
      return;
    }
    const filteredEvents = filterEvents(events);


    const newEventIds = [];
    for (const newEvent of filteredEvents) {
      newEventIds.push({ revid: newEvent.revision.new, dbName: newEvent.wiki });
    }
    OresQueue.update((eventIds) => [...eventIds, ...newEventIds]);
    
    for (const newEvent of filteredEvents) {
      // TODO: These operations are expensive; O(N) on every new event received; see if we can improve

      // Find in `eventGroups`
      const groupIndex = eventGroups.findIndex((group) => {
        return (
          group[0].server_url === newEvent.server_url &&
          group[0].title === newEvent.title
        );
      });
      // "Bubble" the new group up
      if (groupIndex > -1) {
        const events = [newEvent, ...eventGroups[groupIndex]];
        eventGroups.splice(groupIndex, 1);
        eventGroups.unshift(events);
      } else {
        eventGroups.unshift([newEvent]);
      }
    }
    RcStream.set([]);
    set(eventGroups);
  });
});
