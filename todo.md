# TODOs

- This rewrite fixes https://github.com/kenrick95/Raun/issues/20

- [x] Setup Svelte
- [x] Use Wikimedia's EventStreams https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams
- [x] PHP is needed for Localisation and proxying API requests to Wikimedia wikis (because CORS)
- [x] Defer commit events to store
- [x] Crosswiki events https://github.com/kenrick95/Raun/issues/5
- [x] Use WMF sitematrix: https://github.com/kenrick95/Raun/issues/17
- [x] Filter design
- [x] Limit request to ORES; too much revids will result in error 503, split into multiple request if too many revids
- [x] Banana i18n
- [x] Support for Plural i18n https://github.com/kenrick95/Raun/issues/26
- [x] Rework i18n so that it is reactive. Current issue: Once loaded, unless the component is updated, old translation is used. This is because the real locale messages are loaded much later than the 1st render.
- [x] Filter: Save config at URL
- [ ] RcStreamGroup: Refactor expensive operations. Need something that has O(1) RcStreamGroup look up; also O(1) RcStreamGroup bubbling
- [ ] RcStreamGroup: Seems like not so useful to group many events together, only from same users. Need to explore if useful or not.
- [ ] Selector: Update UI to support multiple wiki selections

# Random notes

- `dbname` query params internal to this tool can hold >=1 dbname, separated by `|`. Example: Accessing Raun via `?dbname=idwiki|enwiki` will make Raun run in crosswiki.

# Current data architecture

Stores involved in the "main" flow:

- `RcStream`
- `UncommittedRcStream`
- `FlushRcStream`
- `RcStreamGroup`
- `Ores`
- `OresQueue`

## RcStreamGroup

- `RcStreamGroup` subscribes to `RcStream`
  - When there are new events on `RcStream`:
    - Put the revids to `OresQueue`
    - Group the events and write to `RcStreamGroup`
    - Clear `RcStream`

## RcStream

- `RcStream`: On subscribed, listen to Wikimedia EventStream
  - On new message from EventStream, put to `UncommittedRcStream`
- `FlushRcStream`: Once the value is `true`, flush `UncommittedRcStream` to `RcStream`
- Events order: Newer events are located at larger index

## Ores

- `Ores` subscribes to `OresQueue`
  - When there are new events on `OresQueue`:
    - Debounce the queue flush, set at 2000ms, maximum 10 times of debounce before need to flush
    - Flush `OresQueue`, do network request to Wikimedia ORES, save at `Ores` store
