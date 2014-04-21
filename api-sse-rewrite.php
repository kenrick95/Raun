<?php
header("Content-Type: text/event-stream\n\n");
header('Cache-Control: no-cache');
set_time_limit(0);

$settings['wikiroot'] = "http://id.wikipedia.org/";
$settings['cookiefile'] = "cookies.tmp";

function httpRequest($url, $post="") {
	global $settings;
	
	$ch = curl_init();
	//Change the user agent below suitably
	curl_setopt($ch, CURLOPT_USERAGENT, 'Kenrick-Tool/Raun');
	curl_setopt($ch, CURLOPT_URL, ($url));
	curl_setopt( $ch, CURLOPT_ENCODING, "UTF-8" );
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt ($ch, CURLOPT_COOKIEFILE, $settings['cookiefile']);
	curl_setopt ($ch, CURLOPT_COOKIEJAR, $settings['cookiefile']);
	if (!empty($post)) curl_setopt($ch,CURLOPT_POSTFIELDS,$post);
	//UNCOMMENT TO DEBUG TO output.tmp
	//curl_setopt($ch, CURLOPT_VERBOSE, true); // Display communication with server
	//$fp = fopen("output.tmp", "w");
	//curl_setopt($ch, CURLOPT_STDERR, $fp); // Display communication with server
	
	$xml = curl_exec($ch);
	
	if (!$xml) {
		throw new Exception("Error getting data from server ($url): " . curl_error($ch));
	}
	
	curl_close($ch);
	
	return $xml;
}

function recent_changes ($limit = 500, $from = '', $to = '') {
	global $settings;
	
	if (empty($limit)) {
		$limit = 500;	
	}
	
	$url = $settings['wikiroot'] . "/w/api.php?action=query&format=json";
	
	$params = "action=query&list=recentchanges&rctype=edit|new&rcprop=title|ids|sizes|flags|user|userid|comment|parsedcomment|timestamp|redirect|loginfo|tags&rclimit=". $limit;
	
	if (!empty($from)) {
		$params .= "&rcend=".$from;
	}
	
	if (!empty($to)) {
		$params .= "&rcstart=".$to;	
	} else if (!empty($from)) {
		$params .= "&rcstart=".gmdate("YmdHis");
	}
	
	
	$data = httpRequest($url, $params);
	
	if (empty($data)) {
		throw new Exception("No data received from server. Check that API is enabled.");
	}
	
	return json_decode($data, true);
}
function statistics () {
	global $settings;
	
	if (empty($limit)) {
		$limit = 500;	
	}
	
	$url = $settings['wikiroot'] . "/w/api.php?action=query&format=json";
	$params = "&meta=siteinfo&siprop=statistics";
	$data = httpRequest($url, $params);
	
	if (empty($data)) {
		throw new Exception("No data received from server. Check that API is enabled.");
	}
	
	return json_decode($data, true);
	
}

echo "retry: 3000" . PHP_EOL;
while(1) {
	global $settings;
	
	if (isset($_COOKIE['project']) && isset($_COOKIE['language'])) {
		if (in_array($_COOKIE['project'], array('wikipedia', 'wikinews', 'wikibooks', 'wiktionary', 'wikiquote', 'wikivoyage', 'wikidata', 'wikimedia', 'wikiversity', 'wikisource', 'mediawiki'))) {
			$settings['wikiroot'] = "http://" . $_COOKIE['language'] . "." . $_COOKIE['project'] . ".org/";	
		}
	}
	// Recent changes
	$limit = 500;
	$from = isset($_COOKIE['rcfrom']) ? $_COOKIE['rcfrom'] : '';
	$to = '';
	echo "event: debug" . PHP_EOL;
	echo "data: " . json_encode($from). PHP_EOL;
	echo PHP_EOL;
	
	$rc = recent_changes($limit, $from, $to);
	echo "event: rc" . PHP_EOL;
	echo "data: " . json_encode($rc['query']['recentchanges']) . PHP_EOL;
	echo PHP_EOL;
	


	// Statistics
	$statistics = statistics();
	$statistics = $statistics['query']['statistics'];
	
	echo "event: stat" . PHP_EOL;
	echo "data: " . json_encode($statistics) . PHP_EOL;
	echo PHP_EOL;
	
	ob_flush();
	flush();
	sleep(3);

}
?>
