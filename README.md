Raun
====

See it running at [Tool Labs](https://tools.wmflabs.org/raun/).

**ra·un** *v conv* inspect; guard; patrol;

Raun is a tool to watch the recent changes of Wikimedia Foundation projects in real time. This tool is inspired from [Ronda](http://ivan.lanin.org/ronda), by [@ivanlanin](https://github.com/ivanlanin). This project is started by Kenrick ([User:Kenrick95](https://en.wikipedia.org/wiki/User:Kenrick95)) around November 2013.

### Bit of History
I realised that the original Raun was a mess. At first, I made it quickly (by quickly, I also mean without proper coding style) and just for fun before I publish it to the [Indonesian Wikipedia community](https://id.wikipedia.org/). Hosting it in GitHub, someone noticed it and asked for localisation; I quickly made it and hence this tool grew larger and larger, but now it has come to some point that the inconsistencies among the functions made me unproductive, hence I started to "rewrite" the tool in object-oriented manner.

Then after a while, I started to look on the performance and started the "streamlined" branch. Although Server-Sent Events has been used since the original version, I noticed that it was the bottleneck here because most of the times it failed in establishing a SSE connection and fallback to polling. I then stripped out SSE completely after [@Aldnonymous](https://github.com/Aldnonymous) introduced [RCStream](https://wikitech.wikimedia.org/wiki/RCStream) from [stream.wikimedia.org](https://wikitech.wikimedia.org/wiki/stream.wikimedia.org) which uses socket.io to stream the recent changes data.

## Features
* Watch Wikimedia Foundation project recent changes in real time
* Statistical information of the selected project
* Filtering: admin, editor, anon, minor, redirect, new page
* Combined edits for a same page
* Responsive design (by Bootstrap)

## How It Works
The tool calls MediaWiki API to get user list of admin rights and editor rights. Next, it calls MediaWiki API for getting Recent Changes list (because the "stream" cannot show past changes). Finally, connect to [RCStream](https://wikitech.wikimedia.org/wiki/RCStream) from [stream.wikimedia.org](https://wikitech.wikimedia.org/wiki/stream.wikimedia.org) to "stream" the recent changes data in real time. On the other side, statistics are called using polling.

## Browser Support
Browsers that supports jQuery 2 and Bootstrap 3.1.1

## Credits & License
* [Bootstrap](https://github.com/twbs/bootstrap) 3.1.1
* [jQuery](https://github.com/jquery/jquery) 2.1.0
* Wikimedia's MediaWiki API
* [RCStream](https://wikitech.wikimedia.org/wiki/RCStream) from [stream.wikimedia.org](https://wikitech.wikimedia.org/wiki/stream.wikimedia.org)
* [Nanobar](https://github.com/jacoborus/nanobar) 0.0.6
* [socket.io](http://socket.io/) 0.9.17

Unless otherwise stated, this project source code is licensed under MIT License.
