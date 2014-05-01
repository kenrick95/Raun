/*jslint sloppy: true, plusplus:true, browser: true, unparam:true, vars:true, continue:true */
/*global force, console, locale_obj, locale_msg, nanobar, Nanobar, escape, unescape, EventSource, $, jQuery, clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false */
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

// [disabled] * "run", the tools is running (opposite of "pause")
// [not yet implemented] * "notification", involves starting the Web Notification API

* "get" invokes ajax call or getting data from local storage
* "display" involves manipulating data shown in screen
* "update" involves manipulating the data in the temporary memory, local storage, or cookie

*/
function Model() {
    return;
}
Model.prototype.config = {
    "show": {
        "bot": false,
        "anon": true,
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
    "stat": null,
    "filter": ["bot", "anon", "new", "minor", "redirect", "editor", "admin", "others"],
};
Model.prototype.init = function (view) {
    var that = this;
    // Settings
    if (force.language === 0) {
        if (this.readCookie("language") === null) {
            this.createCookie("language", this.config.language, 30);
        }
        view.displaySettings({"language": this.readCookie("language")});
    } else {
        this.createCookie("language", $("#language").val(), 30);
    }
    if (force.project === 0) {
        if (this.readCookie("project") === null) {
            this.createCookie("project", this.config.project, 30);
        }
        view.displaySettings({"project": this.readCookie("project")});
    } else {
        this.createCookie("project", $("#project").val(), 30);
    }
    if (force.locale === 0) {
        if (this.readCookie("locale") === null) {
            this.createCookie("locale", this.config.locale, 30);
        }
        view.displaySettings({"locale": this.readCookie("locale")});
    } else {
        this.createCookie("locale", $("#locale").val(), 30);
    }
    // LocalStorage get data, if not exists, store default data
    var temp_string = localStorage.getItem("config");
    var keys, disp = [];
    if (temp_string) {
        this.config = JSON.parse(temp_string);
    } else {
        localStorage.setItem("config", JSON.stringify(this.config));
    }
    for (keys in this.data.filter) {
        if (this.data.filter.hasOwnProperty(keys)) {
            disp[this.data.filter[keys]] = this.config.show[this.data.filter[keys]];
        }
    }
    view.displayFilter(disp);

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
    // console.log(sendData);
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
Model.prototype.source = null;
Model.prototype.initSSE = function () {
    this.createCookie("rcfrom", "", 1);
    this.source = new EventSource('api-sse-rewrite.php');
    this.source.addEventListener('error', function (e) {
        console.log(e);
    }, false);
};
Model.prototype.getDataSSE = function (view, type, params, callback) {
    var that = this;
    this.source.addEventListener(type, function (e) {
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
    this.initSSE();
    this.getDataSSE(view, 'rc', {gtz: 0, last_rcid: 0}, function (ret, data, callback) {
        data.params.gtz = ret.gtz;
        data.params.last_rcid = ret.last_rcid;
        that.createCookie("rcfrom", ret.gtz, 1);
    });
    //this.getDataSSE(view, 'debug');
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
Model.prototype.getFilter = function (property) {
    return $("#show_" + property).prop("checked");
};
Model.prototype.updateFilter = function (view) {
    var new_config = {
        "show": {
            "bot": this.getFilter("bot"),
            "anon": this.getFilter("anon"),
            "new": this.getFilter("new"),
            "minor": this.getFilter("minor"),
            "redirect": this.getFilter("redirect"),
            "editor": this.getFilter("editor"),
            "admin": this.getFilter("admin"),
            "others": this.getFilter("others"),
        }
    };
    var keys;
    for (keys in this.data.filter) {
        if (this.data.filter.hasOwnProperty(keys)) {
            if (new_config.show[this.data.filter[keys]] && !this.config.show[this.data.filter[keys]]) {
                if (this.data.filter[keys] === "new") {
                    view.showRC(".new-art");
                } else {
                    view.showRC("." + this.data.filter[keys]);
                }
            }
        }
    }
    for (keys in this.data.filter) {
        if (this.data.filter.hasOwnProperty(keys)) {
            if (!new_config.show[this.data.filter[keys]]) {
                if (this.data.filter[keys] === "new") {
                    view.hideRC(".new-art");
                } else {
                    view.hideRC("." + this.data.filter[keys]);
                }
            }
        }
    }
    // Update the data
    for (keys in this.data.filter) {
        if (this.data.filter.hasOwnProperty(keys)) {
            this.config.show[this.data.filter[keys]] = new_config.show[this.data.filter[keys]];
        }
    }
    // Store the data
    localStorage.setItem("config", JSON.stringify(this.config));

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

    // Bind .combined to show individual entries
    $(document).on("click", ".combined", function () {
        var pageid = $(this).data("pageid");
        $(".pageid-" + pageid + ":not(.combined)").toggle();
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
    var cell, row, combined, combined_diff, spaceElem, diffElem, linkElem, diffClass, userElem, spanElem;
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
        attr += "new-entry ";
        attr += "revid-" + data[i].revid + " ";
        attr += "pageid-" + data[i].pageid + " ";

        row = document.createElement("tr");
        row.setAttribute("class", attr);
        row.setAttribute("style", "display: none;");
        row.setAttribute("id", "row-" + data[i].rcid);

        cell = [];
        // Create cells
        for (j = 0; j < 5; j++) {
            cell[j] = document.createElement("td");
        }
        // Cell 0: Namespace
        cell[0].setAttribute("class", "ns ns-" + data[i].ns);
        cell[0].setAttribute("title", locale_msg('ns') + ": " + this.ns(data[i].ns));

        // Cell 1: Time
        cell[1].textContent = this.pad(time.getUTCHours())
            + ':' + this.pad(time.getUTCMinutes())
            + ':' + this.pad(time.getUTCSeconds());

        // Cell 2: Article (and diff)
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

        // Cell 3: User
        userElem = document.createElement("a");
        userElem.setAttribute("class", "username");
        userElem.setAttribute("href", base_site
            + "wiki/Special:Contributions/"
            + data[i].user);
        userElem.textContent = data[i].user;
        cell[3].appendChild(userElem);

        // Cell 4: Information
        if (data[i].type === 'new') {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-success");
            spanElem.setAttribute("title", locale_msg('settings_new_pages'));
            spanElem.textContent = locale_msg('new');
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data[i].hasOwnProperty('minor')) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-primary");
            spanElem.setAttribute("title", locale_msg('settings_minor_edits'));
            spanElem.textContent = locale_msg('minor');
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data[i].hasOwnProperty('anon')) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-danger");
            spanElem.setAttribute("title", locale_msg('settings_anon_edits'));
            spanElem.textContent = locale_msg('anon');
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data[i].hasOwnProperty('redirect')) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-warning");
            spanElem.setAttribute("title", locale_msg('settings_redirects'));
            spanElem.textContent = locale_msg('redirect');
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data[i].hasOwnProperty('bot')) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-info");
            spanElem.setAttribute("title", locale_msg('settings_bot_edits'));
            spanElem.textContent = locale_msg('bot');
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data.site.user.editor.hasOwnProperty(data[i].user.toLowerCase())) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-default");
            spanElem.setAttribute("title", locale_msg('settings_editor_edits'));
            spanElem.textContent = locale_msg('editor');
            cell[4].appendChild(spanElem);
            cell[4].insertAdjacentHTML('beforeend', " ");
        }
        if (data.site.user.sysop.hasOwnProperty(data[i].user.toLowerCase())) {
            spanElem = document.createElement("span");
            spanElem.setAttribute("class", "label label-info");
            spanElem.setAttribute("title", locale_msg('settings_admin_edits'));
            spanElem.textContent = locale_msg('admin');
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

        // Insert all cell to row
        for (j = 0; j < 5; j++) {
            row.appendChild(cell[j]);
        }

        $(row).data("diff", diff);

        // Combined row
        if ($(".revid-" + data[i].old_revid).length > 0) {
            $(row).data("oldest_revid", $(".pageid-" + data[i].pageid).last().data("oldest_revid"));
            // "Deprecate" the old rows
            $(".revid-" + data[i].old_revid).addClass("inactive");
            $(".revid-" + data[i].old_revid + ".inactive.combined").remove();
            // add a "combined row"
            combined = row.cloneNode(true);
            combined.removeAttribute("id");
            combined.removeAttribute("style");
            combined.setAttribute("class", combined.getAttribute("class") + "combined");
            cell = combined.childNodes;
            cell[1].textContent += "";
            cell[2].childNodes[0].setAttribute("href", cell[2].childNodes[0].getAttribute("href").replace(/oldid=[0-9]*/, "oldid=" + $(row).data("oldest_revid")));
            combined_diff = diff + this.calculateDiff(".pageid-" + data[i].pageid);

            if (combined_diff > 0) {
                diffClass = "size-pos";
            } else if (combined_diff < 0) {
                diffClass = "size-neg";
            } else {
                diffClass = "size-null";
            }
            if (Math.abs(s_diff) > 500) {
                diffClass += " size-large";
            }
            cell[2].childNodes[2].setAttribute("class", diffClass);
            cell[2].childNodes[2].textContent = "(" + (combined_diff > 0 ? "+" : "") + combined_diff + ")";
            cell[3].textContent = locale_msg('combined_entries');
            cell[4].textContent = "";
            for (j = 0; j < 5; j++) {
                combined.replaceChild(combined.childNodes[j], cell[j]);
            }
            $(".pageid-" + data[i].pageid).addClass("combined-child");
            $(row).addClass("combined-child");
            $(combined).data("pageid", data[i].pageid);

            $("#main-table-body").prepend($(".pageid-" + data[i].pageid));
            $("#main-table-body").prepend(row);
            $("#main-table-body").prepend(combined);
        } else {
            // add row to the table
            $(row).data("oldest_revid", data[i].old_revid);
            $("#main-table-body").prepend(row);
        }


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
            this.showRC('#main-table > tbody > tr#row-' + data[i].rcid + ":not(.combined-child)");
        }
    }
    setTimeout(function () {
        $(".new-entry").removeClass("new-entry");
        $("div[style*='100%'], .nanobarbar").hide();
    }, 1000);
    return {'gtz': gtz, 'last_rcid': last_rcid};
};
View.prototype.calculateDiff = function (elem) {
    var diff = 0;
    $(elem).each(function (index) {
        diff += parseInt($(this).data("diff"), 10);
    });
    return diff;
};
View.prototype.showRC = function (elem) {
    $(elem).show();
};
View.prototype.hideRC = function (elem) {
    $(elem).hide();
};
View.prototype.ns = function (i) {
    return locale_msg('ns' + i);
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
    var x2 = x.length > 1 ? locale_msg('separator_decimals') + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + locale_msg('separator_thousands') + '$2');
    }
    return x1 + x2;
};
View.prototype.displayStat = function (data) {
    //console.log(data);
    var msg, i, j = 0;
    // calc depth
    var depth = data.edits * (data.pages - data.articles) * (data.pages - data.articles) / (data.articles * data.articles * data.pages);
    // construct message
    msg = document.createElement("dl");
    msg.setAttribute("class", "dl-horizontal");
    var dtElem = [];
    for (i = 0; i < 8; i++) {
        dtElem[i] = document.createElement("dt");
    }

    dtElem[0].textContent = locale_msg('stat_articles');
    dtElem[1].textContent = locale_msg('stat_pages');
    dtElem[2].textContent = locale_msg('stat_files');
    dtElem[3].textContent = locale_msg('stat_edits');
    dtElem[4].textContent = locale_msg('stat_depth');
    dtElem[5].textContent = locale_msg('stat_users');
    dtElem[6].textContent = locale_msg('stat_active_users');
    dtElem[7].textContent = locale_msg('stat_admins');

    var ddElem = [];
    for (i = 0; i < 8; i++) {
        ddElem[i] = document.createElement("dd");
    }

    ddElem[0].textContent = this.formatnum(data.articles);
    ddElem[1].textContent = this.formatnum(data.pages);
    ddElem[2].textContent = this.formatnum(data.images);
    ddElem[3].textContent = this.formatnum(data.edits);
    ddElem[4].textContent = this.formatnum(parseFloat(depth).toFixed(4));
    ddElem[5].textContent = this.formatnum(data.users);
    ddElem[6].textContent = this.formatnum(data.activeusers);
    ddElem[7].textContent = this.formatnum(data.admins);

    for (i = 0; i < 16; i++) {
        if (i % 2 === 0) {
            msg.appendChild(dtElem[j]);
        } else {
            msg.appendChild(ddElem[j]);
            j++;
        }
    }
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
View.prototype.displaySettings = function (obj) {
    var keys;
    for (keys in obj) {
        if (obj.hasOwnProperty(keys)) {
            $("#" + keys).val(obj[keys]);
        }
    }
};
View.prototype.displayFilter = function (obj) {
    var keys;
    for (keys in obj) {
        if (obj.hasOwnProperty(keys)) {
            $("#show_" + keys).prop("checked", obj[keys] === true);
        }
    }
};
function Controller(model, view) {
    this.view = view;
    this.model = model;
}
Controller.prototype.init = function () {
    var that = this;
    this.model.init(this.view);
    $(".config").change(function () {
        that.model.updateFilter(that.view);
    });
};

var raunController = new Controller(new Model(), new View());
raunController.init();