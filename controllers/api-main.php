<?php
/*
api-main.php

Contains the functions shared between api-rewrite.php and api-sse-rewrite.php
*/

function recent_changes($limit = 500, $from = '', $to = '')
{
    global $settings;

    if (empty($limit)) {
        $limit = 500;
    }

    $url = $settings['wikiroot'] . "/w/api.php?action=query&format=json";
    $params = "action=query&list=recentchanges&rctype=edit|new&rcprop=title|ids|sizes|flags|user|userid|comment|parsedcomment|timestamp|redirect|loginfo|tags&rclimit=" . $limit;

    if (!empty($from)) {
        $params .= "&rcend=" . $from;
    }

    if (!empty($to)) {
        $params .= "&rcstart=" . $to;
    } else if (!empty($from)) {
        $params .= "&rcstart=" . gmdate("YmdHis");
    }

    $data = httpRequest($url, $params);

    if (empty($data)) {
        throw new Exception("No data received from server. Check that API is enabled.");
    }

    return json_decode($data, true);
}
function statistics()
{
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

function new_pages($limit = 500)
{
    global $settings;

    if (empty($limit)) {
        $limit = 500;
    }

    $url = $settings['wikiroot'] . "/w/api.php?action=query&format=json";
    $params = "action=query&list=recentchanges&rctype=new&rcnamespace=0&rcshow=!redirect&rcprop=title|ids|sizes|flags|user|userid|parsedcomment|timestamp|redirect&rclimit=" . $limit;
    $data = httpRequest($url, $params);

    if (empty($data)) {
        throw new Exception("No data received from server. Check that API is enabled.");
    }
    return json_decode($data, true);
}
function user_list($group = 'editor')
{
    global $settings;

    if (empty($group)) {
        return false;
    }

    $url = $settings['wikiroot'] . "/w/api.php?action=query&format=json";
    $params = "action=query&list=allusers&aulimit=500&augroup=" . $group;
    $data = httpRequest($url, $params);

    if (empty($data)) {
        throw new Exception("No data received from server. Check that API is enabled.");
    }
    return json_decode($data, true);
}
