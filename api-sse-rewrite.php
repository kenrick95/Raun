<?php
header("Content-Type: text/event-stream\n\n");
header('Cache-Control: no-cache');
set_time_limit(0);

$settings['wikiroot'] = "http://id.wikipedia.org/";
$settings['cookiefile'] = "cookies.tmp";
include("api-main.php");

$last_rcid = 0;

echo "retry: 5000" . PHP_EOL;
while(1) {
    global $settings;

    // check if entry is valid
    if (isset($_COOKIE['project']) && isset($_COOKIE['language'])) {
        if (in_array($_COOKIE['project'], array('wikipedia', 'wikinews', 'wikibooks', 'wiktionary', 'wikiquote', 'wikivoyage', 'wikidata', 'wikimedia', 'wikiversity', 'wikisource', 'mediawiki'))) {
            $settings['wikiroot'] = "http://" . $_COOKIE['language'] . "." . $_COOKIE['project'] . ".org/"; 
        }
    }

    // Recent changes
    $limit = 500;
    $from = isset($_COOKIE['rcfrom']) ? $_COOKIE['rcfrom'] : '';
    $to = '';
    
    $rc = recent_changes($limit, $from, $to);
    $rc_parsed = $rc['query']['recentchanges'];
    $rc_sent = Array();

    // Some processing first for not sending full chunk of data all the time
    for ($i = 0; $i < sizeof($rc_parsed); $i++) {
        if ($rc_parsed[$i]["rcid"] < $last_rcid) {
            break;
        }
        $rc_sent[$i] = $rc_parsed[$i];
    }
    $last_rcid = $rc_parsed[0]["rcid"];

    echo "event: rc" . PHP_EOL;
    echo "data: " . json_encode($rc_sent) . PHP_EOL;
    echo PHP_EOL;


    // Statistics
    $statistics = statistics();
    $statistics = $statistics['query']['statistics'];
    
    echo "event: stat" . PHP_EOL;
    echo "data: " . json_encode($statistics) . PHP_EOL;
    echo PHP_EOL;
    
    ob_flush();
    flush();
    sleep(5);
}
?>
