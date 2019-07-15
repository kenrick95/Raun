import { writable, get } from 'svelte/store';

import { history } from '../history/index.js';

export const DeferImmediateCommitEvents = writable(true);
export const DisplayEventsFromBot = writable(false);
const filters = {
  hideBot: {
    fn: (event) => {
      return !event.bot;
    },
    active: true
  }
};
DisplayEventsFromBot.subscribe((show) => {
  filters.hideBot.active = !show;
});

export function filterEvents(events) {
  let filteredEvents = events;
  for (const filterName in filters) {
    if (filters[filterName].active) {
      filteredEvents = filteredEvents.filter(filters[filterName].fn);
    }
  }
  return filteredEvents;
}

const SearchParamMap = {
  defer_events: {
    store: DeferImmediateCommitEvents,
    type: Boolean
  },
  show_bots: {
    store: DisplayEventsFromBot,
    type: Boolean
  }
};
function checkUrl() {
  const urlSearchParams = new URLSearchParams(history.location.search);
  const newUrlSearchParams = new URLSearchParams(history.location.search);
  for (const key in SearchParamMap) {
    const { store, type } = SearchParamMap[key];
    if (urlSearchParams.has(key)) {
      // Set store
      const value = type(JSON.parse(urlSearchParams.get(key)));
      store.set(value);
    } else {
      // Set query param
      newUrlSearchParams.set(key, get(store));
    }
  }
  history.replace(
    history.location.pathname + '?' + newUrlSearchParams.toString()
  );
}

function initSubscriptions() {
  for (const key in SearchParamMap) {
    const { store, type } = SearchParamMap[key];
    store.subscribe((storeValue) => {

      const urlSearchParams = new URLSearchParams(history.location.search);
      const valueAtHistory = type(JSON.parse(urlSearchParams.get(key)));
      if (valueAtHistory !== storeValue) {
        urlSearchParams.set(key, storeValue);
        history.replace(
          history.location.pathname + '?' + urlSearchParams.toString()
        );
      }
    });
  }
}

export function bindHistoryWithAppConfigs() {
  checkUrl();
  initSubscriptions();
}

