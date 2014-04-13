/*jslint sloppy: true, plusplus:true, browser: true, unparam:true, vars:true, continue:true */
/*global console, locale_obj, nanobar, Nanobar, escape, unescape, EventSource, $, jQuery, clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false */
/*
Raun-rewrite.js

By Kenrick

Introduction
---
I acknowledge that the previous javascript file was a mess, hence I rewrite it using nicer structure.

Definition
---
* "project" refer to WMF wikis project
* "language" refer to the language WMF wikis project
* "locale" refer to the language used in Raun

* "data" consists of "rc", "user", and "stat"
** "rc" is the entries of recent changes of the project
** "user" is the user list
** "stat" is the project statistics

* "run", the tools is running (opposite of "pause")
* "notification", involves starting the Web Notification API

* "get" invokes ajax call
* "display" involves manipulating data shown in screen


*/
function Model() {
    return;
}
Model.prototype.config = {
    "show": {
        "bot": false,
        "anon": false,
        "new": true,
        "minor": true,
        "redirect": true,
        "editor": true,
        "admin": true,
        "others": true
    },
    "run": true,
    "project": "wikipedia",
    "language": "id",
    "locale": "en",
    "notification": true
};
Model.prototype.data = {
    "user": null,
    "stat": null
};
Model.prototype.init = function (view) {
    var that = this;
    this.data.user = [];
    this.getUserPolling(view, 'sysop', function (view) {
        that.getUserPolling(view, 'editor', function (view) {
            if (that.canRun() === 1) {
                that.getRCSSE(view);
                that.getStatSSE(view);
            } else {
                that.getRCPolling(view);
                that.getStatPolling(view);
            }
        });
    });
    view.displayTime();
    return;
};
Model.prototype.canRun = function () {
    /*
    return:
        int
        0: don't run
        1: support SSE, use SSE
        2: use polling
    */
    if (!this.config.run) {
        return 0;
    }
    if (!!window.EventSource) {
        return 1;
    }
    return 2;
};
// Polling
Model.prototype.getDataPolling = function (view, type, params, callback) {
    var sendData = params, that =  this;
    sendData.project = this.config.project;
    sendData.language = this.config.language;
    sendData.type = type;
    console.log(sendData);
    $.ajax({
        type: "POST",
        url: "api-rewrite.php",
        data: sendData,
        dataType: "json",
        success: function (data) {
            data.config = that.config;
            data.params = params;
            data.site = that.data;
            var ret = view.displayData(type, data);
            callback(ret, data, callback);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            console.log(xhr);
        }
    });
};
Model.prototype.getRCPolling = function (view) {
    var that = this;
    view.displayBar(50);
    this.getDataPolling(view, 'rc', {from: 0, gtz: 0, last_rcid: 0}, function (ret, data, callback) {
        function process(ret, data, callback) {
            data.params.gtz = ret.gtz;
            data.params.last_rcid = ret.last_rcid;
            that.getDataPolling(view, 'rc', data.params, callback);
        }
        setTimeout(process.bind(this, ret, data, callback), 5000);
    });
};
Model.prototype.getLogPolling = function (view) {
    this.getDataPolling(view, 'log');
};
Model.prototype.getUserPolling = function (view, group, callback) {
    var that = this, that_callback = callback, i;
    this.getDataPolling(view, 'user', {group: group}, function (ret, data, callback) {
        that.data.user[data.params.group] = [];
        for (i = 0; i < data.length; i++) {
            that.data.user[data.params.group][data[i].name.toLowerCase()] = true;
        }
        that.data.user[data.params.group][-1] = data;
        that_callback(view);
    });
};
Model.prototype.getStatPolling = function (view) {
    var that = this;
    this.getDataPolling(view, 'stat', {method: 'stat'}, function (ret, data, callback) {
        function process(ret, data, callback) {
            that.getDataPolling(view, 'stat', data.params, callback);
        }
        setTimeout(process.bind(this, ret, data, callback), 5000);
    });
};

// Server-Sent Event (SSE)
Model.prototype.getDataSSE = function (view, type, params, callback) {
    var that = this, source = new EventSource('api-sse-rewrite.php');
    source.addEventListener(type, function (e) {
        var data = JSON.parse(e.data), ret;
        data.config = that.config;
        data.params = params;
        data.site = that.data;
        //console.log(data);
        ret = view.displayData(type, data);
        if (!!callback) {
            callback(ret, data, callback);
        }
    }, false);
};
Model.prototype.getRCSSE = function (view) {
    var that = this;
    that.createCookie("rcfrom", 0, 1);
    this.getDataSSE(view, 'rc', {gtz: 0, last_rcid: 0}, function (ret, data, callback) {
        data.params.gtz = ret.gtz;
        data.params.last_rcid = ret.last_rcid;
        that.createCookie("rcfrom", ret.gtz, 1);
    });
};
Model.prototype.getLogSSE = function (view) {
    this.getDataSSE(view, 'log');
};
Model.prototype.getUserSSE = function (view) {
    this.getDataSSE(view, 'user');
};
Model.prototype.getStatSSE = function (view) {
    this.getDataSSE(view, 'stat');
};


Model.prototype.createCookie = function (name, value, days) {
    var expires, date;
    if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
};
Model.prototype.readCookie = function (name) {
    var nameEQ = escape(name) + "=", ca = document.cookie.split(';'), i, c;
    for (i = 0; i < ca.length; i++) {
        c = ca[i];
        while (c.charAt(0) === ' ') {c = c.substring(1, c.length); }
        if (c.indexOf(nameEQ) === 0) {return unescape(c.substring(nameEQ.length, c.length)); }
    }
    return null;
};
Model.prototype.eraseCookie = function (name) {
    this.createCookie(name, "", -1);
};

function View() {
    //Twitter Bootstrap keep-open class
    $('.dropdown-menu').click(function (event) {
        if ($(this).hasClass('keep-open')) {
            event.stopPropagation();
        }
    });
    // declaring Nanobar as global variable
    var nanobarOptions = {bg: '#C0C0C0'};
    window.nanobar = new Nanobar(nanobarOptions);
    // Bind .ns to show help
    $(document).on("click", ".ns", function () {
        $('#help').modal('show');
    });
}
View.prototype.displayBar = function (pos) {
    nanobar.go(pos);
};
View.prototype.displayData = function (type, data) {
    switch (type) {
    case "rc":
        return this.displayRC(data);
    case "log":
        return this.displayLog(data);
    case "user":
        return this.displayUser(data);
    case "stat":
        return this.displayStat(data);
    default:
        console.log(data);
        break;
    }
};
View.prototype.displayRC = function (data) {
    this.displayBar(100);
    var base_site = "http://" + data.config.language + "." + data.config.project + ".org/";
    var gtz = data.params.gtz;
    var last_rcid = data.params.last_rcid;
    var len = data.length;
    var tz = gtz;
    var i, j, diff, s_diff, comment, attr, time, show_art;
    var cell, row, spaceElem, diffElem, linkElem, diffClass, userElem, spanElem;
    for (i = len - 1; i >= 0; i--) {
        if (last_rcid >= data[i].rcid) {
            continue;
        }
        last_rcid = data[i].rcid;
        //
        diff = (data[i].newlen - data[i].oldlen);
        s_diff = diff > 0 ? "+" + diff : diff;
        tz = data[i].timestamp;
        gtz = tz;
        time = new Date(tz);
        comment = data[i].parsedcomment.replace(/\"\/wiki\//g, "\"" + base_site + "wiki/");
        attr = "";
        // Attribute of the row
        if (data[i].hasOwnProperty('anon')) {attr += "anon "; }
        if (data[i].hasOwnProperty('bot')) {attr += "bot "; }
        if (data[i].hasOwnProperty('minor')) {attr += "minor "; }
        if (data[i].hasOwnProperty('redirect')) {attr += "redirect "; }
        if (data[i].hasOwnProperty('new')) {attr += "new-art "; }
        if (data.site.user.editor.hasOwnProperty(data[i].user.toLowerCase())) {attr += "editor "; }
        if (data.site.user.sysop.hasOwnProperty(data[i].user.toLowerCase())) {attr += "admin "; }
        if (attr === "") {attr = "others "; }
        attr += "revid-" + data[i].revid + " ";

        // "Deprecate" the old rows
        $(".revid-" + data[i].old_revid).addClass("inactive");

        row = document.createElement("tr");
        row.setAttribute("class", attr);
        row.setAttribute("id", "row-" + data[i].rcid);

        cell = [];
        cell[0] = document.createElement("td");
        cell[0].setAttribute("class", "ns ns-" + data[i].ns);
        cell[0].setAttribute("title", locale_obj.ns);

        cell[1] = document.createElement("td");
        cell[1].textContent = this.pad(time.getUTCHours())
            + ':' + this.pad(time.getUTCMinutes())
            + ':' + this.pad(time.getUTCSeconds());

        cell[2] = document.createElement("td");
        linkElem = document.createElement("a");
        linkElem.setAttribute("href", base_site
            + "w/index.php?title="
            + data[i].title
            + "&diff="
            + data[i].revid
            + "&oldid="
            + data[i].old_revid);
        linkElem.textContent = data[i].title;
        spaceElem = document.createElement("span");
        spaceElem.setAttribute("class", "nowrap");
        spaceElem.textContent = " . . ";
        diffElem = document.createElement("span");
        if (s_diff > 0) {
            diffClass = "size-pos";
        } else if (s_diff < 0) {
            diffClass = "size-neg";
        } else {
            diffClass = "size-null";
        }
        if (Math.abs(s_diff) > 500) {
            diffClass += " size-large";
        }
        diffElem.setAttribute("class", diffClass);
        diffElem.textContent = "(" + s_diff + ")";
        cell[2].appendChild(linkElem);
        cell[2].appendChild(spaceElem);
        cell[2].appendChild(diffElem);

        cell[3] = document.createElement("td");
        userElem = document.createElement("a");
        userElem.setAttribute("class", "username");
        userElem.setAttribute("href", base_site
            + "wiki/Special:Contributions/"
            + data[i].user);
        userElem.textContent = data[i].user;
        cell[3].appendChild(userElem);

        cell[4] = document.createElement("td");
        if (data[i].type === 'new') {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-success");
            spanElem.setAttribute("title", locale_obj.settings_new_pages);
            spanElem.textContent = locale_obj['new'];
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data[i].hasOwnProperty('minor')) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-primary");
            spanElem.setAttribute("title", locale_obj.settings_minor_edits);
            spanElem.textContent = locale_obj.minor;
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data[i].hasOwnProperty('anon')) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-danger");
            spanElem.setAttribute("title", locale_obj.settings_anon_edits);
            spanElem.textContent = locale_obj.anon;
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data[i].hasOwnProperty('redirect')) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-warning");
            spanElem.setAttribute("title", locale_obj.settings_redirects);
            spanElem.textContent = locale_obj.redirect;
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data[i].hasOwnProperty('bot')) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-info");
            spanElem.setAttribute("title", locale_obj.settings_bot_edits);
            spanElem.textContent = locale_obj.bot;
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data.site.user.editor.hasOwnProperty(data[i].user.toLowerCase())) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-default");
            spanElem.setAttribute("title", locale_obj.settings_editor_edits);
            spanElem.textContent = locale_obj.editor;
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data.site.user.sysop.hasOwnProperty(data[i].user.toLowerCase())) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-info");
            spanElem.setAttribute("title", locale_obj.settings_admin_edits);
            spanElem.textContent = locale_obj.admin;
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        // Show comments
        cell[4].insertAdjacentHTML('beforeend', comment);
        // Show tags
        if (data[i].tags.length > 0) {
            cell[4].insertAdjacentHTML('beforeend', " (Tag: <i>"
                + data[i].tags
                + "</i>)");
        }
        for (j = 0; j < 5; j++) {
            row.appendChild(cell[j]);
        }

        // add row to the table; don't show yet 
        $("#main-table-body").prepend(row);
        $('#main-table > tbody > tr#row-' + data[i].rcid).hide();
        $('#main-table > tbody > tr#row-' + data[i].rcid).addClass("new-entry");
        // show article
        show_art = true;
        if (attr.indexOf("bot") >= 0) {
            if (!data.config.show.bot) {
                show_art = false;
            }
        }
        if (attr.indexOf("minor") >= 0) {
            if (!data.config.show.minor) {
                show_art = false;
            }
        }
        if (attr.indexOf("redirect") >= 0) {
            if (!data.config.show.redirect) {
                show_art = false;
            }
        }
        if (attr.indexOf("new-art") >= 0) {
            if (!data.config.show.new) {
                show_art = false;
            }
        }
        if (attr.indexOf("anon") >= 0) {
            if (!data.config.show.anon) {
                show_art = false;
            }
        }
        if (attr.indexOf("admin") >= 0) {
            if (!data.config.show.admin) {
                show_art = false;
            }
        }
        if (attr.indexOf("editor") >= 0) {
            if (!data.config.show.editor) {
                show_art = false;
            }
        }
        if (attr.indexOf("others") >= 0) {
            if (!data.config.show.others) {
                show_art = false;
            }
        }
        if (show_art === true) {
            this.showRC('#main-table > tbody > tr#row-' + data[i].rcid);
        }
    }
    setTimeout(function () {
        $(".new-entry").removeClass("new-entry");
        $("div[style*='100%'], .nanobarbar").hide();
    }, 1000);
    return {'gtz': gtz, 'last_rcid': last_rcid};
};
View.prototype.showRC = function (elem) {
    $(elem).show();
};
View.prototype.hideRC = function (elem) {
    $(elem).hide();
};
View.prototype.ns = function (i) {
    return locale_obj['ns' + i];
};
View.prototype.pad = function (number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
};
View.prototype.displayLog = function (data) {
    console.log(data);
};
View.prototype.displayUser = function (data) {
    //console.log(data);
    return null;
};
View.prototype.formatnum = function (nStr) {
// http://www.mredkj.com/javascript/numberFormat.html
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? locale_obj.separator_decimals + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + locale_obj.separator_thousands + '$2');
    }
    return x1 + x2;
};
View.prototype.displayStat = function (data) {
    //console.log(data);
    var msg = "";
    // calc depth
    var depth = data.edits * (data.pages - data.articles) * (data.pages - data.articles) / (data.articles * data.articles * data.pages);
    // construct message
    msg += "<dl class=\"dl-horizontal\">"
        + "<dt>"
        + locale_obj.stat_articles
        + "</dt>"
        + "<dd>"
        + this.formatnum(data.articles)
        + "</dd>"
        // pages
        + "<dt>"
        + locale_obj.stat_pages
        + "</dt>"
        + "<dd>"
        + this.formatnum(data.pages)
        + "</dd>"
        // images
        + "<dt>"
        + locale_obj.stat_files
        + "</dt>"
        + "<dd>"
        + this.formatnum(data.images)
        + "</dd>"
        // edits
        + "<dt>"
        + locale_obj.stat_edits
        + "</dt>"
        + "<dd>"
        + this.formatnum(data.edits)
        + "</dd>"
        // depths
        + "<dt>"
        + locale_obj.stat_depth
        + "</dt>"
        + "<dd>"
        + this.formatnum(parseFloat(depth).toFixed(4))
        + "</dd>"
        // users
        + "<dt>"
        + locale_obj.stat_users
        + "</dt>"
        + "<dd>"
        + this.formatnum(data.users)
        + "</dd>"
        // active users
        + "<dt>"
        + locale_obj.stat_active_users
        + "</dt>"
        + "<dd>"
        + this.formatnum(data.activeusers)
        + "</dd>"
        // admins
        + "<dt>"
        + locale_obj.stat_admins
        + "</dt>"
        + "<dd>"
        + this.formatnum(data.admins)
        + "</dd>"
        + "</dl>";
    $("#w_stat").html(msg);
};

View.prototype.displayTime = function () {
    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }
    var date = new Date();
    var timeStr = date.getUTCFullYear() +
        '-' + pad(date.getUTCMonth() + 1) +
        '-' + pad(date.getUTCDate()) +
        ' ' + pad(date.getUTCHours()) +
        ':' + pad(date.getUTCMinutes()) +
        ':' + pad(date.getUTCSeconds()) +
        ' UTC';
    $("#tz").html(timeStr);
    var that = this;
    setTimeout(function () { that.displayTime(); }, 1000);
};
function Controller(model, view) {
    this.view = view;
    this.model = model;
}
Controller.prototype.init = function () {
    this.model.init(this.view);
};
var raunController = new Controller(new Model(), new View());
raunController.init();