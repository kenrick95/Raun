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
	this.data['user'] = new Array();
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
}
Model.prototype.canRun = function () {
	/*
	return:
		int
		0: don't run
		1: support SSE, use SSE
		2: use polling
	*/
	if (!this.config.run) return 0;
	if (!!window.EventSource) {
		return 1;
	} else {
		return 2;
	}
};
// Polling
Model.prototype.getDataPolling = function (view, type, params, callback) {
	var sendData = params;
	sendData['project'] = this.config['project'];
	sendData['language'] = this.config['language'];
	sendData['type'] = type;
	console.log(sendData);
	
	var that =  this;
	$.ajax({
		type: "POST",
		url: "api-rewrite.php",
		data: sendData,
		dataType: "json",
		success: function(data) {
			data['config'] = that.config;
			data['params'] = params;
			data['site'] = that.data;
			var ret = view.displayData(type, data);
			callback(ret, data, callback);
		},
		error:function (xhr, ajaxOptions, thrownError){
			console.log(xhr.statusText);
		}
	});
};
Model.prototype.getRCPolling = function (view) {
	var that = this;
	this.getDataPolling(view, 'rc', {from: 0, gtz:0, last_rcid:0}, function (ret, data, callback) {
		function process (ret, data, callback) {
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
	var that = this;
	var that_callback = callback;
	this.getDataPolling(view, 'user', {group: group}, function (ret, data, callback) {
		that.data['user'][data.params.group] = new Array();
		for (var i=0; i<data.length; i++) {
			that.data['user'][data.params.group][data[i]['name'].toLowerCase()] = true;
		}
		that.data['user'][data.params.group][-1] = data;
		that_callback(view);
	});
};
Model.prototype.getStatPolling = function (view) {
	this.getDataPolling(view, 'stat');
};

// Server-Sent Event (SSE)
Model.prototype.getDataSSE = function (view, type, params, callback) {
	var that = this;
	var source = new EventSource('api-sse-rewrite.php');
	source.addEventListener(type, function(e) {
		var data = JSON.parse(e.data);
		data['config'] = that.config;
		data['params'] = params;
		data['site'] = that.data;
		console.log(data);
		var ret = view.displayData(type, data);
		if (!!callback)
			callback(ret, data, callback);
	}, false);
};
Model.prototype.getRCSSE = function (view) {
	var that = this;
	that.createCookie("rcfrom", 0, 1);
	this.getDataSSE(view, 'rc', {gtz:0, last_rcid:0}, function (ret, data, callback) {
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
	var expires;
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	} else {
		expires = "";
	}
	document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}
	
Model.prototype.readCookie = function (name) {
	var nameEQ = escape(name) + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
	}
	return null;
}
	
Model.prototype.eraseCookie = function (name) {
	this.createCookie(name, "", -1);
}

function View() {
	//Twitter Bootstrap keep-open class
	$('.dropdown-menu').click(function(event){
		if($(this).hasClass('keep-open')){
			event.stopPropagation();
		}
	});
}
View.prototype.displayData = function (type, data) {
	switch(type) {
		case "rc": 		return this.displayRC(data); 	break;
		case "log": 	return this.displayLog(data); 	break;
		case "user": 	return this.displayUser(data); break;
		case "stat": 	return this.displayStat(data); break;
		default: console.log(data); break;
	}
};
View.prototype.displayRC = function (data) {
	
	base_site = "http://" + data.config['language'] + "." + data.config['project'] + ".org/";
	gtz = data.params.gtz;
	last_rcid = data.params.last_rcid;
	
	len = data.length;
	tz = gtz;
	for (i = len-1; i>=0; i--) {
		if (last_rcid >= data[i]['rcid']) {
			continue;
		} else {
			last_rcid = data[i]['rcid'];
		}
		diff = (data[i]['newlen'] - data[i]['oldlen']);
		s_diff = diff > 0 ? "+" + diff : diff;
		tz = data[i]['timestamp'];
		gtz = tz;
		time = new Date(tz);
		comment = data[i]['parsedcomment'].replace(/\"\/wiki\//g, "\"" + base_site + "wiki/" );
		attr = "";
		
		// Attribute of the row
		if ("anon" in data[i])
			attr += "anon ";
		if ("bot" in data[i])
			attr += "bot ";
		if ("minor" in data[i])
			attr += "minor ";
		if ("redirect" in data[i])
			attr += "redirect ";
		if (data[i]['type'] == 'new')
			attr += "new-art ";
		if (data[i]['user'].toLowerCase() in data['site']['user']['editor'])
			attr += "editor ";
		if (data[i]['user'].toLowerCase() in data['site']['user']['sysop'])
			attr += "admin ";
		if (attr === "")
			attr = "others ";
		attr += "revid-" + data[i]['revid'] + " ";
		
		// "Deprecate" the old rows
		$(".revid-" + data[i]['old_revid']).addClass("inactive");
		
		msg = "<tr id=\"row-" + data[i]['rcid'] + "\" class=\"" + attr + "\">"
			
			// Color, namespace
			+ "<td "
			+ "title=\""
			+ locale_obj['ns']
			+ ": "
			+ this.ns(data[i]['ns'])
			+ "\" "
			+ "class=\"ns ns-"
			+ data[i]['ns']
			+ "\">"
			+ "</td>"
			
			// Edit time
			+ "<td>"
			+ this.pad( time.getUTCHours() )
			+ ':' + this.pad( time.getUTCMinutes() )
			+ ':' + this.pad( time.getUTCSeconds() )
			+ "</td>"
			
			// Link to diff
			+ "<td>"
			+ "<a "
			+ "href=\""
			+ base_site
			+ "w/index.php?title="
			+ data[i]['title']
			+ "&diff="
			+ data[i]['revid']
			+ "&oldid="
			+ data[i]['old_revid']
			+ "\">"
			+ data[i]['title']
			+ "</a>"
			
			+ " <span style=\"white-space: nowrap;\">. .</span> ";
		
		// Diff size
		msg += "<span class=\"";
		if (s_diff > 0)
			msg += "size-pos";
		else if (s_diff < 0)
			msg += "size-neg";
		else
			msg += "size-null";
		if (Math.abs(s_diff) > 500)
			msg += " size-large";
		msg += "\">";
		msg += "("
			+ s_diff
			+ ")";
		msg += "</span>";
		msg += "</td>"
		
		// Editing user
			+ "<td>"
			+ "<a"
			+ " class=\""
			+ "username"
			+ "\""
			
			+ " href=\""
			+ base_site
			+ "wiki/Special:Contributions/"
			+ data[i]['user']
			+ "\">"
			
			+ data[i]['user']
			
			+ "</a>"
			+ "</td>"
		
		// Show labels
			+ "<td>";
		if (data[i]['type'] == 'new')
			msg += "<span class=\"label label-success\" title=\"" + locale_obj['settings_new_pages'] + "\">" + locale_obj['new'] + "</span> ";
		if ("minor" in data[i])
			msg += "<span class=\"label label-primary\" title=\"" + locale_obj['settings_minor_edits'] + "\">" + locale_obj['minor'] + "</span> ";
		if ("anon" in data[i])
			msg += "<span class=\"label label-danger\" title=\"" + locale_obj['settings_anon_edits'] + "\">" + locale_obj['anon'] + "</span> ";
		if ("redirect" in data[i])
			msg += "<span class=\"label label-warning\" title=\"" + locale_obj['settings_redirects'] + "\">" + locale_obj['redirect'] + "</span> ";
		if ("bot" in data[i])
			msg += "<span class=\"label label-info\" title=\"" + locale_obj['settings_bot_edits'] + "\">" + locale_obj['bot'] + "</span> ";
		if (data[i]['user'].toLowerCase() in data['site']['user']['editor'])
			msg += "<span class=\"label label-default\" title=\"" + locale_obj['settings_editor_edits'] + "\">" + locale_obj['editor'] + "</span> ";
		if (data[i]['user'].toLowerCase() in data['site']['user']['sysop'])
			msg += "<span class=\"label label-info\" title=\"" + locale_obj['settings_admin_edits'] + "\">" + locale_obj['admin'] + "</span> ";
		
		// Show comments
		msg += comment;
		
		// Show tags
		if (data[i]['tags'] != "") {
		msg += 
			 " (Tag: <i>"
			+ data[i]['tags']
			+ "</i>)"
		}
		msg += 
			 "</td>"
			+ "</tr>\n";
		
		// add row to the table; don't show yet		
		$("#main-table-body").prepend(msg);
		$('#main-table > tbody > tr#row-' + data[i]['rcid']).hide();
		$('#main-table > tbody > tr#row-' + data[i]['rcid']).addClass("new-entry");
		
		show_art = true;
		if (attr.indexOf("bot") >= 0)
			if (!data.config['show']['bot'])
				show_art = false;
		if (attr.indexOf("minor") >= 0)
			if (!data.config['show']['minor'])
				show_art = false;
		if (attr.indexOf("redirect") >= 0)
			if (!data.config['show']['redirect'])
				show_art = false;
		if (attr.indexOf("new-art") >= 0)
			if (!data.config['show']['new'])
				show_art = false;
		if (attr.indexOf("anon") >= 0)
			if (!data.config['show']['anon'])
				show_art = false;
		if (attr.indexOf("admin") >= 0)
			if (!data.config['show']['admin'])
				show_art = false;
		if (attr.indexOf("editor") >= 0)
			if (!data.config['show']['editor'])
				show_art = false;
		if (attr.indexOf("others") >= 0)
			if (!data.config['show']['others'])
				show_art = false;
		
		if (show_art === true) {
			this.showRC('#main-table > tbody > tr#row-' + data[i]['rcid']);
		}
		
		
	}
	setTimeout(function () {
		$(".new-entry").removeClass("new-entry");
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
	if ( number < 10 )
		return '0' + number;
	return number;
}

View.prototype.displayLog = function (data) {
	console.log(data);
};
View.prototype.displayUser = function (data) {
	//console.log(data);
};
View.prototype.formatnum = function (nStr) {
// http://www.mredkj.com/javascript/numberFormat.html
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? locale_obj['separator_decimals'] + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
	x1 = x1.replace(rgx, '$1' + locale_obj['separator_thousands'] + '$2');
	}
	return x1 + x2;
}

View.prototype.displayStat = function (data) {
	//console.log(data);
	msg = "";
	
	depth = data['edits'] * (data['pages'] - data['articles']) * (data['pages'] - data['articles']) / (data['articles'] * data['articles'] * data['pages']);
	
	msg += ""
	+ "<dl class=\"dl-horizontal\">"
	+ "<dt>"
	+ locale_obj['stat_articles']
	+ "</dt>"
	+ "<dd>"
	+ this.formatnum(data['articles'])
	+ "</dd>"
	
	+ "<dt>"
	+ locale_obj['stat_pages']
	+ "</dt>"
	+ "<dd>"
	+ this.formatnum(data['pages'])
	+ "</dd>"
	
	+ "<dt>"
	+ locale_obj['stat_files']
	+ "</dt>"
	+ "<dd>"
	+ this.formatnum(data['images'])
	+ "</dd>"
	
	+ "<dt>"
	+ locale_obj['stat_edits']
	+ "</dt>"
	+ "<dd>"
	+ this.formatnum(data['edits'])
	+ "</dd>"
	
	+ "<dt>"
	+ locale_obj['stat_depth']
	+ "</dt>"
	+ "<dd>"
	+ this.formatnum(parseFloat(depth).toFixed(4))
	+ "</dd>"
	
	+ "<dt>"
	+ locale_obj['stat_users']
	+ "</dt>"
	+ "<dd>"
	+ this.formatnum(data['users'])
	+ "</dd>"
	
	+ "<dt>"
	+ locale_obj['stat_active_users']
	+ "</dt>"
	+ "<dd>"
	+ this.formatnum(data['activeusers'])
	+ "</dd>"
	
	+ "<dt>"
	+ locale_obj['stat_admins']
	+ "</dt>"
	+ "<dd>"
	+ this.formatnum(data['admins'])
	+ "</dd>"
	
	+ "</dl>";
	
	$("#w_stat").html(msg);
};

View.prototype.displayTime = function () {
	function pad(number) {
		if ( number < 10 )
			return '0' + number;
		return number;
	}
	var date = new Date();
	var timeStr = date.getUTCFullYear() +
		'-' + pad( date.getUTCMonth() + 1 ) +
		'-' + pad( date.getUTCDate() ) +
		' ' + pad( date.getUTCHours() ) +
		':' + pad( date.getUTCMinutes() ) +
		':' + pad( date.getUTCSeconds() ) +
		' UTC';
	$("#tz").html(timeStr);
	var that = this;
	setTimeout(function () { that.displayTime() }, 1000);
}

function Controller(model, view) {
	this.view = view;
    this.model = model;
}
Controller.prototype.init = function () {
	this.model.init(this.view);
	
};
var raunController = new Controller(new Model(), new View());
raunController.init();