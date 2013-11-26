pause = false;
itu = 0;
last_rcid = 0;
gtz = 0;

$(document).ready(function () {
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
		'-' + pad( date.getUTCDate() ) +
		'T' + pad( date.getUTCMinutes()-30 < 0 ? date.getUTCHours()-1 : date.getUTCHours() ) +
		':' + pad( date.getUTCMinutes()-30 < 0 ? date.getUTCMinutes()+30 : date.getUTCMinutes()-30 ) +
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
	
	update(get_time() );
	
	//update(iso_str());
	timer();
	function timer() {
		$("#tz").html(iso_str());
		setTimeout(function () { timer() }, 1000);
	}
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
		console.log("a");
	});
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
		if (pause) return false;
		gtz = tz;
		//$(".new-entry").removeClass("new-entry");
		$("#stat").html("<img src='img/loading.gif' style='width:16px; height:16px;'>");
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
						
						
						comment = data[i]['parsedcomment'].replace(/\/wiki/g, "http://id.wikipedia.org/wiki");
						
						
						msg = "<tr id=\"row-" + data[i]['rcid'] + "\">"
							
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
							+ "wiki/User:"
							+ data[i]['user']
							+ "\">"
							
							+ data[i]['user']
							
							+ "</a>"
							
							+ "</td>"
							
							+ "<td>"
							+ comment;
						
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
						
						//  http://stackoverflow.com/questions/467336/jquery-how-to-use-slidedown-or-show-function-on-a-table-row
						$('#main-table > tbody > tr#row-' + data[i]['rcid'])
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
					setTimeout(function () { $(".new-entry").removeClass("new-entry"); }, 1000);
					setTimeout(function () { update(tz); }, 10000);
				}
			},
			error:function (xhr, ajaxOptions, thrownError){
				console.log(xhr.statusText);
				$("#stat").html(xhr.statusText);
			}
		});
	}
	
	
});