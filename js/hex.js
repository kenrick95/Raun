$(document).ready(function () {
	function pad(number) {
		if ( number < 10 ) {
			return '0' + number;
		}
		return number;
	}
	
	$.ajax({
		type: "POST",
		url: "api.php",
		data: { num_pages:true },
		dataType: "json",
		success: function(data) {
			$("#art").html(data['articles']);
			$("#artx").val(data['articles']);
		},
		error:function (xhr, ajaxOptions, thrownError){
			console.log(xhr.statusText);
			$("#art").html(xhr.statusText);
		}
	});
		
	$("#art-form").submit(function () {
		$('#art-form').find('input, textarea, button, select').attr('disabled','disabled');
		$("#art-form button").append(" <img src='img/loading.gif' style='width:16px; height:16px;'>");
		
		$.ajax({
			type: "POST",
			url: "api.php",
			data: {hex: $("#artx").val()},
			dataType: "json",
			success: function(data) {
				if (data['status'] == 'OK') {
					tz = data['message']['timestamp'];
					time = new Date(tz);
					
					msg = "<p>"
					+ "Artikel ke-"
					+ $("#artx").val()
					+ " adalah "
					+ "<a href=\""
					+ "http://id.wikipedia.org/"
					+ "w/index.php?title="
					+ data['message']['title']
					+ "&oldid="
					+ data['message']['revid']
					+ "\">"
					+ data['message']['title']
					+ "</a>"
					+ " yang dibuat pada "
					+ time.getUTCFullYear()
					+ '-' + pad( time.getUTCMonth() + 1 )
					+ '-' + pad( time.getUTCDate() )
					+ ' ' + pad( time.getUTCHours() )
					+ ':' + pad( time.getUTCMinutes() )
					+ ':' + pad( time.getUTCSeconds() )
					+ ' UTC'
					+ "</p>";
					
					$("#main-res").html(msg);
				} else {
					$("#main-res").html(data['message']);
				}
				msg = "";

				
				$("#art-form button").html("Proses");
				setTimeout('$("#art-form").find("input, textarea, button, select").removeAttr("disabled")', 1000);
			},
			error:function (xhr, ajaxOptions, thrownError){
				console.log(xhr.statusText);
				$("#art-form button").html("Proses");
				setTimeout('$("#art-form").find("input, textarea, button, select").removeAttr("disabled")', 1000);
			}
		});
	});
});