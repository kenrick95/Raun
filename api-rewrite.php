<?php
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

function new_pages ($limit = 500) {
        global $settings;
		
		if (empty($limit)) {
			$limit = 500;	
		}
		
        $url = $settings['wikiroot'] . "/w/api.php?action=query&format=json";
		
        $params = "action=query&list=recentchanges&rctype=new&rcnamespace=0&rcshow=!redirect&rcprop=title|ids|sizes|flags|user|userid|parsedcomment|timestamp|redirect&rclimit=". $limit;
		
        $data = httpRequest($url, $params);
		
		if (empty($data)) {
			throw new Exception("No data received from server. Check that API is enabled.");
        }

		return json_decode($data, true);
}
function user_list($group = 'editor') {
	global $settings;
		
		if (empty($group)) {
			return false;
		}
		
        $url = $settings['wikiroot'] . "/w/api.php?action=query&format=json";
		
        $params = "action=query&list=allusers&aulimit=500&augroup=".$group;
		
        $data = httpRequest($url, $params);
		
		if (empty($data)) {
			throw new Exception("No data received from server. Check that API is enabled.");
        }

		return json_decode($data, true);
	
}

try {
		global $settings;
		
		// check type
		if (!isset($_POST['type'])) {
			throw new Exception("Please specify the type");
		}
		// check project & language
		if (isset($_POST['project']) && isset($_POST['language'])) {
			if (in_array($_POST['project'], array('wikipedia', 'wikinews', 'wikibooks', 'wiktionary', 'wikiquote', 'wikivoyage', 'wikidata', 'wikimedia', 'wikiversity', 'wikisource', 'mediawiki'))) {
				$settings['wikiroot'] = "http://" . $_POST['language'] . "." . $_POST['project'] . ".org/";
			}
		}
		switch ($_POST['type']) {
			case 'rc':
				$limit = isset($_POST['limit']) ? $_POST['limit'] : '';
				$from = isset($_POST['from']) ? $_POST['from'] : '';
				$to = isset($_POST['to']) ? $_POST['to'] : '';
				
				$rc = recent_changes($limit, $from, $to);
				
				echo json_encode($rc['query']['recentchanges']);
			break;
			case 'log':
				// None yet
				throw new Exception("Feature not implemented");
			break;
			case 'user':
				$user_list = user_list($_POST['group']);
				$user_list = $user_list['query']['allusers'];
				echo json_encode($user_list);
			break;
			case 'stat':
				$statistics = statistics();
				$statistics = $statistics['query']['statistics'];
				echo json_encode($statistics);
			break;
		}
		
} catch (Exception $e) {
		die("FAILED: " . $e->getMessage());
}
?>
