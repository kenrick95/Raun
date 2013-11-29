<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="">
	<meta name="author" content="">
	<link rel="shortcut icon" href="img/favicon.png">
	
	<title>Raun</title>
	
	<!-- Bootstrap core CSS -->
	<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Ubuntu:regular,bold&amp;subset=Latin">
	<link href="css/bootstrap.min.css" rel="stylesheet">
	
	<link href="css/style.css" rel="stylesheet">
	
	<!-- Just for debugging purposes. Don't actually copy this line! -->
	<!--[if lt IE 9]><script src="../../docs-assets/js/ie8-responsive-file-warning.js"></script><![endif]-->
	
	<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
	<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
	<script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
	<![endif]-->

</head>

<body>
	<div class="navbar navbar-default navbar-fixed-top" role="navigation">
		<div class="container">
			<div class="navbar-header">
				<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
					<span class="sr-only">Toggle navigation</span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<a class="navbar-brand" href="#about" data-toggle="modal" data-target="#about" style="min-width:6em; height:50px;">Raun<span id="stat"></span></a>
			</div>
			<div class="collapse navbar-collapse">
				<ul class="nav navbar-nav">
					<li><a href="#help" data-toggle="modal" data-target="#help"><span class="glyphicon glyphicon-question-sign"></span> Bantuan</a></li>
					<li class="dropdown">
					<a href="#" class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-wrench"></span>
 Setelan <b class="caret"></b></a>
						<div class="dropdown-menu keep-open">
							<div style="padding:0 1em;">
								<button id="pause" class="btn btn-warning btn-sm"><span class="glyphicon glyphicon-pause"></span> Pause</button>
								<hr>
								Tampilkan:
								<div class="checkbox">
									<label>
									<input type="checkbox" id="show_bot" class="config" value="true">
										<span class="label label-info">Suntingan bot</span>
									</label>
								</div>
								<div class="checkbox">
									<label>
									<input type="checkbox" id="show_anon" class="config" value="true">
										<span class="label label-danger">Suntingan anon</span>
									</label>
								</div>
								<div class="checkbox">
									<label>
									<input type="checkbox" id="show_minor" class="config" value="true">
										<span class="label label-primary">Suntingan kecil</span>
									</label>
								</div>
								<div class="checkbox">
									<label>
									<input type="checkbox" id="show_redirect" class="config" value="true">
										<span class="label label-warning">Halaman pengalihan</span>
									</label>
								</div>
								<div class="checkbox">
									<label>
									<input type="checkbox" id="show_new" class="config" value="true">
										<span class="label label-success">Halaman baru</span>
									</label>
								</div>
							</div>
						</div>
					</li>
					
				</ul>
				<ul class="nav navbar-nav navbar-right">
					<li style="padding:12.5px;"><script id='fbdvsdh'>(function(i){var f,s=document.getElementById(i);f=document.createElement('iframe');f.src='//api.flattr.com/button/view/?uid=kenrick95&button=compact&url='+encodeURIComponent(document.URL);f.title='Flattr';f.height=20;f.width=110;f.style.borderWidth=0;s.parentNode.insertBefore(f,s);})('fbdvsdh');</script></li>
					<li class="dropdown">
					<a href="#" class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-stats"></span>
 Statistik <b class="caret"></b></a>
						<div class="dropdown-menu keep-open">
							<div style="padding:0 1em;">
							<div title="Waktu, dalam UTC" style="text-align:center;">
								<span class="glyphicon glyphicon-time"></span> <span id="tz"></span>
							</div>
							<div id="w_stat">
								 <img src='img/loading.gif' style='width:16px; height:16px;'>
							</div>
							</div>
						</div>
					</li>
				</ul>
			</div><!--/.nav-collapse -->
			
		</div>
	</div>
	
	<div class="container">
	
		<div class="main">
			<div id="def">
				<p class="lead"><b>ra&middot;un</b> <i>v cak</i> berkeliling; ronda; patroli;</p>
			</div>
			<div class="table-responsive">
				<table class="table" id="main-table">
					<thead>
						<tr>
							<th colspan="2" class="col-lg-1 col-md-1 col-sm-1 col-xs-1" nowrap>Waktu (UTC)</th>
							<th class="col-lg-5 col-md-5 col-sm-5 col-xs-5">Halaman</th>
							<th class="col-lg-1 col-md-1 col-sm-1 col-xs-5">Pengguna</th>
							<th class="col-lg-5 col-md-5 col-sm-5 col-xs-5">Keterangan</th>
						</tr>
					</thead>
					<tbody id="main-table-body">
					
					</tbody>
				</table>
			</div>
		</div>
	
	</div><!-- /.container -->
	
	<!-- Modal -->
	<div class="modal fade" id="help" tabindex="-1" role="dialog" aria-labelledby="helpLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title" id="helpLabel">Tentang</h4>
				</div>
				<div class="modal-body">
					<p class="lead"><b>ra&middot;un</b> <i>v cak</i> berkeliling; ronda; patroli;</p>
					<p>Raun adalah alat untuk memantau perubahan terbaru Wikipedia bahasa Indonesia secara langsung (<i>live</i>). Setiap beberapa saat, Raun akan memuat perubahan terbaru tepat di depanmu secara otomatis.</p>
					<p>Anda dapat memause (menghentikan sementara) alat ini dengan mengeklik tombol "Pause". Setelah itu, Anda dapat melanjutkan alat ini dengan mengeklik tombol "Jalan!".
					</p>
					<p>Selain itu, Anda juga dapat mengatur untuk menampilkan jenis suntingan apa saja yang Anda ingin lihat di bagian "Setelan".
					</p>
					<p>Legenda:
					</p>
						<table class="table">
							<thead>
								<tr>
									<th>Warna</th>
									<th>Ruang nama</th>
									<th>Warna</th>
									<th>Ruang nama</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td class="ns-0">&#32;</td>
									<td>Artikel</td>
									<td class="ns-1">&#32;</td>
									<td>Pembicaraan Artikel</td>
								</tr>
								<tr>
									<td class="ns-2">&#32;</td>
									<td>Pengguna</td>
									<td class="ns-3">&#32;</td>
									<td>Pembicaraan Pengguna</td>
								</tr>
								<tr>
									<td class="ns-4">&#32;</td>
									<td>Wikipedia</td>
									<td class="ns-5">&#32;</td>
									<td>Pembicaraan Wikipedia</td>
								</tr>
								<tr>
									<td class="ns-6">&#32;</td>
									<td>Berkas</td>
									<td class="ns-7">&#32;</td>
									<td>Pembicaraan Berkas</td>
								</tr>
								<tr>
									<td class="ns-8">&#32;</td>
									<td>MediaWiki</td>
									<td class="ns-9">&#32;</td>
									<td>Pembicaraan MediaWiki</td>
								</tr>
								<tr>
									<td class="ns-10">&#32;</td>
									<td>Templat</td>
									<td class="ns-11">&#32;</td>
									<td>Pembicaraan Templat</td>
								</tr>
								<tr>
									<td class="ns-12">&#32;</td>
									<td>Bantuan</td>
									<td class="ns-13">&#32;</td>
									<td>Pembicaraan Bantuan</td>
								</tr>
								<tr>
									<td class="ns-14">&#32;</td>
									<td>Kategori</td>
									<td class="ns-15">&#32;</td>
									<td>Pembicaraan Kategori</td>
								</tr>
								<tr>
									<td class="ns-100">&#32;</td>
									<td>Portal</td>
									<td class="ns-101">&#32;</td>
									<td>Pembicaraan Portal</td>
								</tr>
							</tbody>
						</table>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->
	
	<!-- Modal -->
	<div class="modal fade" id="about" tabindex="-1" role="dialog" aria-labelledby="aboutLabel" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title" id="aboutLabel">Tentang</h4>
				</div>
				<div class="modal-body">
					<p class="lead"><b>ra&middot;un</b> <i>v cak</i> berkeliling; ronda; patroli;</p>
					<p>Raun adalah alat untuk memantau perubahan terbaru Wikipedia bahasa Indonesia secara langsung (<i>live</i>). Alat ini terinspirasi dari <a href="http://ivan.lanin.org/ronda">Ronda</a>, oleh Ivan Lanin. Proyek ini dimulai oleh <a href="http://kenrick95.org/">Kenrick</a> (<a href="http://id.wikipedia.org/wiki/Pengguna:Kenrick95">Pengguna:Kenrick95</a>).</p>
					<p>
						<span class="label label-info">Informasi</span> Situs ini menggunakan <a href="https://id.wikipedia.org/wiki/Kuki_HTTP">kuki</a>. Data yang disimpan kuki akan otomatis dihapus jika Anda tidak mengunjungi situs ini dalam 30 hari.
					</p>
					<p>Kredit:
					</p>
						<ul>
							<li><a href="http://ivan.lanin.org/ronda">Ronda</a> (oleh Ivan Lanin)</li>
							<li>Twitter Bootstrap 3.0</li>
							<li>jQuery 1.10.2</li>
							<li>Wikipedia API</li>
						</ul>
					<p>Di luar lisensi kode dan ide yang telah disebutkan, kode proyek ini dilisensikan dengan lisensi MIT</p>
					<p>Kode tersedia di <a href="https://github.com/kenrick95/Raun">github.com/kenrick95/Raun</a></p>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->


	<!-- Bootstrap core JavaScript
	================================================== -->
	<!-- Placed at the end of the document so the pages load faster -->
	<script src="js/jquery-1.10.2.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
	
	
	<script src="js/default.js"></script>
	
</body>
</html>
