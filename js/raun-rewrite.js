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
	this.getRCPolling(view);
}
Model.prototype.getData = function () {
	if (!this.config.run) return false;
	if (!!window.EventSource) {
		return this.getDataSSE();
	} else {
		return this.getDataPolling();
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
		url: "api.php",
		data: sendData,
		dataType: "json",
		success: function(data) {
			data['config'] = that.config;
			data['params'] = params;
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
		setTimeout((function (ret, data, callback) {
			data.params.gtz = ret.gtz;
			data.params.last_rcid = ret.last_rcid;
			that.getDataPolling(view, 'rc', data.params, callback);
		}(ret, data, callback)), 1000);
	});
};
Model.prototype.getLogPolling = function (view) {
	this.getDataPolling(view, 'log');
};
Model.prototype.getUserPolling = function (view) {
	this.getDataPolling(view, 'user');
};
Model.prototype.getStatPolling = function (view) {
	this.getDataPolling(view, 'statistics');
};

// Server-Sent Event (SSE)
Model.prototype.getDataSSE = function (view, type) {
	var source = new EventSource('api-sse.php');
	source.addEventListener(type, function(e) {
		view.displayData(type, e.data);
	}, false);
};
Model.prototype.getRCSSE = function (view) {
	this.getDataSSE(view, 'rc');
};
Model.prototype.getLogSSE = function (view) {
	this.getDataSSE(view, 'log');
};
Model.prototype.getUserSSE = function (view) {
	this.getDataSSE(view, 'user');
};
Model.prototype.getStatSSE = function (view) {
	this.getDataSSE(view, 'statistics');
};


function View() {
	
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
//		if (data[i]['user'].toLowerCase() in user_group['editor'])
//			attr += "editor ";
//		if (data[i]['user'].toLowerCase() in user_group['sysop'])
//			attr += "admin ";
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
//		if (data[i]['user'].toLowerCase() in user_group['editor'])
//			msg += "<span class=\"label label-default\" title=\"" + locale_obj['settings_editor_edits'] + "\">" + locale_obj['editor'] + "</span> ";
//		if (data[i]['user'].toLowerCase() in user_group['sysop'])
//			msg += "<span class=\"label label-info\" title=\"" + locale_obj['settings_admin_edits'] + "\">" + locale_obj['admin'] + "</span> ";
		
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
//		if (attr.indexOf("admin") >= 0)
//			if (!data.config['show']['admin'])
//				show_art = false;
//		if (attr.indexOf("editor") >= 0)
//			if (!data.config['show']['editor'])
//				show_art = false;
//		if (attr.indexOf("others") >= 0)
//			if (!data.config['show']['others'])
//				show_art = false;
		
		if (show_art === true) {
			this.showRC('#main-table > tbody > tr#row-' + data[i]['rcid']);
		}
		
		
	}
	setTimeout(function () {
		$(".new-entry").removeClass("new-entry");
	}, 5000);
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
	console.log(data);
};
View.prototype.displayStat = function (data) {
	console.log(data);
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