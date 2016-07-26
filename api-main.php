<?php
/*
api-main.php

Contains the functions shared between api-rewrite.php and api-sse-rewrite.php
*/

function httpRequest($url, $post="") {
    global $settings;

    $ch = curl_init();
    //Change the user agent below suitably
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
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
?>