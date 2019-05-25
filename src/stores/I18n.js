import { Locale } from './GlobalConfig';
import English from '../../messages/en.json';
import Banana from 'banana-i18n';
import { derived, writable } from 'svelte/store';

const ENDPOINT = 'messages/{LOCALE}.json';

class I18n {
  constructor(locale) {
    this.currentLocale = locale;
    this.banana = new Banana(locale, {
      messages: English
    });
    this.t = this.t.bind(this);
  }
  async init(locale) {
    if (this.currentLocale === locale) {
      return;
    }
    this.currentLocale = locale;
    this.banana.setLocale(locale);
    const response = await fetch(ENDPOINT.replace('{LOCALE}', locale));
    const messages = await response.json();
    this.banana.load(messages, locale);
    MessageStore.set(messages);
  }

  t(...args) {
    return this.banana.i18n(...args);
  }
}

let i18n = new I18n('en');

function createTFactory(locale) {
  i18n.init(locale);
  return i18n.t;
}

// NOTE: "MessageStore" is used so that when the messages have been fetched, every subscription of "t" are rerendered.
const MessageStore = writable({});

// eslint-disable-next-line no-unused-vars
export const t = derived([Locale, MessageStore], ([locale, messageStore]) => {
  return createTFactory(locale);
});
