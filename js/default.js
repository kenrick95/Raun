pause = false;
itu = 0;
last_rcid = 0;
gtz = 0;
config = {show_bot: false, show_anon: true, show_new: true, show_minor:true};


$(document).ready(function () {
	//Twitter Bootstrap keep-open class
	//source: http://stackoverflow.com/questions/11617048/twitter-bootstrap-stop-just-one-dropdown-toggle-from-closing-on-click
	$('.dropdown-menu').click(function(event){
		if($(this).hasClass('keep-open')){
			event.stopPropagation();
		}
	});
	//End Twitter Bootstrap keep-open class
	
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
		if (pause) {
			pause = false;
			update(gtz);
			$("#pause").html("<span class=\"glyphicon glyphicon-pause\"></span> Pause");
		} else {
			pause = true;	
			$("#pause").html("<span class=\"glyphicon glyphicon-play\"></span> Jalan!");
		}
	});
	
	
	$(document).on( "click", ".ns", function(){
		$('#help').modal('show');
		//console.log("a");
	});
	
	function update_config() {
		createCookie("show_bot", $("#show_bot").prop( "checked" ), 30);
		createCookie("show_anon", $("#show_anon").prop( "checked" ), 30);
		createCookie("show_new", $("#show_new").prop( "checked" ), 30);
		createCookie("show_minor", $("#show_minor").prop( "checked" ), 30);	
		config = {
			show_bot: $("#show_bot").prop( "checked" ),
			show_anon: $("#show_anon").prop( "checked" ),
			show_new: $("#show_new").prop( "checked" ),
			show_minor:$("#show_minor").prop( "checked" )
		}
	}
	
	$(".config").change(function () {
		
		new_config = {
			show_bot: $("#show_bot").prop( "checked" ),
			show_anon: $("#show_anon").prop( "checked" ),
			show_new: $("#show_new").prop( "checked" ),
			show_minor:$("#show_minor").prop( "checked" )
		}
		
		if (new_config['show_bot'] && !config['show_bot']) {
			sD(".bot");	
		} else if (!new_config['show_bot'] && config['show_bot']) {
			sU(".bot");
		}
		if (new_config['show_anon'] && !config['show_anon']) {
			sD(".anon");	
		} else if (!new_config['show_anon'] && config['show_anon']) {
			sU(".anon");
		}
		if (new_config['show_new'] && !config['show_new']) {
			sD(".new-art");	
		} else if (!new_config['show_new'] && config['show_new']) {
			sU(".new-art");
		}
		if (new_config['show_minor'] && !config['show_minor']) {
			sD(".minor");	
		} else if (!new_config['show_minor'] && config['show_minor']) {
			sU(".minor");
		}
		
		update_config();
	});
	
	function sD(elem) {
	//  http://stackoverflow.com/questions/467336/jquery-how-to-use-slidedown-or-show-function-on-a-table-row
		$(elem).show();
		$(elem).find('div').show();
		$(elem)
		.find('td')
		.wrapInner('<div style="display: none;" />')
		.parent()
		.find('td > div')
		.slideDown(700, function(){
			//console.log('b');
			var $set = $(this);
			$set.replaceWith($set.contents());
		});
	}
	function sU(elem) {
	//  http://stackoverflow.com/questions/467336/jquery-how-to-use-slidedown-or-show-function-on-a-table-row
		$(elem)
		.find('td')
		.wrapInner('<div style="display: block;" />')
		.parent()
		.find('td > div')
		.slideUp(700, function(){
		
			$(this).parent().parent().hide();
		
		});
	}
	
	function ns(i) {
		switch (i) {
			case 0: return "Artikel";
			case 1: return "Pembicaraan Artikel";
			case 2: return "Pengguna";
			case 3: return "Pembicaraan Pengguna";
			case 4: return "Wikipedia";
			case 5: return "Pembicaraan Wikipedia";
			case 6: return "Berkas";
			case 7: return "Pembicaraan Berkas";
			case 8: return "MediaWiki";
			case 9: return "Pembicaraan MediaWiki";
			case 10: return "Templat";
			case 11: return "Pembicaraan Templat";
			case 12: return "Bantuan";
			case 13: return "Pembicaraan Bantuan";
			case 14: return "Kategori";
			case 15: return "Pembicaraan Kategori";
			case 100: return "Portal";
			case 101: return "Pembicaraan Portal";
		}
	}
	
	function update(tz) {
		//update_config();
		
		if (pause) return false;
		gtz = tz;
		//$(".new-entry").removeClass("new-entry");
		$("#stat").html(" <img src='img/loading.gif' style='width:16px; height:16px;'>");
		
		
		$.ajax({
			type: "POST",
			url: "api.php",
			data: {from: tz},
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
						
						comment = data[i]['parsedcomment'].replace(/\/wiki\//g, "http://id.wikipedia.org/wiki");
						
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
						if (data[i]['type'] == 'new') {
							attr += "new-art ";
						}
						
						
						msg = "<tr id=\"row-" + data[i]['rcid'] + "\" class=\"" + attr + "\">"
							
							+ "<td "
							+ "title=\"Ruang nama: "
							+ ns(data[i]['ns'])
							+ "\" "
							+ "class=\"ns ns-"
							+ data[i]['ns']
							+ "\">"
							+ "&nbsp;"
							+ "</td>"
							
							+ "<td>"
							+ pad( time.getUTCHours() )
							+ ':' + pad( time.getUTCMinutes() )
							+ ':' + pad( time.getUTCSeconds() )
							+ "</td>"
							
							+ "<td>"
							
							+ "<a href=\""
							+ "http://id.wikipedia.org/"
							+ "w/index.php?title="
							+ data[i]['title']
							+ "&diff="
							+ data[i]['revid']
							+ "&oldid="
							+ data[i]['old_revid']
							+ "\">"
							
							+ data[i]['title']
							
							+ "</a>"
							
							+ " . . ";
							
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
							+ "<a href=\""
							+ "http://id.wikipedia.org/"
							+ "wiki/Special:Contributions/"
							+ data[i]['user']
							+ "\">"
							
							+ data[i]['user']
							
							+ "</a>"
							
							+ "</td>"
							
							+ "<td>";
						
						
						if (data[i]['type'] == 'new') {
							msg += "<span class=\"label label-success\" title=\"Halaman baru\">baru</span> ";
						}
						if ("minor" in data[i]) {
							msg += "<span class=\"label label-primary\" title=\"Suntingan kecil\">kecil</span> ";
						}
						if ("anon" in data[i]) {
							msg += "<span class=\"label label-danger\" title=\"Suntingan pengguna anonim\">anon</span> ";
						}
						if ("bot" in data[i]) {
							msg += "<span class=\"label label-info\" title=\"Suntingan bot\">bot</span> ";
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
						
						
						//$(msg).hide().appendTo("#main-table-body").slideDown('slow');
						$("#main-table-body").prepend(msg);
						$('#main-table > tbody > tr#row-' + data[i]['rcid']).addClass("new-entry");
						if	(
							((attr.indexOf("anon") >= 0) && (config['show_anon']))
							|| ((attr.indexOf("bot") >= 0) && (config['show_bot']))
							|| ((attr.indexOf("minor") >= 0) && (config['show_minor']))
							|| ((attr.indexOf("new") >= 0) && (config['show_new']))
							
							)
						{
							sD('#main-table > tbody > tr#row-' + data[i]['rcid']);
						}
						
						
					}
					setTimeout(function () { $(".new-entry").removeClass("new-entry"); }, 1000);
					setTimeout(function () { update(tz); }, 10000);
				}
			},
			error:function (xhr, ajaxOptions, thrownError){
				console.log(xhr.statusText);
				$("#stat").html(" " + xhr.statusText);
			}
		});
	}
	
	function init() {
		if (readCookie("show_bot") == null) {
			$("#show_bot").prop( "checked", true );
			$("#show_anon").prop( "checked", true );
			$("#show_new").prop( "checked", true );
			$("#show_minor").prop( "checked", true );
			createCookie("show_bot", $("#show_bot").prop( "checked" ), 30);
			createCookie("show_anon", $("#show_anon").prop( "checked" ), 30);
			createCookie("show_new", $("#show_new").prop( "checked" ), 30);
			createCookie("show_minor", $("#show_minor").prop( "checked" ), 30);
			config = {
				show_bot: $("#show_bot").prop( "checked" ),
				show_anon: $("#show_anon").prop( "checked" ),
				show_new: $("#show_new").prop( "checked" ),
				show_minor:$("#show_minor").prop( "checked" )
			}
		} else {
			$("#show_bot").prop( "checked", readCookie("show_bot") );
			$("#show_anon").prop( "checked", readCookie("show_anon") );
			$("#show_new").prop( "checked", readCookie("show_new") );
			$("#show_minor").prop( "checked", readCookie("show_minor") );
			config = {
				show_bot: $("#show_bot").prop( "checked" ),
				show_anon: $("#show_anon").prop( "checked" ),
				show_new: $("#show_new").prop( "checked" ),
				show_minor:$("#show_minor").prop( "checked" )
			}
		}
		
		update(get_time() );
		//update(iso_str());
		timer();
	}
	
	init();
	
});