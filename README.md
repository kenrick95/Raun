Raun
====

See it running at https://tools.wmflabs.org/raun/

ra·un v conv inspect; guard; patrol;

Raun is a tool to watch the recent changes of Wikimedia Foundation projects in (near) real time. This tool is inspired from Ronda (http://ivan.lanin.org/ronda), by [@ivanlanin](https://github.com/ivanlanin). This project is started by Kenrick ([User:Kenrick95](https://en.wikipedia.org/wiki/User:Kenrick95)).


I realised that the original Raun was a mess. At first, I made it quickly (by quickly, I also mean without proper coding style) and just for fun before I publish it to the [Indonesian Wikipedia community](https://id.wikipedia.org/). Hosting it in GitHub, someone noticed it and asked for localisation; I quickly made it and hence this tool grew larger and larger, but now it has come to some point that the inconsistencies among the functions made me unproductive, hence I started to "rewrite" the tool. 


How it works
--------
This tool uses Server-Sent Events to receive data every some seconds (default is 3 seconds); if browser did not support this (for example IE 11), this tool will fall back to polling every some seconds (default is 5 seconds). The tool received data from WMF Project's API via a PHP page first before being passed to the JavaScript which parses and display it to the user.

Limitations
--------
Server-Sent Events and polling heavily uses server resources. Once I ever hosted this tool at [my personal website](http:/kenrick95.org) and the whole website was down after some hours of using this tool (due to exceeding the hosting bandwith limit). Hence, I hosted it at tools.wmflabs.org.

Browser support
--------
Browsers that is supported jQuery 2; and Bootstrap 3.1.1

Credits & License
--------
* [Bootstrap](https://github.com/twbs/bootstrap) 3.1.1
* [jQuery](https://github.com/jquery/jquery) 2.1.0
* Wikimedia API
* [Nanobar](https://github.com/jacoborus/nanobar) 0.0.6

Otherwise stated, this project source code is licensed under MIT License.
