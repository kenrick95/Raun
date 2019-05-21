TODOs

- This rewrite fixes https://github.com/kenrick95/Raun/issues/20

- [x] Setup Svelte
- [x] Use Wikimedia's EventStreams https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams
- [ ] PHP is needed for Localisation and proxying API requests to Wikimedia wikis (because CORS)
- [x] Defer commit events to store
- [ ] Crosswiki events https://github.com/kenrick95/Raun/issues/5
- [ ] Use WMF sitematrix: https://github.com/kenrick95/Raun/issues/17
- [ ] Filter design
- [x] Limit request to ORES; too much revids will result in error 503, split into multiple request if too many revids
