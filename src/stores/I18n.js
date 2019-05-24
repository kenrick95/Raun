import { Locale } from './GlobalConfig';
import English from '../../messages/en.json';
import Banana from 'banana-i18n';

const ENDPOINT = 'messages/{LOCALE}.json';
let currentLocale = 'en';

class I18n {
  constructor(locale) {
    this.banana = new Banana(locale, {
      messages: English
    });
    this.t = this.t.bind(this);
  }
  async init(locale) {
    this.banana.setLocale(locale);
    const response = await fetch(ENDPOINT.replace('{LOCALE}', locale));
    const messages = await response.json();
    this.banana.load(messages, locale);
  }

  t(...args) {
    return this.banana.i18n(...args);
  }
}

let i18n = new I18n(currentLocale);

function createTFactory(locale) {
  i18n.init(locale);
  return i18n.t;
}

export let t = createTFactory(currentLocale);

Locale.subscribe((locale) => {
  if (locale !== currentLocale) {
    t = createTFactory(locale);
    currentLocale = locale;
  }
});
