last_rcid = 0;
gtz = 0;
config = {
	show_bot: false,
	show_anon: true,
	show_new: true,
	show_minor:true,
	show_redirect:true,
	show_editor:true,
	show_admin:true,
	pause: false,
	timeout: 10000,
	project: "wikipedia",
	language: "id",
	locale: "en"
};
user_group = new Array();


$(document).ready(function () {
	//Twitter Bootstrap keep-open class
	//source: http://stackoverflow.com/questions/11617048/twitter-bootstrap-stop-just-one-dropdown-toggle-from-closing-on-click
	$('.dropdown-menu').click(function(event){
		if($(this).hasClass('keep-open')){
			event.stopPropagation();
		}
	});
	//End Twitter Bootstrap keep-open class
	
	function formatnum(nStr)
	// http://www.mredkj.com/javascript/numberFormat.html
	{
		nStr += '';
		x = nStr.split('.');
		x1 = x[0];
		x2 = x.length > 1 ? ',' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + '.' + '$2');
		}
		return x1 + x2;
	}

	//Create, Read, Erase Cookie
	//source: http://www.quirksmode.org/js/cookies.html
	function createCookie(name, value, days) {
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
	
	function readCookie(name) {
		var nameEQ = escape(name) + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) === ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
		}
		return null;
	}
	
	function eraseCookie(name) {
		createCookie(name, "", -1);
	}
	//End Create, Read, Erase Cookie
	
	// Date-time function
	//source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
	function pad(number) {
		if ( number < 10 ) {
			return '0' + number;
		}
		return number;
	}
	
	function get_time() {
		var date = new Date();
		return date.getUTCFullYear() +
		'-' + pad( date.getUTCMonth() + 1 ) +
		'-' + pad( date.getUTCHours()-1 < 0 ? date.getUTCDate()-1 : date.getUTCDate() ) +
		'T' + pad( date.getUTCHours()-1 < 0 ? date.getUTCHours()+23 : date.getUTCHours()-1 ) +
		':' + pad( date.getUTCMinutes() ) +
		':' + pad( date.getUTCSeconds() ) +
		'Z';
	}
	
	function iso_str() {
		var date = new Date();
		return date.getUTCFullYear() +
		'-' + pad( date.getUTCMonth() + 1 ) +
		'-' + pad( date.getUTCDate() ) +
		' ' + pad( date.getUTCHours() ) +
		':' + pad( date.getUTCMinutes() ) +
		':' + pad( date.getUTCSeconds() ) +
		' UTC';
	}
	//End Date-time function
	
	
	// Clock
	function timer() {
		$("#tz").html(iso_str());
		setTimeout(function () { timer() }, 1000);
	}
	// End Clock
	
	$("#pause").click(function () {
		if (config['pause']) {
			config['pause'] = false;
			update(gtz);
			$("#pause").html("<span class=\"glyphicon glyphicon-pause\"></span> Pause");
		} else {
			config['pause'] = true;	
			$("#pause").html("<span class=\"glyphicon glyphicon-play\"></span> Jalan!");
		}
	});
	
	
	$(document).on( "click", ".ns", function(){
		$('#help').modal('show');
	});

	function update_config() {
		
		createCookie("show_bot", $("#show_bot").prop( "checked" ), 30);
		createCookie("show_anon", $("#show_anon").prop( "checked" ), 30);
		createCookie("show_new", $("#show_new").prop( "checked" ), 30);
		createCookie("show_minor", $("#show_minor").prop( "checked" ), 30);	
		createCookie("show_redirect", $("#show_redirect").prop( "checked" ), 30);	
		createCookie("show_editor", $("#show_editor").prop( "checked" ), 30);	
		createCookie("show_admin", $("#show_admin").prop( "checked" ), 30);	
		
		
		
		config["show_bot"] = $("#show_bot").prop( "checked" );
		config["show_anon"] = $("#show_anon").prop( "checked" );
		config["show_new"] = $("#show_new").prop( "checked" );
		config["show_minor"] = $("#show_minor").prop( "checked" );
		config["show_redirect"] = $("#show_redirect").prop( "checked" );
		config["show_editor"] = $("#show_editor").prop( "checked" );
		config["show_admin"] = $("#show_admin").prop( "checked" );
		config["language"] = $("#language").val();
		config["project"] = $("#project").val();
		config["locale"] = $("#locale").val();
		
	}
	
	$(".config").change(function () {
		
		new_config = {
			show_bot: $("#show_bot").prop( "checked" ),
			show_anon: $("#show_anon").prop( "checked" ),
			show_new: $("#show_new").prop( "checked" ),
			show_minor:$("#show_minor").prop( "checked" ),
			show_redirect:$("#show_redirect").prop( "checked" ),
			show_editor: $("#show_editor").prop( "checked" ),
			show_admin:$("#show_admin").prop( "checked" )
		}
		
		if (new_config['show_bot'] && !config['show_bot']) sD(".bot");
		if (new_config['show_anon'] && !config['show_anon']) sD(".anon");
		if (new_config['show_new'] && !config['show_new']) sD(".new-art");
		if (new_config['show_minor'] && !config['show_minor']) sD(".minor");
		if (new_config['show_redirect'] && !config['show_redirect']) sD(".redirect");
		if (new_config['show_editor'] && !config['show_editor']) sD(".editor");
		if (new_config['show_admin'] && !config['show_admin']) sD(".admin");
		
		if (!new_config['show_bot']) {
			sU(".bot");
		}
		if (!new_config['show_anon']) {
			sU(".anon");
		}
		if (!new_config['show_new']) {
			sU(".new-art");
		}
		if (!new_config['show_minor']) {
			sU(".minor");
		}
		if (!new_config['show_redirect']) {
			sU(".redirect");
		}
		if (!new_config['show_editor']) {
			sU(".editor");
		}
		if (!new_config['show_admin']) {
			sU(".admin");
		}
		
		update_config();
	});
	$("#tool_config").submit(function () {
		createCookie("locale", $("#locale").val(), 30);
		createCookie("language", $("#language").val(), 30);
		createCookie("project", $("#project").val(), 30);
		
		config["language"] = $("#language").val();
		config["project"] = $("#project").val();
		config["locale"] = $("#locale").val();
		
	});
	
	function sD(elem) {
		$(elem).show();
	}
	function sU(elem) {
		$(elem).hide();
	}
	function ns(i) {
		return locale_obj['ns' + i];
	}
	
	function user_list(group, after_func) {
		$("#w_stat").html(" <img src='img/loading.gif' style='width:16px; height:16px;'>");
		$.ajax({
			type: "POST",
			url: "api.php",
			data: {group: group},
			dataType: "json",
			success: function(data) {
				$("#w_stat").html();
				user_group[group] = new Array();
				for (var i=0; i<data.length; i++) {
					user_group[group][data[i]['name'].toLowerCase()] = true;
				}
				user_group[group][-1] = data;
				after_func();
			},
			error:function (xhr, ajaxOptions, thrownError){
				console.log(xhr.statusText);
			}
		});	
	}
	
	function update_stat() {
		$.ajax({
			type: "POST",
			url: "api.php",
			data: {statistics: true,
				project: config['project'],
				language: config['language']
			},
			dataType: "json",
			success: function(data) {
				msg = "";
				
				depth = data['edits'] * (data['pages'] - data['articles']) * (data['pages'] - data['articles']) / (data['articles'] * data['articles'] * data['pages']);
				
				msg += ""
				+ "<dl class=\"dl-horizontal\">"
				+ "<dt>"
				+ locale_obj['stat_articles']
				+ "</dt>"
				+ "<dd>"
				+ formatnum(data['articles'])
				+ "</dd>"
				
				+ "<dt>"
				+ locale_obj['stat_pages']
				+ "</dt>"
				+ "<dd>"
				+ formatnum(data['pages'])
				+ "</dd>"
				
				+ "<dt>"
				+ locale_obj['stat_files']
				+ "</dt>"
				+ "<dd>"
				+ formatnum(data['images'])
				+ "</dd>"
				
				+ "<dt>"
				+ locale_obj['stat_edits']
				+ "</dt>"
				+ "<dd>"
				+ formatnum(data['edits'])
				+ "</dd>"
				
				+ "<dt>"
				+ locale_obj['stat_depth']
				+ "</dt>"
				+ "<dd>"
				+ formatnum(parseFloat(depth).toFixed(4))
				+ "</dd>"
				
				+ "<dt>"
				+ locale_obj['stat_users']
				+ "</dt>"
				+ "<dd>"
				+ formatnum(data['users'])
				+ "</dd>"
				
				+ "<dt>"
				+ locale_obj['stat_active_users']
				+ "</dt>"
				+ "<dd>"
				+ formatnum(data['activeusers'])
				+ "</dd>"
				
				+ "<dt>"
				+ locale_obj['stat_admins']
				+ "</dt>"
				+ "<dd>"
				+ formatnum(data['admins'])
				+ "</dd>"
				
				+ "</dl>";
				
				$("#w_stat").html(msg);
			},
			error:function (xhr, ajaxOptions, thrownError){
				console.log(xhr.statusText);
				$("#stat").html(" " + xhr.statusText);
			}
		});
	}
	
	function update(tz) {
		//update_config();
		
		if (config['pause']) return false;
		gtz = tz;
		//$(".new-entry").removeClass("new-entry");
		$("#stat").html(" <img src='img/loading.gif' style='width:16px; height:16px;'>");
		update_stat();
		
		$.ajax({
			type: "POST",
			url: "api.php",
			data: {
				from: tz,
				project: config['project'],
				language: config['language']
			},
			dataType: "json",
			success: function(data) {
				//console.log(data);
				$("#stat").html("");
				if (data.length == 0) {
					setTimeout(function () { update(tz); }, 10000);
				} else {
					len = data.length;
					tz = tz;
					for (i = len-1; i>=0; i--) {
						if (last_rcid >= data[i]['rcid']) {
							continue;
						} else {
							last_rcid = data[i]['rcid'];
						}
						diff = (data[i]['newlen']-data[i]['oldlen']);
						s_diff = diff > 0 ? "+" + diff : diff;
						tz = data[i]['timestamp'];
						time = new Date(tz);
						
						comment = data[i]['parsedcomment'].replace(/\"\/wiki\//g, "\"" + base_site + "wiki/" );
						
						attr = "";
						
						if ("anon" in data[i]) {
							attr += "anon ";
						}
						if ("bot" in data[i]) {
							attr += "bot ";
						}
						if ("minor" in data[i]) {
							attr += "minor ";
						}
						if ("redirect" in data[i]) {
							attr += "redirect ";
						}
						if (data[i]['type'] == 'new') {
							attr += "new-art ";
						}
						if (data[i]['user'].toLowerCase() in user_group['editor']) {
							attr += "editor ";
						}
						if (data[i]['user'].toLowerCase() in user_group['sysop']) {
							attr += "admin ";
						}
						
						msg = "<tr id=\"row-" + data[i]['rcid'] + "\" class=\"" + attr + "\">"
							
							+ "<td "
							+ "title=\""
							+ locale_obj['ns']
							+ ": "
							+ ns(data[i]['ns'])
							+ "\" "
							+ "class=\"ns ns-"
							+ data[i]['ns']
							+ "\">"
							+ "</td>"
							
							+ "<td>"
							+ pad( time.getUTCHours() )
							+ ':' + pad( time.getUTCMinutes() )
							+ ':' + pad( time.getUTCSeconds() )
							+ "</td>"
							
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
							
						msg += "<span class=\"";
						if (s_diff > 0) {
							msg += "size-pos";
						} else if (s_diff < 0) {
							msg += "size-neg";
						} else {
							msg += "size-null";
						}
						if (Math.abs(s_diff) > 500) {
							msg += " size-large";
						}
						msg += "\">";
							
						msg += "("
							+ s_diff
							+ ")";
							
						msg += "</span>";
						
						msg += "</td>"
							
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
							
							+ "<td>";
						if (data[i]['type'] == 'new') {
							msg += "<span class=\"label label-success\" title=\"" + locale_obj['settings_new_pages'] + "\">" + locale_obj['new'] + "</span> ";
						}
						if ("minor" in data[i]) {
							msg += "<span class=\"label label-primary\" title=\"" + locale_obj['settings_minor_edits'] + "\">" + locale_obj['minor'] + "</span> ";
						}
						if ("anon" in data[i]) {
							msg += "<span class=\"label label-danger\" title=\"" + locale_obj['settings_anon_edits'] + "\">" + locale_obj['anon'] + "</span> ";
						}
						if ("redirect" in data[i]) {
							msg += "<span class=\"label label-warning\" title=\"" + locale_obj['settings_redirects'] + "\">" + locale_obj['redirect'] + "</span> ";
						}
						if ("bot" in data[i]) {
							msg += "<span class=\"label label-info\" title=\"" + locale_obj['settings_bot_edits'] + "\">" + locale_obj['bot'] + "</span> ";
						}
						if (data[i]['user'].toLowerCase() in user_group['editor']) {
							msg += "<span class=\"label label-default\" title=\"" + locale_obj['settings_editor_edits'] + "\">" + locale_obj['editor'] + "</span> ";
						}
						if (data[i]['user'].toLowerCase() in user_group['sysop']) {
							msg += "<span class=\"label label-info\" title=\"" + locale_obj['settings_admin_edits'] + "\">" + locale_obj['admin'] + "</span> ";
						}
						
						msg += comment;
						
						if (data[i]['tags'] != "") {
						msg += 
							 " (Tag: <i>"
							+ data[i]['tags']
							+ "</i>)"
						}
						msg += 
							 "</td>"
							+ "</tr>\n";
						
																		
						$("#main-table-body").prepend(msg);
						$('#main-table > tbody > tr#row-' + data[i]['rcid']).hide();
						$('#main-table > tbody > tr#row-' + data[i]['rcid']).addClass("new-entry");
						
						show_art = true;
						if (attr.indexOf("bot") >= 0) {
							if (!config['show_bot']) {
								show_art = false;	
							}
						}
						if (attr.indexOf("minor") >= 0) {
							if (!config['show_minor']) {
								show_art = false;
							}
						}
						if (attr.indexOf("redirect") >= 0) {
							if (!config['show_redirect']) {
								show_art = false;
							}
						}
						if (attr.indexOf("new-art") >= 0) {
							if (!config['show_new']) {
								show_art = false;	
							}
						}
						if (attr.indexOf("anon") >= 0) {
							if (!config['show_anon']) {
								show_art = false;	
							}
						}
						if (attr.indexOf("admin") >= 0) {
							if (!config['show_admin']) {
								show_art = false;	
							}
						}
						if (attr.indexOf("editor") >= 0) {
							if (!config['show_editor']) {
								show_art = false;	
							}
						}
						
						if (show_art === true) {
							sD('#main-table > tbody > tr#row-' + data[i]['rcid']);
						}
						
						
					}
					setTimeout(function () {
						$(".new-entry").removeClass("new-entry");
					}, 1000);
					setTimeout(function () { update(tz); }, config['timeout']);
				}
			},
			error:function (xhr, ajaxOptions, thrownError){
				console.log(xhr.statusText);
				$("#stat").html(" " + xhr.statusText);
				setTimeout(function () { update(tz); }, 3000);
			}
		});
	}
	
	function init() {
		if (readCookie("show_bot") == null) {
			$("#show_bot").prop( "checked", false );
			$("#show_anon").prop( "checked", true );
			$("#show_new").prop( "checked", true );
			$("#show_minor").prop( "checked", true );
			$("#show_redirect").prop( "checked", true );
			$("#show_editor").prop( "checked", true );
			$("#show_admin").prop( "checked", true );
			$("#language").val("id");
			$("#project").val("wikipedia");
			$("#locale").val("en");
			
			
			createCookie("show_bot", $("#show_bot").prop( "checked" ), 30);
			createCookie("show_anon", $("#show_anon").prop( "checked" ), 30);
			createCookie("show_new", $("#show_new").prop( "checked" ), 30);
			createCookie("show_minor", $("#show_minor").prop( "checked" ), 30);
			createCookie("show_redirect", $("#show_redirect").prop( "checked" ), 30);
			createCookie("show_editor", $("#show_editor").prop( "checked" ), 30);
			createCookie("show_admin", $("#show_admin").prop( "checked" ), 30);
			createCookie("language", $("#language").val(), 30);
			createCookie("project", $("#project").val(), 30);
			createCookie("locale", $("#locale").val(), 30);
		} else {
			$("#show_bot").prop( "checked", readCookie("show_bot") == 'true' );
			$("#show_anon").prop( "checked", readCookie("show_anon") == 'true' );
			$("#show_new").prop( "checked", readCookie("show_new") == 'true' );
			$("#show_minor").prop( "checked", readCookie("show_minor") == 'true' );
			$("#show_redirect").prop( "checked", readCookie("show_redirect") == 'true' );
			$("#show_editor").prop( "checked", readCookie("show_editor") == 'true' );
			$("#show_admin").prop( "checked", readCookie("show_admin") == 'true' );
			$("#language").val( readCookie("language") );
			$("#project").val( readCookie("project") );
			$("#locale").val( readCookie("locale") );
			
		}
		config = {
				show_bot: $("#show_bot").prop( "checked" ),
				show_anon: $("#show_anon").prop( "checked" ),
				show_new: $("#show_new").prop( "checked" ),
				show_minor:$("#show_minor").prop( "checked" ),
				show_redirect:$("#show_redirect").prop( "checked" ),
				show_editor:$("#show_editor").prop( "checked" ),
				show_admin:$("#show_admin").prop( "checked" ),
				pause: false,
				timeout: 10000,
				project: $("#project").val(),
				language: $("#language").val(),
				locale: $("#locale").val()
			}
		base_site = "http://" + config['language'] + "." + config['project'] + ".org/";
		timer();
		user_list('editor', function () { user_list('sysop', function () { update(get_time() ); }); });
		
	}
	
	init();
	
});