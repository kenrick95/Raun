<?php
$settings['wikiroot'] = "http://id.wikipedia.org/";
$settings['cookiefile'] = "cookies.tmp";
include("api-main.php");
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
