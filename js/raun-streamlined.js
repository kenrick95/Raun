/*jslint sloppy: true, plusplus:true, browser: true, unparam:true, vars:true, continue:true */
/*global force, console, locale_obj, locale_msg, nanobar, Nanobar, Headroom, escape, unescape, io, $, jQuery, clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false */
/**
 * Raun-streamlined.js
 *
 * @author Kenrick
 * @description
 * - One of most fundamental part of Raun: javascript.
 * - The data came and processed first here before being displayed.
 *
 * Some important notes:
 * - "project" refer to WMF wikis project
 * - "language" refer to the language WMF wikis project
 * - "locale" refer to the language used in Raun
 * 
 * - "data" consists of "rc", "user", and "stat"
 * -- "rc" is the entries of recent changes of the project
 * -- "user" is the user list
 * -- "stat" is the project statistics
 *
 * Current ISSUES:
 * - Reliance on DOM for storing/ getting data of entry (row) --> Slow performance
 * - User list is limited to 500 entries per API request
 * 
 */
/**
 * Model
 * @class
 */
function Model() {
    return;
}

/**
 * Model: config
 * @description Configurations of Raun, can be saved or restored from localStorage
 * @type {Object}
 */
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
/**
 * Model: Data
 * @description Data for Raun, some are constants, others are obtained from WMF API
 * @type {Object}
 */
Model.prototype.data = {
    "user": null,
    "stat": null,
    "filter": ["bot", "anon", "new", "minor", "redirect", "editor", "admin", "others"],
    "filter-class": ["bot", "anon", "new-art", "minor", "redirect", "editor", "admin", "others"]
};

/**
 * Model: Initialization
 * @description Initialize the Model by:
 *      - Reading configurations from URL (GET), cookies, and localStorage
 *      - Get data from WMF API for filtering purposes
 * @param  {Object} view
 * @return {None}
 * 
 */
Model.prototype.init = function (view) {
    var that = this;
    var site_config = {};

    // Settings
    that.config.run = true;
    function setConfig(param) {
        if (parseInt(force[param], 10) === 0) {
            if (that.readCookie(param) === null) {
                that.createCookie(param, that.config[param], 30);
            }
            view.displaySettings({param: that.readCookie(param)});
            site_config[param] = that.readCookie(param);

            // Run only if the parameters are set by GET
            that.config.run = false;
        } else {
            that.createCookie(param, $("#" + param).val(), 30);

            that.config[param] = $("#" + param).val();
            site_config[param] = that.config[param];
        }
    }
    setConfig("language");
    setConfig("project");
    setConfig("locale");


    // LocalStorage get data, if not exists, store default data
    var temp_string = localStorage.getItem("config");
    var keys, disp = [];



    if (temp_string && force.locale && force.language && force.project) {
        this.config = JSON.parse(temp_string);
        that.config.run = true;
        this.config.language = site_config.language;
        this.config.locale = site_config.locale;
        this.config.project = site_config.project;
    } else {
        this.config.language = site_config.language;
        this.config.locale = site_config.locale;
        this.config.project = site_config.project;
        localStorage.setItem("config", JSON.stringify(this.config));
    }
    for (keys in this.data.filter) {
        if (this.data.filter.hasOwnProperty(keys)) {
            disp[this.data.filter[keys]] = this.config.show[this.data.filter[keys]];
        }
    }
    view.displayFilter(disp);

    // Quick hack to prevent error when user closes landing modal
    $('#landing').on('hide.bs.modal', function (e) {
        that.config.run = true;
        if (that.canRun() === 1) {
            that.getRCOnce(view, function (view) {
                that.getRCStream(view);
            });
            that.getStatPolling(view);
        } else if (that.canRun() === 2) {
            that.getRCPolling(view);
            that.getStatPolling(view);
        }
    });

    this.data.user = [];
    /*
    Open issue:
        there is a limit of 500 usernames listed as admin in one ajax call;
        which means expect some edits not tagged as admin edits at big wikis like en.wikipedia.
    */
    this.getUserPolling(view, 'sysop', function (view) {
        that.getUserPolling(view, 'editor', function (view) {
            if (that.canRun() === 1) {
                that.getRCOnce(view, function (view) {
                    that.getRCStream(view);
                });
                that.getStatPolling(view);
            } else if (that.canRun() === 2) {
                that.getRCPolling(view);
                that.getStatPolling(view);
            }
        });
    });
    view.displayTime();


    return;
};

/***
 * Model: Polling
 */

/**
 * Model: Polling: getDataPolling
 * @description Initiates a ajax call and onSuccess, do a callback
 * @param  {Object}   view
 * @param  {String}   type
 * @param  {Object}   params
 * @param  {Function} callback
 * @return {None}
 */
Model.prototype.getDataPolling = function (view, type, params, callback) {
    var sendData = params, that =  this;
    sendData.project = this.config.project;
    sendData.language = this.config.language;
    sendData.type = type;
    // console.log(sendData);
    $.ajax({
        type: "POST",
        url: "api-polling.php",
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
            console.error(xhr);
        }
    });
};

/**
 * Model: Polling: getRCPolling
 * @description Constructs the parameters and callback of RC for calling getDataPolling
 * @param  {Object} view
 * @return {None}
 */
Model.prototype.getRCPolling = function (view) {
    var that = this;
    view.displayBar(50);
    this.getDataPolling(view, 'rc', {from: 0, gtz: 0, last_rcid: 0}, function (ret, data, callback) {
        setTimeout(function process(ret, data, callback) {
            var date = new Date(ret.gtz);
            data.params.from = date.getUTCFullYear()
                + that.pad(date.getUTCMonth() + 1)
                + that.pad(date.getUTCDate())
                + that.pad(date.getUTCHours())
                + that.pad(date.getUTCMinutes())
                + that.pad(date.getUTCSeconds());//yyyymmddhhmmss
            data.params.gtz = ret.gtz;
            data.params.last_rcid = ret.last_rcid;
            that.getDataPolling(view, 'rc', data.params, callback);
        }.bind(that, ret, data, callback), 5000);
    });
};
Model.prototype.getRCOnce = function (view, callback) {
    view.displayBar(50);
    this.getDataPolling(view, 'rc', {from: 0, gtz: 0, last_rcid: 0}, function() {
        if (typeof(callback) === "function") {
            callback(view);
        }
    } );
};
Model.prototype.pad = function (number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
};
/**
 * Model: Polling: getLogPolling
 * @description Supposed to get Log from WMF API, but still unsure yet, i.e. unused
 * @param  {Object} view
 * @return {None}
 */
Model.prototype.getLogPolling = function (view) {
    this.getDataPolling(view, 'log');
};

/**
 * Model: Polling: getUserPolling
 * @description
 *      - Creates the parameter of getting user data via getDataPolling
 *      - store the data returned from getDataPolling
 * @param  {Object}   view
 * @param  {String}   group, the user's group (e.g. "sysop")
 * @param  {Function} callback
 * @return {None}
 */
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

/**
 * Model: Polling: getStatPolling
 * @description Creates the parameter and callback of getting statistics via getDataPolling
 * @param  {Object} view
 * @return {None}
 */
Model.prototype.getStatPolling = function (view) {
    var that = this;
    this.getDataPolling(view, 'stat', {method: 'stat'}, function (ret, data, callback) {
        setTimeout(function process(ret, data, callback) {
            that.getDataPolling(view, 'stat', data.params, callback);
        }.bind(that, ret, data, callback), 5000);
    });
};

/**
 * Model: Socket.io
 */
Model.prototype.initStream = function () {
    var socket = io.connect('stream.wikimedia.org/rc');
    var that = this;

    socket.on('connect', function () {
        socket.emit('subscribe', that.config.language + "." + that.config.project + '.org'); //test
    });

    return socket;
};
Model.prototype.getRCStream = function (view) {
    var socket = this.initStream();
    var that = this;
    socket.on('change', function (data) {
        data.config = that.config;
        data.site = that.data;
        view.displayData("rcstream", data);
    });
};

/*
 * Model: Filter
 */

/**
 * Model: Filter: getFilter
 * @description get filter preference from DOM
 * @param  {String} property
 * @return {Boolean} True or False
 */
Model.prototype.getFilter = function (property) {
    return $("#show_" + property).prop("checked");
};

/**
 * Model: Filter: updateFilter
 * @description
 *      - get current filter preference
 *      - decides whether to update the view or not
 *      - update and store (to localStorage) the config property
 * @param  {Object} view
 * @return {None}
 */
Model.prototype.updateFilter = function (view) {
    var new_config = {
        "show": {}
    };
    var len = this.data.filter.length, j;
    for (j = 0; j < len; j++) {
        new_config.show[this.data.filter[j]] = this.getFilter(this.data.filter[j]);
    }
    for (j = 0; j < len; j++) {
        if (new_config.show[this.data.filter[j]] && !this.config.show[this.data.filter[j]]) {
            view.showRC("." + this.data['filter-class'][j]);
        }
    }
    for (j = 0; j < len; j++) {
        if (!new_config.show[this.data.filter[j]]) {
            view.hideRC("." + this.data['filter-class'][j]);
        }
    }
    // Update the data
    for (j = 0; j < len; j++) {
        this.config.show[this.data.filter[j]] = new_config.show[this.data.filter[j]];
    }
    // Store the data
    localStorage.setItem("config", JSON.stringify(this.config));

};


/**
 * Model: Others
 * @description Other functions needed for the model to work
 */

/**
 * Model: Others: canRun
 * @description Decides if the tool can be run or not, if can, decides which method
 * @return {Number} 0 if can't run; 1 if supports SSE and recommends it; 2 use polling
 */
Model.prototype.canRun = function () {
    if (!this.config.run) {
        return 0;
    }
    if (!!window.io) {
        return 1;
    }
    return 2;
};
/**
 * Model: Others: createCookie
 * @author Peter-Paul Koch, http://www.quirksmode.org/js/cookies.html
 * @param  {String} name
 * @param  {String|Number} value
 * @param  {Number} days
 * @return {None}
 */
Model.prototype.createCookie = function (name, value, days) {
    localStorage.setItem(name, value);
    // var expires, date;
    // if (days) {
    //     date = new Date();
    //     date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    //     expires = "; expires=" + date.toGMTString();
    // } else {
    //     expires = "";
    // }
    // document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
};

/**
 * Model: Others: readCookie
 * @author Peter-Paul Koch, http://www.quirksmode.org/js/cookies.html
 * @param  {String} name
 * @return {None}
 */
Model.prototype.readCookie = function (name) {
    return localStorage.getItem(name);
    // var nameEQ = escape(name) + "=", ca = document.cookie.split(';'), i, c;
    // for (i = 0; i < ca.length; i++) {
    //     c = ca[i];
    //     while (c.charAt(0) === ' ') {c = c.substring(1, c.length); }
    //     if (c.indexOf(nameEQ) === 0) {return unescape(c.substring(nameEQ.length, c.length)); }
    // }
    // return null;
};

/**
 * Model: Others: eraseCookie
 * @author Peter-Paul Koch, http://www.quirksmode.org/js/cookies.html
 * @param  {String} name
 * @return {None}
 */
Model.prototype.eraseCookie = function (name) {
    localStorage.removeItem(name);
    // this.createCookie(name, "", -1);
};


/**
 * View
 * 
 * @class
 *
 * Constructor contains hacks on view:
 * - Twitter Bootstrap keep-open class
 * - Declaring Nanobar as global variable
 * - Bind .combined to show individual entries
 * - Show landing modal on unforced config
 * - Bind header to Headroomjs
 * 
 */
function View() {
    // Twitter Bootstrap keep-open class
    $('.dropdown-menu').click(function (event) {
        if ($(this).hasClass('keep-open')) {
            event.stopPropagation();
        }
    });

    // declaring Nanobar as global variable
    var nanobarOptions = {bg: '#ddd'};
    window.nanobar = new Nanobar(nanobarOptions);

    // Bind .combined to show individual entries
    $(document).on("click", ".combined", function () {
        var pageid = $(this).data("pageid");
        $(".pageid-" + pageid + ":not(.combined)").toggle();
    });

    // Show landing modal on unforced config
    if (parseInt(force.language, 10) === 0 || parseInt(force.project, 10) === 0 || parseInt(force.locale, 10) === 0) {
        $("#landing").modal("show");
    }

    // // Statistics positioning on resize
    // function onresize() {
    //     function prevDeft(e) {
    //         e.preventDefault();
    //     }
    //     function toggle() {
    //         $(this).dropdown('toggle');
    //     }
    //     function notToggle(e) {
    //         console.log(e);
    //         e.stopPropagation();
    //     }
    //     if (window.innerWidth >= 1200) {
    //         // lg, show at side
    //         $("#stat-container-menu").addClass("open");
    //         //$(document).on("hide.bs.dropdown", prevDeft);
    //         $(document).on("click", ":not(.stop-toggle)", notToggle);
    //         //$(document).on("click", ".dropdown-toggle", toggle);
    //     } else {
    //         // xs, sm, md: hide to menu
    //         $("#stat-container-menu").removeClass("open");
    //         //$(document).off("hide.bs.dropdown", prevDeft);
    //         $(document).off("click", ":not(.stop-toggle)", notToggle);
    //     }
    // }
    // $(window).resize(onresize());

    // Bind header to Headroomjs
    // grab an element
    var myElement = document.querySelector("#header");
    // construct an instance of Headroom, passing the element
    this.headroom  = new Headroom(myElement);
    // initialise
    this.headroom.init();
}


/*
 * View: Nanobar
 */

/**
 * View: Nanobar: displayBar
 * @param  {Number} pos: from 0 to 100
 * @return {None}
 */
View.prototype.displayBar = function (pos) {
    nanobar.go(pos);
};
/**
 * View: isAnon
 * @description "stream" data does not provide the functionality, determine if it is anon user from its username
 * @param  {String} username
 * @return {Boolean} true if the username is IP
 */
View.prototype.isAnon = function (username) {
    // http://stackoverflow.com/a/5865849
    // http://stackoverflow.com/a/17871737
    return (username.search(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/) > -1)
        || (username.search(/(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/i) > -1);
};

/**
 * View: displayData
 * @description redirects data to be shown in the view according to the type
 * @param  {String} type
 * @param  {Object} data
 * @return {None}
 */
View.prototype.displayData = function (type, data) {
    switch (type) {
    case "rc":
        return this.displayRC(data);
    case "rcstream":
        return this.displayRCStream(data);
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
View.prototype.displaySingleRC = function (data) {
    var j, comment;
    if (!!data.parsedcomment) {
        comment = data.parsedcomment.replace(/\"\/wiki\//g, "\"" + data.server_url + "wiki/");
    } else {
        comment = '';
    }

    data.pageid = data.title.hashCode(); // "stream" data does not have pageid, generate one from title

    // Attribute of the row
    var attr = "";
    if (data.hasOwnProperty('anon')) {attr += "anon "; }
    if (data.hasOwnProperty('bot') && !!data.bot) {attr += "bot "; }
    if (data.hasOwnProperty('minor') && !!data.minor) {attr += "minor "; }
    if (data.hasOwnProperty('redirect') || data.type === "redirect") {attr += "redirect "; }
    if (data.hasOwnProperty('new') || data.type === "new") {attr += "new-art "; }
    if (data.site.user.editor.hasOwnProperty(data.user.toLowerCase())) {attr += "editor "; }
    if (data.site.user.sysop.hasOwnProperty(data.user.toLowerCase())) {attr += "admin "; }
    if (attr === "") {attr = "others "; }

    attr += "new-entry card list-group-item ";
    attr += "pageid-" + data.pageid + " ";
    attr += "revid-" + data.revid + " ";
    attr += "ns ns-" + data.ns + " ";

    // Create card
    var card = document.createElement("div");
    card.setAttribute("class", attr);
    card.setAttribute("style", "display: none;");
    card.setAttribute("id", "card-" + data.rcid);

    // Create cells
    var cell = [];
    cell[1] = document.createElement("h4");
    for (j = 2; j < 5; j++) {
        cell[j] = document.createElement("div");
    }

    // Diff
    var diffElem = document.createElement("span");

    var diff = (data.newlen - data.oldlen);
    var s_diff = diff;
    var diffClass = "badge ";
    if (diff > 0) {
        diffClass += "size-pos";
        s_diff = "+" + diff;
    } else if (diff < 0) {
        diffClass += "size-neg";
    } else {
        diffClass += "size-null";
    }
    diffElem.setAttribute("class", diffClass);
    diffElem.textContent = s_diff;
    card.appendChild(diffElem);

    // Cell 1: Article (and diff)
    cell[1].setAttribute("class", "list-group-item-heading link");

    // Article link
    var linkElem = document.createElement("a");
    linkElem.setAttribute("href", data.server_url
        + "w/index.php?title="
        + data.title
        + "&diff="
        + data.revid
        + "&oldid="
        + data.old_revid);
    linkElem.textContent = data.title;

    cell[1].appendChild(linkElem);

    // Cell 2: Time
    cell[2].setAttribute("class", "list-group-item-text time");

    // Icon
    var timeIcon = document.createElement("span");
    timeIcon.setAttribute("class", "glyphicon glyphicon-time");
    timeIcon.setAttribute("title", locale_msg('main_time_utc'));

    // Content
    var time = new Date(data.timestamp);
    var timeContent = document.createElement("span");
    timeContent.textContent = this.pad(time.getUTCHours())
        + ':' + this.pad(time.getUTCMinutes())
        + ':' + this.pad(time.getUTCSeconds());

    cell[2].appendChild(timeIcon);
    cell[2].insertAdjacentHTML('beforeend', " ");
    cell[2].appendChild(timeContent);

    // Cell 3: User
    cell[3].setAttribute("class", "list-group-item-text user");

    // Icon
    var userIcon = document.createElement("span");
    userIcon.setAttribute("class", "glyphicon glyphicon-user");
    userIcon.setAttribute("title", locale_msg('main_user'));

    var userElem = document.createElement("a");
    userElem.setAttribute("class", "username");
    userElem.setAttribute("href", data.server_url
        + "wiki/Special:Contributions/"
        + data.user);
    userElem.textContent = data.user;

    cell[3].appendChild(userIcon);
    cell[3].insertAdjacentHTML('beforeend', " ");
    cell[3].appendChild(userElem);

    // Cell 4: Information
    cell[4].setAttribute("class", "list-group-item-text info");

    // Icon
    var tagIcon = document.createElement("span");
    tagIcon.setAttribute("class", "glyphicon glyphicon-tags");
    tagIcon.setAttribute("title", locale_msg('main_info'));

    cell[4].appendChild(tagIcon);
    cell[4].insertAdjacentHTML('beforeend', " ");

    if (data.type === 'new') {
        cell[4].appendChild(this.createLabel("label-success", locale_msg('settings_new_pages'), locale_msg('new')));
        cell[4].insertAdjacentHTML('beforeend', " ");
    }
    if (data.hasOwnProperty('minor') && !!data.minor) {
        cell[4].appendChild(this.createLabel("label-primary", locale_msg('settings_minor_edits'), locale_msg('minor')));
        cell[4].insertAdjacentHTML('beforeend', " ");
    }
    if (data.hasOwnProperty('anon')) {
        cell[4].appendChild(this.createLabel("label-danger", locale_msg('settings_anon_edits'), locale_msg('anon')));
        cell[4].insertAdjacentHTML('beforeend', " ");
    }
    if (data.hasOwnProperty('redirect') || data.type === "redirect") {
        cell[4].appendChild(this.createLabel("label-warning", locale_msg('settings_redirects'), locale_msg('redirect')));
        cell[4].insertAdjacentHTML('beforeend', " ");
    }
    if (data.hasOwnProperty('bot') && !!data.bot) {
        cell[4].appendChild(this.createLabel("label-info", locale_msg('settings_bot_edits'), locale_msg('bot')));
        cell[4].insertAdjacentHTML('beforeend', " ");
    }
    if (data.site.user.editor.hasOwnProperty(data.user.toLowerCase())) {
        cell[4].appendChild(this.createLabel("label-default", locale_msg('settings_editor_edits'), locale_msg('editor')));
        cell[4].insertAdjacentHTML('beforeend', " ");
    }
    if (data.site.user.sysop.hasOwnProperty(data.user.toLowerCase())) {
        cell[4].appendChild(this.createLabel("label-info", locale_msg('settings_admin_edits'), locale_msg('admin')));
        cell[4].insertAdjacentHTML('beforeend', " ");
    }
    // Show comments
    cell[4].insertAdjacentHTML('beforeend', comment);

    // Show tags
    if (data.hasOwnProperty("tags") && data.tags.length > 0) {
        cell[4].insertAdjacentHTML('beforeend', " (Tag: <i>"
            + data.tags
            + "</i>)");
    }

    // Don't show the cell if nothing is inside
    if (cell[4].textContent === " ") {
        cell[4] = document.createElement("div");
        cell[4].setAttribute("class", "list-group-item-text info");
    }

    // Insert all cell to card
    for (j = 1; j < 5; j++) {
        card.appendChild(cell[j]);
    }

    $(card).data("diff", diff);

    // Combined card
    if ($(".revid-" + data.old_revid).length > 0) {
        $(card).data("oldest_revid", $(".pageid-" + data.pageid).last().data("oldest_revid"));

        // "Deprecate" the old cards
        $(".revid-" + data.old_revid).addClass("inactive");

        // Remove old combined card
        $(".revid-" + data.old_revid + ".inactive.combined").remove();

        // add a "combined card"
        var combined = card.cloneNode(true);
        combined.removeAttribute("id");
        combined.removeAttribute("style");
        combined.setAttribute("class", combined.getAttribute("class") + "combined");

        // Construct the combined card
        cell = combined.childNodes;
        if (parseInt($(card).data("oldest_revid"), 10) === 0) {
            cell[1].childNodes[0].setAttribute("href", data.server_url + "wiki/" + data.title);
        } else {
            cell[1].childNodes[0].setAttribute("href", cell[1].childNodes[0].getAttribute("href").replace(/oldid=[0-9]*/, "oldid=" + $(card).data("oldest_revid")));
        }
        var combined_diff = diff + this.calculateDiff(".pageid-" + data.pageid);
        diffClass = "badge";
        if (combined_diff > 0) {
            diffClass += " size-pos";
        } else if (combined_diff < 0) {
            diffClass += " size-neg";
        } else {
            diffClass += " size-null";
        }
        cell[0].setAttribute("class", diffClass);
        cell[0].textContent = (combined_diff > 0 ? "+" : "") + combined_diff;

        cell[3].textContent = "";
        cell[4].setAttribute("class", "list-group-item-text info btn-link");
        cell[4].textContent = locale_msg('combined_entries');
        // Icon
        var caret = document.createElement("span");
        caret.setAttribute("class", "caret");
        cell[4].appendChild(caret);

        for (j = 0; j < 5; j++) {
            combined.replaceChild(combined.childNodes[j], cell[j]);
        }

        $(".pageid-" + data.pageid).addClass("combined-child");
        $(card).addClass("combined-child");
        if ($(".pageid-" + data.pageid + ".combined-child").is(":visible")) {
            $(card).show();
        }
        $(combined).data("pageid", data.pageid);

        // add card to the table
        $(".main").prepend($(".pageid-" + data.pageid));
        $(".main").prepend(card);
        $(".main").prepend(combined);
    } else {
        $(card).data("oldest_revid", data.old_revid);
        // add card to the table
        $(".main").prepend(card);
    }


    // show article
    var show_art = true;
    for (j = 0; j < data.site.filter.length; j++) {
        if (attr.indexOf(data.site['filter-class'][j]) >= 0 && !data.config.show[data.site.filter[j]]) {
            show_art = false;
        }
        if (!show_art) {
            break;
        }
    }
    if (show_art === true) {
        this.showRC('#card-' + data.rcid + ":not(.combined-child)");
    }
};
/**
* Prevent XSS attack done via edit summary.
*/
View.prototype.stringCleaner = function (value) {
    var lt = /</g, gt = />/g, ap = /'/g, ic = /"/g;
    value = value.toString().replace(lt, "&lt;").replace(gt, "&gt;").replace(ap, "&#39;").replace(ic, "&#34;");
    return value;
};
View.prototype.displayRCStream = function (data) {
    // console.log(data);
    if (data.type === "edit" || data.type === "new" || data.type === "redirect") {
        data.rcid = data.id;
        data.revid = data.revision.new;
        data.old_revid = data.revision.old;
        data.parsedcomment = this.stringCleaner(data.comment);
        data.server_url = "//" + data.server_name + "/";
        data.ns = data.namespace;
        // Note: in the "stream", there is no "pageid"
        data.newlen = data.length.new;
        data.oldlen = data.length.old;
        data.timestamp *= 1000; // the timestamp should be longer (for ms)
        if (this.isAnon(data.user)) {
            data.anon = true;
        }

        this.displaySingleRC(data);
        setTimeout(function () {
            $(".new-entry").removeClass("new-entry");
            $("div[style*='100%'].nanobarbar").hide();
            //update headroom on data display
            this.headroom.init();
        }.bind(this), 1000);
        $("#main-table-loading").remove();
    }
};
/**
 * View: displayRC
 * @description Parse RC data, constructs a nice row containing columns of namespace, time, page title, page editor, diffs, label, edit summary, and tags.
 * @param  {Object} data
 * @return {None}
 * @todo  Method is too long: separate this into more modular!
 */
View.prototype.displayRC = function (data) {
    // console.log(data);
    this.displayBar(100);

    var base_site = "//" + data.config.language + "." + data.config.project + ".org/";
    var gtz = data.params.gtz;
    var last_rcid = data.params.last_rcid;
    var len = data.length;
    var tz = gtz;

    var i;

    for (i = len - 1; i >= 0; i--) {
        if (last_rcid >= data[i].rcid) {
            continue;
        }
        last_rcid = data[i].rcid;
        tz = data[i].timestamp;
        gtz = tz;
        data[i].server_url = base_site;
        data[i].site = data.site;
        data[i].config = data.config;
        if (data[i].hasOwnProperty('bot')) { data[i].bot = true; }
        if (data[i].hasOwnProperty('minor')) { data[i].minor = true; }

        this.displaySingleRC(data[i]);
    }
    setTimeout(function () {
        $(".new-entry").removeClass("new-entry");
        $("div[style*='100%'].nanobarbar").hide();
        //update headroom on data display
        this.headroom.init();
    }.bind(this), 1000);
    $("#main-table-loading").remove();

    return {'gtz': gtz, 'last_rcid': last_rcid};
};

/**
 * View: displayLog
 * @description Not used
 * @param  {Object} data
 * @return {None}
 */
View.prototype.displayLog = function (data) {
    console.log(data);
};

/**
 * View: displayUser
 * @description Nothing
 * @param  {Object} data
 * @return {None}
 */
View.prototype.displayUser = function (data) {
    //console.log(data);
    return null;
};

/**
 * View: displayStat
 * @description parse data of statistics, calculate depth, and display them
 * @param  {Object} data
 * @return {None}
 */
View.prototype.displayStat = function (data) {
    var msg, i, j = 0;

    // Calculate depth
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

/**
 * View: displayTime
 * @author Mozilla Developer Network contributors, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
 * @description Get current time and display it
 * @return {None}
 */
View.prototype.displayTime = function () {
    var date = new Date();
    var timeStr = date.getUTCFullYear() +
        '-' + this.pad(date.getUTCMonth() + 1) +
        '-' + this.pad(date.getUTCDate()) +
        ' ' + this.pad(date.getUTCHours()) +
        ':' + this.pad(date.getUTCMinutes()) +
        ':' + this.pad(date.getUTCSeconds()) +
        ' UTC';
    $("#tz").html(timeStr);
    var that = this;
    setTimeout(function () { that.displayTime(); }, 1000);
};

/**
 * View: displaySettings
 * @param  {Object} obj
 * @return {None}
 */
View.prototype.displaySettings = function (obj) {
    var keys;
    for (keys in obj) {
        if (obj.hasOwnProperty(keys)) {
            $("#" + keys).val(obj[keys]);
        }
    }
};

/**
 * View: displayFilter
 * @param  {Object} obj
 * @return {None}
 */
View.prototype.displayFilter = function (obj) {
    var keys;
    for (keys in obj) {
        if (obj.hasOwnProperty(keys)) {
            $("#show_" + keys).prop("checked", obj[keys] === true);
        }
    }
};


/*
 * View: Others
 */

View.prototype.createLabel = function (className, title, textContent) {
    var elem = document.createElement("span");
    elem.setAttribute("class", "label " + className);
    elem.setAttribute("title", title);
    elem.textContent = textContent;
    return elem;
};

/**
 * View: Others: calculateDiff
 * @description calculate the total diff selected at "elem"
 * @param  {Object} elem
 * @return {Number} total diff
 */
View.prototype.calculateDiff = function (elem) {
    var diff = 0;
    $(elem).each(function (index) {
        diff += parseInt($(this).data("diff"), 10);
    });
    return diff;
};

/**
 * View: Others: showRC
 * @description show the entry of RC
 * @param  {Object} elem
 * @return {None}
 */
View.prototype.showRC = function (elem) {
    $(elem).show();
};

/**
 * View: Others: hideRC
 * @description hide the entry of RC
 * @param  {Object} elem
 * @return {None}
 */
View.prototype.hideRC = function (elem) {
    $(elem).hide();
};


/**
 * View: Others: ns
 * @description translate the namespace number to name of the namespace
 * @param  {Number} i, namepsace number as assigned by MediaWiki
 * @return {String} the name of the namespace
 */
View.prototype.ns = function (i) {
    return locale_msg('ns' + i);
};

/**
 * View: Others: pad
 * @param  {Number} number
 * @return {String} 2-digit string containing number, adding a leading zero if "number" is single digit
 */
View.prototype.pad = function (number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
};

/**
 * View: Others: formatnum
 * @author Keith Jenci, http://www.mredkj.com/javascript/numberFormat.html
 * @description Format the number: separate thousands and decimals with appropriate separator (according to languages)
 * @param  {String} nStr, string of numbers
 * @return {Number} Formatted number
 */
View.prototype.formatnum = function (nStr) {
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



/**
 * Controller
 * @class
 * 
 * @param {Object} model
 * @param {Object} view
 *
 * Stores "model" and "view" to its property
 */
function Controller(model, view) {
    this.view = view;
    this.model = model;
}

/**
 * Controller: init
 * @description
 *      - Initialize the controller
 *      - Binds .config to update the filter every time it is changed
 * @return {None}
 */
Controller.prototype.init = function () {
    var that = this;
    this.model.init(this.view);

    $(".config").change(function () {
        that.model.updateFilter(that.view);
    });
};

String.prototype.hashCode = function () {
    /*ignore jslint start*/
    var h = 0, i = 0, l = this.length;
    if (l === 0) return h;
    for (; i < l; i++) {
        h = ((h << 5) - h) + this.charCodeAt(i);
        h |= 0; // Convert to 32bit integer
    }
    return h;
    /*ignore jslint end*/ 
};


var raunController = new Controller(new Model(), new View());
raunController.init();
